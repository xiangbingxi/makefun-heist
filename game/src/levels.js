// Room data for THE VELVET VAULT: three rooms, each with its own palette
// and props, its walls, shadow zones, tiered loot, the big target, the
// exit, patrol guards, sentries, dogs, cameras, lasers and the terminal.
// Every patrol line runs through open floor so no guard ever gets stuck
// on a wall, and no camera sweep covers a crack point.

export const ROOM_W = 1280;
export const ROOM_H = 720;
export const WALL = 28;

export const LEVELS = [
  {
    name: 'The Gallery',
    hint: 'Stick to the shadows. Grab the portrait, then slip out the top door.',
    start: { x: 90, y: 630 },
    palette: {
      floor: '#171a26',
      grid: '#1e2233',
      wall: '#2c3145',
      wallTop: '#3a4058',
      accent: '#ffd34d',
    },
    walls: [
      { x: 300, y: 200, w: 180, h: 60 },
      { x: 300, y: 470, w: 180, h: 60 },
      { x: 700, y: 320, w: 80, h: 80 },
      { x: 950, y: 480, w: 160, h: 50 },
    ],
    shadows: [
      { x: 60, y: 240, w: 180, h: 240 },
      { x: 980, y: 560, w: 180, h: 100 },
    ],
    props: [
      { kind: 'painting', x: 340, y: 28, w: 90, h: 46, color: '#b3543f' },
      { kind: 'painting', x: 700, y: 28, w: 90, h: 46, color: '#3f6fb3' },
      { kind: 'painting', x: 1060, y: 28, w: 90, h: 46, color: '#c9a227' },
      { kind: 'carpet', x: 480, y: 280, w: 320, h: 160, color: '#3d2b52' },
      { kind: 'case', x: 850, y: 120, w: 110, h: 60 },
      { kind: 'case', x: 150, y: 520, w: 110, h: 60 },
      { kind: 'plant', x: 90, y: 90 },
      { kind: 'plant', x: 1190, y: 620 },
      { kind: 'chandelier', x: 640, y: 200 },
    ],
    lasers: [
      { x1: 520, y1: 460, x2: 760, y2: 460, period: 3, on: 1.6, phase: 0 },
    ],
    loot: [
      { x: 150, y: 120, kind: 'gold' },
      { x: 240, y: 90, kind: 'antique' },
      { x: 520, y: 330, kind: 'gem' },
      { x: 850, y: 200, kind: 'gold' },
      { x: 700, y: 560, kind: 'gem' },
      { x: 1050, y: 620, kind: 'antique' },
      { x: 300, y: 640, kind: 'gold' },
      { x: 1150, y: 620, kind: 'gold' },
    ],
    target: {
      x: 1205,
      y: 300,
      door: { x: 1150, y: 300 },
      reach: 60,
      value: 500,
      name: 'Sunset Portrait',
      crackSeconds: 1.6,
    },
    exit: { x: 1176, y: 84, w: 76, h: 40, label: 'EXIT' },
    guards: [
      { name: 'Gallery North', points: [[420, 130], [900, 130]] },
      { name: 'Gallery South', points: [[420, 620], [900, 620]] },
    ],
    sentries: [
      { x: 200, y: 120, base: 0.6, sweep: 0.9 },
    ],
    dogs: [
      { name: 'Rex', points: [[640, 520], [900, 520]] },
    ],
    cameras: [
      { x: 640, y: 70, base: Math.PI / 2, sweep: 0.7, speed: 0.5, range: 300 },
    ],
    terminal: { x: 640, y: 660 },
  },
  {
    name: 'The Vault Hall',
    hint: 'Find the keycard on the patrol line, crack the vault, mind the lasers.',
    start: { x: 90, y: 630 },
    palette: {
      floor: '#122019',
      grid: '#1a2b20',
      wall: '#24382c',
      wallTop: '#33503d',
      accent: '#d8b25c',
    },
    walls: [
      { x: 1020, y: 300, w: 200, h: 120 },
      { x: 500, y: 150, w: 70, h: 70 },
      { x: 500, y: 500, w: 70, h: 70 },
      { x: 750, y: 120, w: 140, h: 50 },
      { x: 250, y: 300, w: 120, h: 80 },
    ],
    shadows: [
      { x: 60, y: 240, w: 160, h: 240 },
      { x: 850, y: 560, w: 200, h: 100 },
    ],
    props: [
      { kind: 'painting', x: 400, y: 28, w: 90, h: 46, color: '#2f7d4f' },
      { kind: 'painting', x: 900, y: 28, w: 90, h: 46, color: '#7d5a2f' },
      { kind: 'carpet', x: 430, y: 430, w: 360, h: 180, color: '#1d3a2a' },
      { kind: 'case', x: 200, y: 150, w: 110, h: 60 },
      { kind: 'case', x: 950, y: 560, w: 110, h: 60 },
      { kind: 'plant', x: 90, y: 90 },
      { kind: 'plant', x: 1190, y: 90 },
      { kind: 'chandelier', x: 400, y: 200 },
      { kind: 'chandelier', x: 880, y: 200 },
    ],
    lasers: [
      { x1: 970, y1: 280, x2: 970, y2: 440, period: 3, on: 1.8, phase: 1 },
    ],
    keycard: { x: 820, y: 360 },
    loot: [
      { x: 150, y: 120, kind: 'gold' },
      { x: 350, y: 250, kind: 'gold' },
      { x: 650, y: 250, kind: 'gem' },
      { x: 900, y: 180, kind: 'gem' },
      { x: 150, y: 600, kind: 'gold' },
      { x: 350, y: 480, kind: 'gem' },
      { x: 500, y: 360, kind: 'antique' },
      { x: 700, y: 550, kind: 'gold' },
      { x: 950, y: 550, kind: 'gold' },
      { x: 1150, y: 620, kind: 'antique' },
    ],
    target: {
      x: 1120,
      y: 360,
      door: { x: 990, y: 360 },
      reach: 60,
      value: 500,
      name: 'Velvet Diamond',
      crackSeconds: 2.6,
    },
    exit: { x: 84, y: 84, w: 76, h: 40, label: 'EXIT' },
    guards: [
      { name: 'Vault Watch', points: [[700, 360], [950, 360]] },
      { name: 'North Patrol', points: [[300, 120], [700, 120]] },
      { name: 'South Patrol', points: [[300, 600], [800, 600]] },
    ],
    sentries: [
      { x: 640, y: 120, base: Math.PI / 2, sweep: 0.9 },
    ],
    dogs: [
      { name: 'Bella', points: [[350, 480], [600, 480]] },
    ],
    cameras: [
      { x: 300, y: 70, base: Math.PI / 2, sweep: 0.7, speed: 0.5, range: 300 },
      { x: 700, y: 70, base: Math.PI / 2, sweep: 0.7, speed: 0.45, range: 300 },
    ],
    terminal: { x: 640, y: 650 },
  },
  {
    name: 'The Penthouse',
    hint: 'The crown sits in the middle of the room. Every eye is on it.',
    start: { x: 90, y: 630 },
    palette: {
      floor: '#221420',
      grid: '#2d1b2c',
      wall: '#3a2438',
      wallTop: '#4d3049',
      accent: '#e8a0a0',
    },
    walls: [
      { x: 600, y: 320, w: 80, h: 80 },
      { x: 200, y: 150, w: 200, h: 60 },
      { x: 880, y: 150, w: 200, h: 60 },
      { x: 200, y: 500, w: 70, h: 70 },
      { x: 1010, y: 500, w: 70, h: 70 },
      { x: 880, y: 560, w: 200, h: 50 },
    ],
    shadows: [
      { x: 60, y: 380, w: 160, h: 200 },
      { x: 1080, y: 60, w: 140, h: 120 },
    ],
    props: [
      { kind: 'painting', x: 300, y: 28, w: 90, h: 46, color: '#8a3f5c' },
      { kind: 'painting', x: 900, y: 28, w: 90, h: 46, color: '#c25e7a' },
      { kind: 'carpet', x: 350, y: 250, w: 300, h: 140, color: '#4a1f2b' },
      { kind: 'carpet', x: 700, y: 480, w: 300, h: 140, color: '#4a1f2b' },
      { kind: 'case', x: 150, y: 250, w: 110, h: 60 },
      { kind: 'plant', x: 90, y: 90 },
      { kind: 'plant', x: 1190, y: 90 },
      { kind: 'plant', x: 90, y: 360 },
      { kind: 'chandelier', x: 400, y: 180 },
      { kind: 'chandelier', x: 880, y: 180 },
    ],
    lasers: [
      { x1: 480, y1: 300, x2: 800, y2: 300, period: 2.6, on: 1.4, phase: 0.5 },
    ],
    loot: [
      { x: 120, y: 120, kind: 'gold' },
      { x: 450, y: 120, kind: 'gold' },
      { x: 640, y: 120, kind: 'antique' },
      { x: 830, y: 120, kind: 'gold' },
      { x: 120, y: 300, kind: 'gem' },
      { x: 1150, y: 300, kind: 'gem' },
      { x: 120, y: 620, kind: 'gold' },
      { x: 450, y: 620, kind: 'gold' },
      { x: 830, y: 660, kind: 'gem' },
      { x: 1150, y: 620, kind: 'antique' },
    ],
    target: {
      x: 640,
      y: 360,
      door: { x: 640, y: 440 },
      reach: 70,
      value: 500,
      name: 'Crown of the House',
      crackSeconds: 2.2,
    },
    exit: { x: 604, y: 60, w: 76, h: 40, label: 'SKYLIGHT' },
    guards: [
      { name: 'Rooftop One', points: [[350, 300], [350, 560]] },
      { name: 'Rooftop Two', points: [[640, 120], [640, 240]] },
      { name: 'Rooftop Three', points: [[930, 300], [930, 480]] },
    ],
    sentries: [
      { x: 120, y: 660, base: -0.3, sweep: 0.9 },
    ],
    dogs: [
      { name: 'Duke', points: [[500, 640], [800, 640]] },
    ],
    cameras: [
      { x: 320, y: 70, base: Math.PI / 2, sweep: 0.7, speed: 0.5, range: 300 },
      { x: 960, y: 70, base: Math.PI / 2, sweep: 0.7, speed: 0.45, range: 300 },
    ],
    terminal: { x: 640, y: 660 },
  },
];

export const START_TOOLS = { coins: 3, smoke: 2 };

export const LOOT_VALUES = { gold: 100, gem: 250, antique: 400 };

export const ALARM = {
  rise: 70,
  drain: 26,
  cameraFactor: 1.25,
  shadowFactor: 0.25,
  laserRate: 60,
  dogBite: 40,
};

export const SPEEDS = {
  walk: 175,
  sneak: 98,
  guardPatrol: 70,
  guardInvestigate: 118,
  dogPatrol: 130,
  dogChase: 230,
};

export const VISION = {
  guardRange: 260,
  guardHalfAngle: 0.61,
  sentryRange: 300,
  sentryHalfAngle: 0.75,
  dogRange: 170,
  dogHalfAngle: 0.75,
  cameraRange: 300,
  cameraHalfAngle: 0.5,
};

export const HEAR = {
  guard: 340,
  dog: 450,
};
