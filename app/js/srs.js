// Spaced repetition: FSRS-4.5 memory model (Jarrett Ye et al.) with
// short in-session learning steps for brand-new or forgotten words.
//
// Card shape: { s: stability (days), d: difficulty 1..10, due: ms, last: ms,
//               reps, lapses, st: 0 new | 1 learning | 2 review | 3 relearning }

const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474,
  0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5;
const FACTOR = 19 / 81;
const DAY = 86400000;
export const RETENTION = 0.9;
export const MAX_INTERVAL = 3650;

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export function retrievability(elapsedDays, s) {
  return Math.pow(1 + FACTOR * elapsedDays / s, DECAY);
}

function intervalFor(s, r = RETENTION) {
  return (s / FACTOR) * (Math.pow(r, 1 / DECAY) - 1);
}

const initS = (g) => Math.max(W[g - 1], 0.1);
const initD = (g) => clamp(W[4] - (g - 3) * W[5], 1, 10);

function nextD(d, g) {
  const d1 = d - W[6] * (g - 3);
  return clamp(W[7] * initD(4) + (1 - W[7]) * d1, 1, 10);
}

function recallS(d, s, r, g) {
  const hard = g === 2 ? W[15] : 1;
  const easy = g === 4 ? W[16] : 1;
  return s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy + 1);
}

function forgetS(d, s, r) {
  return Math.min(s, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)));
}

function fuzz(days) {
  if (days < 2.5) return days;
  const f = days < 7 ? 0.15 : days < 20 ? 0.1 : 0.05;
  return days * (1 - f + Math.random() * 2 * f);
}

export function newCard(now = Date.now()) {
  return { s: 0, d: 0, due: now, last: 0, reps: 0, lapses: 0, st: 0 };
}

/**
 * Apply a grade (1 Again, 2 Hard, 3 Good, 4 Easy). Returns the updated card and
 * `again: true` when the word should come back later in the same session.
 */
export function schedule(card, g, now = Date.now()) {
  const c = { ...card };
  const elapsed = c.last ? Math.max(0, (now - c.last) / DAY) : 0;
  let days;
  let again = false;
  if (c.st === 0) {
    c.s = initS(g);
    c.d = initD(g);
    if (g === 1) { c.st = 1; again = true; days = 1 / 1440; }
    else if (g === 2) { c.st = 1; again = true; days = 10 / 1440; }
    else { c.st = 2; days = g === 3 ? 1 : Math.min(4, intervalFor(c.s)); }
  } else if (c.st === 1 || c.st === 3) {
    // short-term step inside a session: keep stability, nudge difficulty
    c.d = nextD(c.d || initD(3), g);
    if (g === 1) { again = true; days = 1 / 1440; c.s = Math.max(0.1, c.s * 0.8); }
    else if (g === 2) { again = true; days = 10 / 1440; }
    else {
      c.st = 2;
      c.s = Math.max(c.s, g === 4 ? initS(4) / 2 : 1);
      days = g === 4 ? Math.max(2, intervalFor(c.s)) : 1;
    }
  } else {
    const r = retrievability(elapsed, Math.max(c.s, 0.1));
    if (g === 1) {
      c.lapses += 1;
      c.s = forgetS(c.d, c.s, r);
      c.d = nextD(c.d, g);
      c.st = 3; again = true; days = 1 / 1440;
    } else {
      c.s = recallS(c.d, c.s, r, g);
      c.d = nextD(c.d, g);
      days = clamp(fuzz(intervalFor(c.s)), 1, MAX_INTERVAL);
    }
  }
  c.reps += 1;
  c.last = now;
  c.due = now + days * DAY;
  return { card: c, again, days };
}

/** Preview the interval each grade would give (for the grade buttons). */
export function preview(card, now = Date.now()) {
  const out = {};
  for (const g of [1, 2, 3, 4]) {
    const r = schedule(card, g, now);
    out[g] = r.days;
  }
  // keep the buttons monotonic (fuzz could otherwise swap Good/Easy)
  if (out[4] < out[3]) out[4] = out[3];
  return out;
}

export function isMature(card) { return card && card.st === 2 && card.s >= 21; }
export function isKnown(card) { return card && card.reps > 0 && card.st !== 0; }
