// Canvas drawing for THE VELVET VAULT: three rooms with their own palettes
// and props, shadow zones, tiered loot, the keycard and the locked vault,
// timed laser grids, cameras, patrol guards, sentries and dogs with
// ray-clipped vision cones, the thief, the tools, the HUD and every screen.

import { ROOM_W, ROOM_H, WALL } from './levels.js';

const TAU = Math.PI * 2;

function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

// Distance along a ray from (ox, oy) in direction (dx, dy) to the nearest
// wall segment, capped at range.
function rayHit(segs, ox, oy, dx, dy, range) {
  let best = range;
  for (const [p, q] of segs) {
    const sx = q.x - p.x;
    const sy = q.y - p.y;
    const denom = cross(dx, dy, sx, sy);
    if (Math.abs(denom) < 1e-9) continue;
    const t = cross(p.x - ox, p.y - oy, sx, sy) / denom;
    const u = cross(p.x - ox, p.y - oy, dx, dy) / denom;
    if (t >= 0 && t <= best && u >= 0 && u <= 1) best = t;
  }
  return best;
}

function conePath(ctx, segs, ox, oy, angle, halfAngle, range, rays) {
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  for (let i = 0; i <= rays; i += 1) {
    const a = angle - halfAngle + (2 * halfAngle * i) / rays;
    const d = rayHit(segs, ox, oy, Math.cos(a), Math.sin(a), range);
    ctx.lineTo(ox + Math.cos(a) * d, oy + Math.sin(a) * d);
  }
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function drawFloor(ctx, level) {
  const pal = level.palette;
  ctx.fillStyle = pal.floor;
  ctx.fillRect(0, 0, ROOM_W, ROOM_H);
  ctx.strokeStyle = pal.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x <= ROOM_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ROOM_H);
    ctx.stroke();
  }
  for (let y = 0; y <= ROOM_H; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ROOM_W, y);
    ctx.stroke();
  }
}

function drawWalls(ctx, level) {
  const pal = level.palette;
  ctx.fillStyle = pal.wall;
  ctx.fillRect(0, 0, ROOM_W, WALL);
  ctx.fillRect(0, ROOM_H - WALL, ROOM_W, WALL);
  ctx.fillRect(0, 0, WALL, ROOM_H);
  ctx.fillRect(ROOM_W - WALL, 0, WALL, ROOM_H);
  for (const w of level.walls) {
    ctx.fillStyle = pal.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = pal.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 4);
  }
  ctx.strokeStyle = pal.wallTop;
  ctx.lineWidth = 2;
  ctx.strokeRect(WALL, WALL, ROOM_W - 2 * WALL, ROOM_H - 2 * WALL);
}

function drawProps(ctx, level) {
  for (const prop of level.props || []) {
    if (prop.kind === 'painting') {
      ctx.fillStyle = '#8a6d2f';
      ctx.fillRect(prop.x - 4, prop.y - 4, prop.w + 8, prop.h + 8);
      ctx.fillStyle = prop.color;
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.strokeStyle = 'rgba(255, 233, 168, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(prop.x + 6, prop.y + 6, prop.w - 12, prop.h - 12);
    } else if (prop.kind === 'carpet') {
      ctx.fillStyle = prop.color;
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.strokeStyle = 'rgba(255, 233, 168, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(prop.x + 8, prop.y + 8, prop.w - 16, prop.h - 16);
    } else if (prop.kind === 'case') {
      ctx.fillStyle = 'rgba(147, 197, 253, 0.16)';
      ctx.fillRect(prop.x, prop.y, prop.w, prop.h);
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(prop.x, prop.y, prop.w, prop.h);
      ctx.fillStyle = '#3a4058';
      ctx.fillRect(prop.x, prop.y + prop.h - 6, prop.w, 6);
    } else if (prop.kind === 'plant') {
      ctx.fillStyle = '#7c4a21';
      ctx.beginPath();
      ctx.arc(prop.x, prop.y + 12, 12, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2f7d4f';
      ctx.beginPath();
      ctx.arc(prop.x - 8, prop.y - 4, 11, 0, TAU);
      ctx.arc(prop.x + 8, prop.y - 6, 12, 0, TAU);
      ctx.arc(prop.x, prop.y - 14, 11, 0, TAU);
      ctx.fill();
    } else if (prop.kind === 'chandelier') {
      ctx.strokeStyle = '#8a6d2f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(prop.x, 28);
      ctx.lineTo(prop.x, prop.y - 10);
      ctx.stroke();
      ctx.save();
      ctx.shadowColor = '#ffd34d';
      ctx.shadowBlur = 22;
      ctx.strokeStyle = '#ffd34d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(prop.x, prop.y, 14, 0, TAU);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath();
      ctx.arc(prop.x, prop.y, 4, 0, TAU);
      ctx.fill();
    }
  }
}

function drawShadows(ctx, level) {
  for (const s of level.shadows) {
    ctx.fillStyle = 'rgba(70, 110, 200, 0.22)';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(120, 160, 255, 0.45)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(s.x, s.y, s.w, s.h);
    ctx.setLineDash([]);
  }
}

function drawLasers(ctx, state) {
  for (const l of state.lasers) {
    const cx = (l.x1 + l.x2) / 2;
    const cy = (l.y1 + l.y2) / 2;
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(l.x1 - 6, l.y1 - 6, 12, 12);
    ctx.fillRect(l.x2 - 6, l.y2 - 6, 12, 12);
    if (l.isOn) {
      ctx.save();
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = l.isOn ? '#ef4444' : '#64748b';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(l.isOn ? 'LASER' : 'laser off', cx, cy - 10);
  }
}

function drawLoot(ctx, state) {
  for (const l of state.loot) {
    if (l.taken) continue;
    if (l.kind === 'gem') {
      ctx.save();
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#22d3ee';
      ctx.translate(l.x, l.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-9, -9, 18, 18);
      ctx.restore();
    } else if (l.kind === 'antique') {
      ctx.save();
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(l.x, l.y, 11, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(l.x - 7, l.y - 3, 14, 3);
    } else {
      ctx.save();
      ctx.shadowColor = '#ffd34d';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffd34d';
      ctx.translate(l.x, l.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-7, -7, 14, 14);
      ctx.restore();
    }
  }
}

function drawKeycard(ctx, state) {
  if (!state.keycard || state.keycard.taken) return;
  const k = state.keycard;
  ctx.save();
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#0891b2';
  roundRect(ctx, k.x - 14, k.y - 9, 28, 18, 3);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#cffafe';
  ctx.fillRect(k.x - 10, k.y - 5, 20, 3);
  ctx.fillStyle = '#cffafe';
  ctx.font = 'bold 10px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('KEYCARD', k.x, k.y - 16);
}

function drawTarget(ctx, state) {
  const t = state.level.target;
  const locked = !!state.level.keycard && !state.hasKeycard;
  ctx.save();
  ctx.shadowColor = '#ffd34d';
  ctx.shadowBlur = 18;
  ctx.fillStyle = state.targetTaken ? '#3a5a3a' : '#ffd34d';
  ctx.translate(t.x, t.y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-11, -11, 22, 22);
  ctx.restore();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(t.name.toUpperCase(), t.x, t.y - 26);
  if (locked) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(t.x, t.y + 24, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Georgia, serif';
    ctx.fillText('!', t.x, t.y + 28);
  }
  if (!state.targetTaken) {
    const door = t.door || { x: t.x, y: t.y };
    ctx.strokeStyle = locked ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 211, 77, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(door.x, door.y, 10, 0, TAU);
    ctx.stroke();
    if (state.crack > 0) {
      ctx.strokeStyle = '#ffd34d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(door.x, door.y, 16, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, state.crack / t.crackSeconds));
      ctx.stroke();
    }
  }
}

function drawExit(ctx, state) {
  const e = state.level.exit;
  const open = state.targetTaken;
  ctx.save();
  if (open) {
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 16;
  }
  ctx.fillStyle = open ? '#22c55e' : '#2f4a35';
  roundRect(ctx, e.x, e.y, e.w, e.h, 6);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = open ? '#062b14' : '#9db8a4';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(e.label, e.x + e.w / 2, e.y + e.h / 2 + 5);
}

function drawTerminal(ctx, state) {
  const t = state.level.terminal;
  if (!t) return;
  const dark = state.now < state.camerasOffUntil;
  ctx.fillStyle = dark ? '#334155' : '#1d4ed8';
  roundRect(ctx, t.x - 26, t.y - 12, 52, 24, 4);
  ctx.fill();
  ctx.fillStyle = '#dbeafe';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(dark ? 'DARK' : 'CAM', t.x, t.y + 4);
  if (state.hack > 0) {
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 20, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, state.hack / 1.5));
    ctx.stroke();
  }
}

function drawCameras(ctx, state) {
  const off = state.now < state.camerasOffUntil;
  for (const c of state.cameras) {
    if (!off) {
      conePath(ctx, state.segs, c.x, c.y, c.angle, 0.5, 300, 18);
      ctx.fillStyle = 'rgba(255, 90, 90, 0.13)';
      ctx.fill();
    }
    ctx.fillStyle = off ? '#475569' : '#1f2937';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 9, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = off ? '#64748b' : '#f87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 9, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x + Math.cos(c.angle) * 14, c.y + Math.sin(c.angle) * 14);
    ctx.stroke();
  }
}

function drawGuards(ctx, state) {
  // Cones were already drawn under the walls; here only the bodies.
  for (const g of state.guards) {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = g.mode === 'search' ? '#fbbf24' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 13, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * 6, g.y + Math.sin(g.angle) * 6, 3.5, 0, TAU);
    ctx.fill();
    if (g.mode === 'search') {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 14px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', g.x, g.y - 20);
    }
  }
}

function drawSentries(ctx, state) {
  // Cones were already drawn under the walls; here only the bodies.
  for (const s of state.sentries) {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 13, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 13, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(s.x + Math.cos(s.angle) * 6, s.y + Math.sin(s.angle) * 6, 3.5, 0, TAU);
    ctx.fill();
  }
}

function drawDogs(ctx, state) {
  // Cones were already drawn under the walls; here only the bodies.
  for (const d of state.dogs) {
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(d.x - 7, d.y - 6);
    ctx.lineTo(d.x - 3, d.y - 15);
    ctx.lineTo(d.x + 1, d.y - 7);
    ctx.closePath();
    ctx.moveTo(d.x + 7, d.y - 6);
    ctx.lineTo(d.x + 3, d.y - 15);
    ctx.lineTo(d.x - 1, d.y - 7);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(d.x, d.y, 10, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = d.mode === 'chase' ? '#ef4444' : '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 10, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(d.x + Math.cos(d.angle) * 5, d.y + Math.sin(d.angle) * 5, 2.5, 0, TAU);
    ctx.fill();
  }
}

function drawPlayer(ctx, state) {
  const p = state.player;
  ctx.save();
  ctx.shadowColor = '#e8ecf5';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#e8ecf5';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#0b0d14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = '#0b0d14';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.angle) * 6, p.y + Math.sin(p.angle) * 6, 3, 0, TAU);
  ctx.fill();
  if (state.sneaking) {
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNEAK', p.x, p.y - 20);
  }
}

function drawCoinAndSmoke(ctx, state) {
  if (state.coin) {
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(state.coin.x, state.coin.y, 6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(state.coin.x, state.coin.y, 6, 0, TAU);
    ctx.stroke();
  }
  for (const s of state.smokes) {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.35)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 90, 0, TAU);
    ctx.fill();
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = 'rgba(8, 10, 18, 0.92)';
  ctx.fillRect(0, 0, ROOM_W, 46);
  ctx.fillStyle = state.level.palette.accent;
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(state.level.name.toUpperCase(), 16, 29);
  ctx.fillStyle = '#9aa5bd';
  ctx.font = 'italic 13px Georgia, serif';
  const objective = state.level.keycard && !state.hasKeycard
    ? 'Find the keycard first'
    : state.targetTaken
      ? 'Target secured — reach the exit!'
      : `Steal the ${state.level.target.name}`;
  ctx.fillText(objective, 210, 28);
  const alarmW = 200;
  const alarmX = 640;
  ctx.fillStyle = '#e8ecf5';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText('ALARM', alarmX - 10, 29);
  ctx.fillStyle = '#3a1520';
  roundRect(ctx, alarmX, 14, alarmW, 18, 4);
  ctx.fill();
  ctx.fillStyle = state.alarm > 70 ? '#ef4444' : '#f97316';
  if (state.alarm > 0) {
    roundRect(ctx, alarmX, 14, alarmW * (state.alarm / 100), 18, 4);
    ctx.fill();
  }
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'left';
  let tools = `coins ${state.coins}   smoke ${state.smoke}`;
  if (state.hasKeycard) tools += '   KEYCARD ✓';
  ctx.fillText(tools, 880, 29);
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`LOOT $${state.score}`, ROOM_W - 16, 29);
  ctx.fillStyle = '#7c8698';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('WASD move · Shift sneak · E hold to crack / hack · Q or click toss coin · F smoke · P pause · M sound', ROOM_W / 2, ROOM_H - 10);
  if (state.toast && state.now < state.toast.until) {
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText(state.toast.text, ROOM_W / 2, 72);
  }
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 7, 14, 0.82)';
  ctx.fillRect(0, 0, ROOM_W, ROOM_H);
  ctx.fillStyle = accent || '#ffd34d';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, ROOM_W / 2, 300);
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '17px Georgia, serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, ROOM_W / 2, 350 + i * 30);
  });
}

export function drawGame(ctx, state) {
  drawFloor(ctx, state.level);
  drawProps(ctx, state.level);
  drawShadows(ctx, state.level);
  // Vision cones first, so the walls cover their clipped edges.
  for (const g of state.guards) {
    conePath(ctx, state.segs, g.x, g.y, g.angle, 0.61, 260, 24);
    ctx.fillStyle = 'rgba(220, 60, 60, 0.20)';
    ctx.fill();
  }
  for (const s of state.sentries) {
    conePath(ctx, state.segs, s.x, s.y, s.angle, 0.75, 300, 24);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.13)';
    ctx.fill();
  }
  for (const d of state.dogs) {
    conePath(ctx, state.segs, d.x, d.y, d.angle, 0.75, 170, 18);
    ctx.fillStyle = 'rgba(217, 119, 6, 0.16)';
    ctx.fill();
  }
  drawLasers(ctx, state);
  drawLoot(ctx, state);
  drawKeycard(ctx, state);
  drawExit(ctx, state);
  drawTerminal(ctx, state);
  drawWalls(ctx, state.level);
  drawTarget(ctx, state);
  drawCameras(ctx, state);
  drawGuards(ctx, state);
  drawSentries(ctx, state);
  drawDogs(ctx, state);
  drawPlayer(ctx, state);
  drawCoinAndSmoke(ctx, state);
  drawHud(ctx, state);

  if (state.screen === 'title') {
    overlay(ctx, 'THE VELVET VAULT', [
      'One thief. Three rooms. One night to take it all.',
      'WASD / arrows move · Shift sneak · E hold to crack the target',
      'Q toss a coin · F smoke · P pause · M sound · R retry the room',
      'Mind the lasers, the dogs and the sentries — and the vault needs a keycard.',
      '',
      'Press Enter to start',
    ]);
  } else if (state.screen === 'paused') {
    overlay(ctx, 'PAUSED', ['Press P to keep going'], '#93c5fd');
  } else if (state.screen === 'caught') {
    overlay(ctx, 'CAUGHT!', ['The alarm filled and the guards closed in.', 'Press R to retry the room'], '#ef4444');
  } else if (state.screen === 'levelclear') {
    overlay(ctx, 'ROOM CLEAR', [
      `Room bonus $${state.levelBonus} · Total $${state.score}`,
      'Press Enter for the next room',
    ], '#4ade80');
  } else if (state.screen === 'victory') {
    overlay(ctx, 'THE VAULT IS YOURS', [
      `Total $${state.score} · Time ${fmtTime(state.totalTime)}`,
      'Three rooms, one night, no alarm left ringing.',
      '',
      'Press Enter to play again',
    ], '#4ade80');
  }
}
