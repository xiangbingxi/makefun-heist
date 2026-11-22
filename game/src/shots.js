// Staged scenes for the screenshots. Each one freezes the game on a single
// frame of the real game — same rooms, same guards, same code — and the
// main loop draws it once and raises window.__shotReady.

import { startLevel } from './engine.js';

function freeze(state) {
  state.frozen = true;
}

export function applyShot(state, name) {
  if (name === 'cover') {
    startLevel(state, 0);
    state.player.x = 480;
    state.player.y = 330;
    state.guards[0].x = 600;
    state.guards[0].y = 130;
    state.guards[0].angle = 0;
    state.guards[1].x = 700;
    state.guards[1].y = 620;
    state.guards[1].angle = Math.PI;
    state.sentries[0].angle = 0.6;
    state.dogs[0].x = 700;
    state.dogs[0].y = 520;
    state.dogs[0].angle = Math.PI;
    state.cameras[0].angle = Math.PI / 2 + 0.3;
    state.lasers[0].t = 0;
    state.lasers[0].isOn = true;
    state.alarm = 32;
    state.score = 200;
    state.screen = 'playing';
    freeze(state);
    return true;
  }
  if (name === 'shadow') {
    startLevel(state, 0);
    state.player.x = 150;
    state.player.y = 360;
    state.sneaking = true;
    state.guards[0].x = 450;
    state.guards[0].y = 360;
    state.guards[0].angle = Math.PI;
    state.dogs[0].x = 800;
    state.dogs[0].y = 520;
    state.dogs[0].angle = Math.PI;
    state.alarm = 8;
    state.score = 100;
    state.screen = 'playing';
    freeze(state);
    return true;
  }
  if (name === 'vault') {
    startLevel(state, 1);
    state.hasKeycard = true;
    if (state.keycard) state.keycard.taken = true;
    state.player.x = 990;
    state.player.y = 360;
    state.crack = 1.6;
    state.guards[0].x = 700;
    state.guards[0].y = 360;
    state.guards[0].angle = 0;
    state.guards[1].x = 500;
    state.guards[1].y = 120;
    state.guards[1].angle = Math.PI / 2;
    state.guards[2].x = 500;
    state.guards[2].y = 600;
    state.guards[2].angle = -Math.PI / 2;
    state.dogs[0].x = 450;
    state.dogs[0].y = 480;
    state.dogs[0].angle = 0;
    state.sentries[0].angle = Math.PI / 2;
    state.lasers[0].t = 2.5;
    state.lasers[0].isOn = false;
    state.alarm = 55;
    state.score = 800;
    state.screen = 'playing';
    freeze(state);
    return true;
  }
  if (name === 'win') {
    startLevel(state, 2);
    state.screen = 'victory';
    state.score = 6120;
    state.totalTime = 367;
    freeze(state);
    return true;
  }
  return false;
}
