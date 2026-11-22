// Core simulation for THE VELVET VAULT: movement and wall collision, guard
// patrol/investigate/search/scan/return, fast dogs that chase, stationary
// sentries with wide sweeping vision, camera sweeps, timed laser grids,
// cone vision with line-of-sight, the alarm meter, tiered loot, the
// keycard-locked vault door, cracking, camera hacking, coin and smoke
// tools, and the win/lose conditions.

import { LEVELS, START_TOOLS, LOOT_VALUES, ALARM, SPEEDS, VISION, HEAR, ROOM_W, ROOM_H, WALL } from './levels.js';

const TAU = Math.PI * 2;
const PLAYER_R = 12;
const GUARD_R = 13;
const DOG_R = 10;
const SCAN_TIME = 2.2;
const CHASE_MEMORY = 2;

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function angleDiff(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Distance from a point to a line segment (for the laser beams).
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / len2;
  t = clamp(t, 0, 1);
  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

// Wall segments for sight tests: the outer bounds plus every obstacle.
function wallSegments(level) {
  const segs = [
    [{ x: WALL, y: WALL }, { x: ROOM_W - WALL, y: WALL }],
    [{ x: ROOM_W - WALL, y: WALL }, { x: ROOM_W - WALL, y: ROOM_H - WALL }],
    [{ x: ROOM_W - WALL, y: ROOM_H - WALL }, { x: WALL, y: ROOM_H - WALL }],
    [{ x: WALL, y: ROOM_H - WALL }, { x: WALL, y: WALL }],
  ];
  for (const w of level.walls) {
    segs.push(
      [{ x: w.x, y: w.y }, { x: w.x + w.w, y: w.y }],
      [{ x: w.x + w.w, y: w.y }, { x: w.x + w.w, y: w.y + w.h }],
      [{ x: w.x + w.w, y: w.y + w.h }, { x: w.x, y: w.y + w.h }],
      [{ x: w.x, y: w.y + w.h }, { x: w.x, y: w.y }],
    );
  }
  return segs;
}

function segHit(ax, ay, bx, by, cx, cy, dx, dy) {
  const rX = bx - ax;
  const rY = by - ay;
  const sX = dx - cx;
  const sY = dy - cy;
  const denom = rX * sY - rY * sX;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((cx - ax) * sY - (cy - ay) * sX) / denom;
  const u = ((cx - ax) * rY - (cy - ay) * rX) / denom;
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return t;
  return null;
}

// True when nothing blocks the straight line from (ax, ay) to (bx, by).
function lineOfSight(segs, ax, ay, bx, by) {
  for (const [p, q] of segs) {
    if (segHit(ax, ay, bx, by, p.x, p.y, q.x, q.y) !== null) return false;
  }
  return true;
}

// Push a circle out of a rectangle, axis by axis.
function resolveCircleRect(p, r, rect) {
  const cx = clamp(p.x, rect.x, rect.x + rect.w);
  const cy = clamp(p.y, rect.y, rect.y + rect.h);
  const dx = p.x - cx;
  const dy = p.y - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return;
  if (d2 > 1e-6) {
    const d = Math.sqrt(d2);
    p.x = cx + (dx / d) * r;
    p.y = cy + (dy / d) * r;
    return;
  }
  const pushLeft = p.x - rect.x;
  const pushRight = rect.x + rect.w - p.x;
  const pushUp = p.y - rect.y;
  const pushDown = rect.y + rect.h - p.y;
  const m = Math.min(pushLeft, pushRight, pushUp, pushDown);
  if (m === pushLeft) p.x = rect.x - r;
  else if (m === pushRight) p.x = rect.x + rect.w + r;
  else if (m === pushUp) p.y = rect.y - r;
  else p.y = rect.y + rect.h + r;
}

function collideWalls(p, r, level) {
  p.x = clamp(p.x, WALL + r, ROOM_W - WALL - r);
  p.y = clamp(p.y, WALL + r, ROOM_H - WALL - r);
  for (const w of level.walls) resolveCircleRect(p, r, w);
}

export function createGame() {
  return {
    screen: 'title',
    levelIndex: 0,
    level: LEVELS[0],
    score: 0,
    scoreAtEntry: 0,
    alarm: 0,
    now: 0,
    levelTime: 0,
    totalTime: 0,
    levelBonus: 0,
    player: { x: 90, y: 630, angle: 0, r: PLAYER_R },
    loot: [],
    guards: [],
    dogs: [],
    sentries: [],
    cameras: [],
    lasers: [],
    keycard: null,
    hasKeycard: false,
    coins: START_TOOLS.coins,
    smoke: START_TOOLS.smoke,
    targetTaken: false,
    crack: 0,
    hack: 0,
    camerasOffUntil: 0,
    coin: null,
    smokes: [],
    toast: null,
    lockToastT: 0,
    events: [],
    frozen: false,
    sneaking: false,
    tickT: 0,
    segs: [],
  };
}

export function startLevel(state, index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.level = level;
  state.screen = 'playing';
  state.alarm = 0;
  state.levelTime = 0;
  state.scoreAtEntry = state.score;
  state.targetTaken = false;
  state.crack = 0;
  state.hack = 0;
  state.camerasOffUntil = 0;
  state.coin = null;
  state.smokes = [];
  state.toast = null;
  state.lockToastT = 0;
  state.hasKeycard = false;
  state.keycard = level.keycard ? { x: level.keycard.x, y: level.keycard.y, taken: false } : null;
  state.player.x = level.start.x;
  state.player.y = level.start.y;
  state.player.angle = 0;
  state.loot = level.loot.map((l) => ({ x: l.x, y: l.y, kind: l.kind, taken: false }));
  state.guards = level.guards.map((g) => ({
    name: g.name,
    points: g.points,
    patrolIndex: 1,
    dir: 1,
    x: g.points[0][0],
    y: g.points[0][1],
    angle: 0,
    mode: 'patrol',
    scanT: 0,
    investigateX: 0,
    investigateY: 0,
    lastSeenX: 0,
    lastSeenY: 0,
    seesPlayer: false,
  }));
  state.dogs = (level.dogs || []).map((d) => ({
    name: d.name,
    points: d.points,
    patrolIndex: 1,
    dir: 1,
    x: d.points[0][0],
    y: d.points[0][1],
    angle: 0,
    mode: 'patrol',
    scanT: 0,
    chaseT: 0,
    biteT: 0,
    investigateX: 0,
    investigateY: 0,
    lastSeenX: 0,
    lastSeenY: 0,
    seesPlayer: false,
  }));
  state.sentries = (level.sentries || []).map((s) => ({
    x: s.x,
    y: s.y,
    base: s.base,
    sweep: s.sweep,
    angle: s.base,
    seesPlayer: false,
  }));
  state.cameras = level.cameras.map((c) => ({
    x: c.x,
    y: c.y,
    base: c.base,
    sweep: c.sweep,
    speed: c.speed,
    range: c.range,
    angle: c.base,
  }));
  state.lasers = (level.lasers || []).map((l) => ({
    x1: l.x1,
    y1: l.y1,
    x2: l.x2,
    y2: l.y2,
    period: l.period,
    on: l.on,
    t: l.phase || 0,
    isOn: false,
    zapT: 0,
  }));
  state.segs = wallSegments(level);
  state.frozen = false;
}

function showToast(state, text, seconds) {
  state.toast = { text, until: state.now + seconds };
}

function nearestTerminal(state) {
  const t = state.level.terminal;
  if (!t) return null;
  if (dist(state.player.x, state.player.y, t.x, t.y) < 60) return t;
  return null;
}

function inShadow(state) {
  const p = state.player;
  return state.level.shadows.some((s) => pointInRect(p.x, p.y, s));
}

function inSmoke(state) {
  const p = state.player;
  return state.smokes.some((s) => dist(p.x, p.y, s.x, s.y) < 90);
}

function canSee(segs, ox, oy, angle, range, halfAngle, px, py) {
  const d = dist(ox, oy, px, py);
  if (d > range) return 0;
  if (Math.abs(angleDiff(Math.atan2(py - oy, px - ox), angle)) > halfAngle) return 0;
  if (!lineOfSight(segs, ox, oy, px, py)) return 0;
  return d;
}

// One vision + alarm pass per frame. Sets every watcher’s seesPlayer flag,
// raises the alarm, and lets a sentry that spots the thief call the nearest
// patrol guard over to search the last seen spot.
function senseAndAlarm(state, dt) {
  const p = state.player;
  const smoked = inSmoke(state);
  const shadowed = inShadow(state);
  let worst = 0;
  const seen = (ox, oy, angle, range, halfAngle) => {
    if (smoked) return 0;
    return canSee(state.segs, ox, oy, angle, range, halfAngle, p.x, p.y);
  };
  const rateFor = (d, range, factor) => ALARM.rise * (0.55 + 0.45 * (1 - d / range)) * factor;

  for (const g of state.guards) {
    const d = seen(g.x, g.y, g.angle, VISION.guardRange, VISION.guardHalfAngle);
    g.seesPlayer = d > 0;
    if (d > 0) {
      g.lastSeenX = p.x;
      g.lastSeenY = p.y;
      if (g.mode !== 'search') g.mode = 'search';
      worst = Math.max(worst, rateFor(d, VISION.guardRange, 1));
    }
  }
  for (const d of state.dogs) {
    const distSeen = seen(d.x, d.y, d.angle, VISION.dogRange, VISION.dogHalfAngle);
    d.seesPlayer = distSeen > 0;
    if (distSeen > 0) {
      d.lastSeenX = p.x;
      d.lastSeenY = p.y;
      if (d.mode !== 'chase') {
        d.mode = 'chase';
        d.chaseT = CHASE_MEMORY;
      }
      worst = Math.max(worst, rateFor(distSeen, VISION.dogRange, 1));
    }
    // A dog that catches the thief barks the alarm up at once.
    if (d.mode === 'chase' && dist(d.x, d.y, p.x, p.y) < 26) {
      d.biteT -= dt;
      if (d.biteT <= 0) {
        d.biteT = 0.5;
        state.alarm = Math.min(100, state.alarm + ALARM.dogBite);
        state.events.push('bark');
      }
    }
  }
  for (const s of state.sentries) {
    const d = seen(s.x, s.y, s.angle, VISION.sentryRange, VISION.sentryHalfAngle);
    s.seesPlayer = d > 0;
    if (d > 0) {
      worst = Math.max(worst, rateFor(d, VISION.sentryRange, 1));
      // A sentry that spots the thief calls the nearest patrolling guard
      // over to search the last seen spot.
      let best = null;
      let bestD = Infinity;
      for (const g of state.guards) {
        if (g.mode !== 'patrol') continue;
        const gd = dist(g.x, g.y, p.x, p.y);
        if (gd < bestD) {
          bestD = gd;
          best = g;
        }
      }
      if (best) {
        best.mode = 'search';
        best.lastSeenX = p.x;
        best.lastSeenY = p.y;
      }
    }
  }
  if (state.now >= state.camerasOffUntil) {
    for (const c of state.cameras) {
      const d = seen(c.x, c.y, c.angle, VISION.cameraRange, VISION.cameraHalfAngle);
      if (d > 0) {
        worst = Math.max(worst, rateFor(d, VISION.cameraRange, ALARM.cameraFactor));
      }
    }
  }
  // Timed laser grids: crossing a lit beam trips the alarm.
  for (const l of state.lasers) {
    l.t = (l.t + dt) % l.period;
    l.isOn = l.t < l.on;
    if (l.isOn && distToSegment(p.x, p.y, l.x1, l.y1, l.x2, l.y2) < 14) {
      worst = Math.max(worst, ALARM.laserRate);
      l.zapT -= dt;
      if (l.zapT <= 0) {
        l.zapT = 0.4;
        state.events.push('zap');
      }
    }
  }

  if (worst > 0) {
    let rate = worst;
    if (state.sneaking) rate *= 0.55;
    if (shadowed) rate *= ALARM.shadowFactor;
    state.alarm = Math.min(100, state.alarm + rate * dt);
    state.tickT -= dt;
    if (state.tickT <= 0) {
      state.tickT = 0.5;
      state.events.push('tick');
    }
  } else {
    state.alarm = Math.max(0, state.alarm - ALARM.drain * dt);
  }
  if (state.alarm >= 100) {
    state.screen = 'caught';
    state.events.push('caught');
  }
}

function moveToward(m, tx, ty, speed, dt, radius, level) {
  const d = dist(m.x, m.y, tx, ty);
  if (d < 1) return true;
  const a = Math.atan2(ty - m.y, tx - m.x);
  m.angle = a;
  const step = Math.min(speed * dt, d);
  m.x += Math.cos(a) * step;
  m.y += Math.sin(a) * step;
  collideWalls(m, radius, level);
  return dist(m.x, m.y, tx, ty) < 6;
}

function updateGuards(state, dt) {
  for (const g of state.guards) {
    if (g.mode === 'patrol') {
      const target = g.points[g.patrolIndex];
      const d = dist(g.x, g.y, target[0], target[1]);
      if (d < 4) {
        if (g.patrolIndex === g.points.length - 1) g.dir = -1;
        else if (g.patrolIndex === 0) g.dir = 1;
        g.patrolIndex += g.dir;
      } else {
        moveToward(g, target[0], target[1], SPEEDS.guardPatrol, dt, GUARD_R, state.level);
      }
    } else if (g.mode === 'investigate') {
      if (moveToward(g, g.investigateX, g.investigateY, SPEEDS.guardInvestigate, dt, GUARD_R, state.level)) {
        g.mode = 'scan';
        g.scanT = SCAN_TIME;
      }
    } else if (g.mode === 'search') {
      // Run to where the thief was last seen; if the thief is visible the
      // spot keeps updating, so this is a chase. On arrival, look around.
      if (g.seesPlayer) {
        g.lastSeenX = state.player.x;
        g.lastSeenY = state.player.y;
      }
      if (moveToward(g, g.lastSeenX, g.lastSeenY, SPEEDS.guardInvestigate, dt, GUARD_R, state.level)) {
        g.mode = 'scan';
        g.scanT = SCAN_TIME;
      }
    } else if (g.mode === 'scan') {
      g.angle += 0.9 * dt;
      g.scanT -= dt;
      if (g.scanT <= 0) g.mode = 'return';
    } else if (g.mode === 'return') {
      let best = 0;
      let bestD = Infinity;
      g.points.forEach((pt, i) => {
        const d = dist(g.x, g.y, pt[0], pt[1]);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      const target = g.points[best];
      if (moveToward(g, target[0], target[1], SPEEDS.guardPatrol, dt, GUARD_R, state.level)) {
        g.patrolIndex = best === g.points.length - 1 ? best - 1 : best + 1;
        g.dir = best === g.points.length - 1 ? -1 : 1;
        g.mode = 'patrol';
      }
    }
  }
}

function updateDogs(state, dt) {
  for (const d of state.dogs) {
    if (d.mode === 'patrol') {
      const target = d.points[d.patrolIndex];
      const dd = dist(d.x, d.y, target[0], target[1]);
      if (dd < 4) {
        if (d.patrolIndex === d.points.length - 1) d.dir = -1;
        else if (d.patrolIndex === 0) d.dir = 1;
        d.patrolIndex += d.dir;
      } else {
        moveToward(d, target[0], target[1], SPEEDS.dogPatrol, dt, DOG_R, state.level);
      }
    } else if (d.mode === 'investigate') {
      if (moveToward(d, d.investigateX, d.investigateY, SPEEDS.dogChase, dt, DOG_R, state.level)) {
        d.mode = 'scan';
        d.scanT = SCAN_TIME;
      }
    } else if (d.mode === 'chase') {
      if (d.seesPlayer) {
        d.lastSeenX = state.player.x;
        d.lastSeenY = state.player.y;
        d.chaseT = CHASE_MEMORY;
      } else {
        d.chaseT -= dt;
        if (d.chaseT <= 0) {
          d.mode = 'search';
          continue;
        }
      }
      moveToward(d, d.lastSeenX, d.lastSeenY, SPEEDS.dogChase, dt, DOG_R, state.level);
    } else if (d.mode === 'search') {
      if (d.seesPlayer) {
        d.lastSeenX = state.player.x;
        d.lastSeenY = state.player.y;
        d.mode = 'chase';
        d.chaseT = CHASE_MEMORY;
      } else if (moveToward(d, d.lastSeenX, d.lastSeenY, SPEEDS.dogChase, dt, DOG_R, state.level)) {
        d.mode = 'scan';
        d.scanT = SCAN_TIME;
      }
    } else if (d.mode === 'scan') {
      d.angle += 1.2 * dt;
      d.scanT -= dt;
      if (d.scanT <= 0) d.mode = 'return';
    } else if (d.mode === 'return') {
      let best = 0;
      let bestD = Infinity;
      d.points.forEach((pt, i) => {
        const dd = dist(d.x, d.y, pt[0], pt[1]);
        if (dd < bestD) {
          bestD = dd;
          best = i;
        }
      });
      const target = d.points[best];
      if (moveToward(d, target[0], target[1], SPEEDS.dogPatrol, dt, DOG_R, state.level)) {
        d.patrolIndex = best === d.points.length - 1 ? best - 1 : best + 1;
        d.dir = best === d.points.length - 1 ? -1 : 1;
        d.mode = 'patrol';
      }
    }
  }
}

function updateSentries(state) {
  for (const s of state.sentries) {
    s.angle = s.base + Math.sin(state.now * 0.6) * s.sweep;
  }
}

function updateCameras(state) {
  for (const c of state.cameras) {
    c.angle = c.base + Math.sin(state.now * c.speed) * c.sweep;
  }
}

function updateLoot(state) {
  const p = state.player;
  for (const l of state.loot) {
    if (!l.taken && dist(p.x, p.y, l.x, l.y) < 26) {
      l.taken = true;
      state.score += LOOT_VALUES[l.kind] || 100;
      state.events.push('pickup');
    }
  }
  if (state.keycard && !state.keycard.taken && dist(p.x, p.y, state.keycard.x, state.keycard.y) < 26) {
    state.keycard.taken = true;
    state.hasKeycard = true;
    state.events.push('keycard');
    showToast(state, 'Keycard acquired — the vault door is open', 3);
  }
}

function updateInteract(state, input, dt) {
  const p = state.player;
  const t = state.level.target;
  // The crack happens at the target's door — the wall the painting hangs
  // on, the vault door, the side of the pedestal — never inside the stone.
  const door = t.door || { x: t.x, y: t.y };
  const reach = t.reach || 48;
  const nearTarget = !state.targetTaken && dist(p.x, p.y, door.x, door.y) < reach;
  const locked = !!state.level.keycard && !state.hasKeycard;
  if (nearTarget && locked) {
    state.crack = 0;
    if (input.interact) {
      state.lockToastT -= dt;
      if (state.lockToastT <= 0) {
        state.lockToastT = 1.5;
        showToast(state, 'Locked — find the keycard first', 1.5);
      }
    }
  } else if (input.interact && nearTarget) {
    state.crack += dt;
    if (state.crack >= t.crackSeconds) {
      state.targetTaken = true;
      state.score += t.value;
      state.events.push('target');
      showToast(state, `${t.name} secured — get to the exit!`, 3);
    }
  } else {
    state.crack = Math.max(0, state.crack - dt * 2);
  }
  const terminal = nearestTerminal(state);
  if (input.interact && terminal && state.now >= state.camerasOffUntil) {
    state.hack += dt;
    if (state.hack >= 1.5) {
      state.camerasOffUntil = state.now + 12;
      state.hack = 0;
      state.events.push('hack');
      showToast(state, 'Cameras dark for 12 seconds', 2.5);
    }
  } else if (!terminal || state.now < state.camerasOffUntil) {
    state.hack = Math.max(0, state.hack - dt * 2);
  }
}

// A tossed coin lands at (x, y) and pulls the nearest guard — and any dog
// in earshot — over to look at it.
export function tossCoinAt(state, x, y) {
  if (state.screen !== 'playing' || state.coins <= 0) return false;
  state.coins -= 1;
  state.coin = {
    x: clamp(x, WALL + 10, ROOM_W - WALL - 10),
    y: clamp(y, WALL + 10, ROOM_H - WALL - 10),
    t: 3,
  };
  state.events.push('coin');
  let best = null;
  let bestD = Infinity;
  for (const g of state.guards) {
    const d = dist(g.x, g.y, state.coin.x, state.coin.y);
    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }
  if (best && bestD < HEAR.guard) {
    best.mode = 'investigate';
    best.investigateX = state.coin.x;
    best.investigateY = state.coin.y;
  }
  for (const d of state.dogs) {
    if (dist(d.x, d.y, state.coin.x, state.coin.y) < HEAR.dog) {
      d.mode = 'investigate';
      d.investigateX = state.coin.x;
      d.investigateY = state.coin.y;
    }
  }
  return true;
}

export function dropSmoke(state) {
  if (state.screen !== 'playing' || state.smoke <= 0) return false;
  state.smoke -= 1;
  state.smokes.push({ x: state.player.x, y: state.player.y, t: 4 });
  state.events.push('smoke');
  return true;
}

export function updateGame(state, input, dt) {
  if (state.screen !== 'playing' || state.frozen) return;
  state.now += dt;
  state.levelTime += dt;
  state.totalTime += dt;

  const p = state.player;
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  if (mx !== 0 || my !== 0) {
    const len = Math.hypot(mx, my);
    mx /= len;
    my /= len;
    p.angle = Math.atan2(my, mx);
  }
  const speed = input.sneak ? SPEEDS.sneak : SPEEDS.walk;
  state.sneaking = !!input.sneak && (mx !== 0 || my !== 0);
  p.x += mx * speed * dt;
  collideWalls(p, PLAYER_R, state.level);
  p.y += my * speed * dt;
  collideWalls(p, PLAYER_R, state.level);

  if (state.coin) {
    state.coin.t -= dt;
    if (state.coin.t <= 0) state.coin = null;
  }
  state.smokes = state.smokes.filter((s) => (s.t -= dt) > 0);

  updateCameras(state);
  updateSentries(state);
  senseAndAlarm(state, dt);
  if (state.screen !== 'playing') return;
  updateGuards(state, dt);
  updateDogs(state, dt);
  updateLoot(state);
  updateInteract(state, input, dt);

  if (state.targetTaken) {
    const e = state.level.exit;
    if (pointInRect(p.x, p.y, e)) {
      const bonus = Math.max(0, 300 - Math.floor(state.levelTime));
      state.levelBonus = bonus;
      state.score += bonus;
      state.events.push('clear');
      if (state.levelIndex + 1 >= LEVELS.length) {
        state.screen = 'victory';
        state.events.push('win');
      } else {
        state.screen = 'levelclear';
      }
    }
  }
}
