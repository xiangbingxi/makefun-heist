// Boot for THE VELVET VAULT: wires the canvas, the input, the loop and the
// screens together, and hands the test handle to the window.
//
// Screens: title, playing, paused, caught, levelclear, victory. Enter starts
// and advances, R retries a room after being caught, P pauses.
// A ?shot=cover|shadow|vault|win query stages one frozen scene of the real
// game for screenshots and sets window.__shotReady when it has drawn.

import { ROOM_W, ROOM_H } from './levels.js';
import { createGame, startLevel, updateGame, tossCoinAt, dropSmoke } from './engine.js';
import { drawGame } from './render.js';
import { createInput, attachInput } from './input.js';
import { playEvent, playSpottedTick, toggleMuted, unlockAudio } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = ROOM_W;
canvas.height = ROOM_H;
const ctx = canvas.getContext('2d');

const state = createGame();
const input = createInput();
let lastTick = 0;
let lastFrame = performance.now();

window.__heist = { state, input };

function freshRun() {
  state.score = 0;
  state.totalTime = 0;
  startLevel(state, 0);
}

function drainEvents() {
  for (const e of state.events.splice(0)) {
    if (e === 'tick') playSpottedTick();
    else playEvent(e);
  }
}

attachInput(input, canvas, {
  onPause() {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
  },
  onMute() {
    toggleMuted();
  },
  onRetry() {
    if (state.screen === 'caught' || state.screen === 'playing') {
      state.score = state.scoreAtEntry;
      startLevel(state, state.levelIndex);
    }
  },
  onConfirm() {
    if (state.screen === 'title') freshRun();
    else if (state.screen === 'levelclear') startLevel(state, state.levelIndex + 1);
    else if (state.screen === 'victory') freshRun();
    else if (state.screen === 'caught') {
      state.score = state.scoreAtEntry;
      startLevel(state, state.levelIndex);
    } else if (state.screen === 'paused') state.screen = 'playing';
  },
  onCoinToss(x, y) {
    tossCoinAt(state, x, y);
  },
  onCoinKey() {
    if (state.screen !== 'playing') return;
    if (input.mouseSeen) {
      tossCoinAt(state, input.mouseX, input.mouseY);
    } else {
      const p = state.player;
      tossCoinAt(state, p.x + Math.cos(p.angle) * 220, p.y + Math.sin(p.angle) * 220);
    }
  },
  onSmokeKey() {
    dropSmoke(state);
  },
  onAnyKey() {
    unlockAudio();
  },
});

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyShot(state, shot);

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
  lastFrame = now;
  if (state.screen === 'playing' && !state.frozen) {
    updateGame(state, input, dt);
  }
  drainEvents();
  drawGame(ctx, state);
  if (!window.__shotReady) window.__shotReady = true;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
