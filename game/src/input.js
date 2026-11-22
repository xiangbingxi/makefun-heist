// Keyboard and mouse input for THE VELVET VAULT. The game reads this plain
// object every frame; the play-test handle on window.__heist exposes the
// same object, so a test can hold E or place the thief by writing to it.

const KEYMAP = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'sneak',
  ShiftRight: 'sneak',
  KeyE: 'interact',
};

export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    interact: false,
    mouseX: 0,
    mouseY: 0,
    mouseSeen: false,
  };
}

export function attachInput(input, canvas, hooks) {
  const down = (e) => {
    const field = KEYMAP[e.code];
    if (field) {
      input[field] = true;
      e.preventDefault();
    }
    if (e.code === 'KeyP' && hooks.onPause) hooks.onPause();
    if (e.code === 'KeyM' && hooks.onMute) hooks.onMute();
    if (e.code === 'KeyR' && hooks.onRetry) hooks.onRetry();
    if (e.code === 'Enter' && hooks.onConfirm) hooks.onConfirm();
    if (e.code === 'KeyQ' && hooks.onCoinKey) hooks.onCoinKey();
    if (e.code === 'KeyF' && hooks.onSmokeKey) hooks.onSmokeKey();
    if (hooks.onAnyKey) hooks.onAnyKey();
  };
  const up = (e) => {
    const field = KEYMAP[e.code];
    if (field) input[field] = false;
  };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - r.left) / r.width) * canvas.width;
    input.mouseY = ((e.clientY - r.top) / r.height) * canvas.height;
    input.mouseSeen = true;
  });
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * canvas.width;
    const y = ((e.clientY - r.top) / r.height) * canvas.height;
    if (hooks.onCoinToss) hooks.onCoinToss(x, y);
    if (hooks.onAnyKey) hooks.onAnyKey();
  });
}
