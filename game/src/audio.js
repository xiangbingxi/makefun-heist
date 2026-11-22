// Synthesized sound effects for THE VELVET VAULT. No audio files: every
// sound is a short WebAudio oscillator blip, and the AudioContext only
// starts after the player's first key or click.

let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Start the AudioContext after the player's first key or click, so the
// first sound never waits on a gesture.
export function unlockAudio() {
  ensureCtx();
}

function blip(freq, dur, type = 'sine', vol = 0.08, when = 0) {
  const ac = ensureCtx();
  if (!ac || muted) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playEvent(name) {
  if (muted) return;
  switch (name) {
    case 'pickup':
      blip(880, 0.09, 'sine', 0.07);
      blip(1320, 0.12, 'sine', 0.05, 0.06);
      break;
    case 'coin':
      blip(1568, 0.08, 'triangle', 0.06);
      break;
    case 'smoke':
      blip(220, 0.25, 'sine', 0.05);
      break;
    case 'crack':
      blip(523, 0.1, 'triangle', 0.07);
      blip(659, 0.1, 'triangle', 0.07, 0.09);
      blip(784, 0.16, 'triangle', 0.07, 0.18);
      break;
    case 'hack':
      blip(440, 0.08, 'square', 0.04);
      blip(660, 0.12, 'square', 0.04, 0.08);
      break;
    case 'target':
      blip(523, 0.12, 'triangle', 0.08);
      blip(659, 0.12, 'triangle', 0.08, 0.1);
      blip(784, 0.2, 'triangle', 0.08, 0.2);
      break;
    case 'caught':
      blip(392, 0.18, 'sawtooth', 0.06);
      blip(311, 0.18, 'sawtooth', 0.06, 0.15);
      blip(233, 0.3, 'sawtooth', 0.06, 0.3);
      break;
    case 'clear':
      blip(659, 0.12, 'triangle', 0.07);
      blip(880, 0.2, 'triangle', 0.07, 0.1);
      break;
    case 'zap':
      blip(180, 0.15, 'sawtooth', 0.07);
      blip(90, 0.2, 'sawtooth', 0.06, 0.05);
      break;
    case 'keycard':
      blip(1047, 0.1, 'sine', 0.07);
      blip(1319, 0.14, 'sine', 0.07, 0.09);
      break;
    case 'bark':
      blip(300, 0.07, 'square', 0.07);
      blip(260, 0.07, 'square', 0.07, 0.09);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.22, 'triangle', 0.08, i * 0.13));
      break;
    default:
      break;
  }
}

export function playSpottedTick() {
  blip(1100, 0.05, 'square', 0.03);
}
