/*
somedays.blue v1
Synaesthetic calendar 2026
Ellen Nickles
*/

const myNumbers = {
  0: "hsla(208, 100%, 97%, 0.95)",  // aliceblue
  1: "hsla(60, 100%, 94%, 0.95)",   // light yellow
  2: "hsla(240, 100%, 50%, 0.95)",  // blue
  3: "hsla(39, 100%, 50%, 0.95)",   // orange
  4: "hsla(0, 100%, 50%, 0.92)",    // red
  5: "hsla(271, 76%, 53%, 0.95)",   // blueviolet
  6: "hsla(300, 100%, 48%, 0.95)",  // magenta variation
  7: "hsla(130, 100%, 28%, 0.95)",  // green variation
  8: "hsla(27, 100%, 50%, 0.95)",   // darker orange
  9: "hsla(348, 83%, 42%, 0.95)",   // crimson
};

const myLetters = {
  a: "hsla(0, 100%, 50%, 0.92)",      // red
  b: "hsla(39, 100%, 50%, 0.95)",     // orange
  c: "#fafa5bf2",                     // yellow
  d: "hsla(130, 98%, 40%, 0.95)",     // green variation
  e: "hsla(240, 100%, 50%, 0.95)",    // blue
  f: "hsla(271, 76%, 53%, 0.95)",     // blueviolet
  g: "hsla(300, 100%, 48%, 0.95)",    // magenta variation
  h: "hsla(39, 100%, 50%, 0.95)",     // orange
  i: "#ffffe0f2",                     // light yellow
  j: "hsla(130, 98%, 40%, 0.95)",     // green
  k: "hsla(240, 100%, 50%, 0.95)",    // blue
  l: "hsla(271, 76%, 53%, 0.95)",     // blueviolet
  m: "hsla(0, 100%, 50%, 0.92)",      // red
  n: "hsla(39, 100%, 50%, 0.95)",     // orange
  o: "#ffffe0f2",                     // light yellow
  p: "hsla(130, 98%, 40%, 0.95)",     // green
  q: "hsla(240, 100%, 50%, 0.95)",    // blue
  r: "hsla(271, 76%, 53%, 0.95)",     // blueviolet
  s: "hsla(240, 100%, 50%, 0.95)",    // blue
  t: "hsla(39, 100%, 50%, 0.95)",     // orange
  u: "#ffffe0f2",                     // light yellow
  v: "hsla(130, 98%, 40%, 0.95)",     // green
  w: "hsla(240, 100%, 50%, 0.95)",    // blue
  x: "hsla(271, 76%, 53%, 0.95)",     // blueviolet
  y: "hsla(300, 100%, 48%, 0.95)",    // magenta variation
  z: "hsla(39, 100%, 50%, 0.95)",     // orange
};

const MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

// Sequence of colors for today: 3 letters of the month abbreviation,
// then the 2 zero-padded digits of the day.
function getCurrentDateColors() {
  const now = new Date();
  const monthLetters = MONTH_NAMES[now.getMonth()];
  const day = String(now.getDate()).padStart(2, '0');
  const colors = [];
  for (const ch of monthLetters) colors.push(myLetters[ch.toLowerCase()]);
  for (const ch of day) colors.push(myNumbers[ch]);
  return colors;
}

// Month half and day half each fill 50% of the width, regardless of how
// many characters live inside — matching the prior layout where the month
// read as ~half the width whether it was 1 or 2 digits. Within each half,
// the characters are evenly spaced (letters: 16.67% each, digits: 25% each).
const BOUNDARIES = [50 / 3, 100 / 3, 50, 75];

// Each transition between two adjacent colors uses a window of this width.
const WINDOW = 15;
// Baseline leftward shift of the window relative to its boundary. The
// gamma-skewed blend pushes the perceived color boundary toward the right
// end of the window, so placing most of the window before the actual
// boundary pulls the perceived boundary back onto it.
const WINDOW_SHIFT = 12.5;
// The last block has no neighbor after it to bleed into. In layouts where
// that makes it read narrow, this extra leftward shift on the preceding
// transition widens it. Set to 0 when the final block already reads at
// its target width without help.
const LAST_BLOCK_EXTRA_SHIFT = 0;

// chroma-interpolated stops for one transition between two adjacent colors,
// with the first and last color pinned to absolute positions across the width.
function transitionStops(prevColor, currColor, startPct, endPct) {
  const colors = chroma
    .scale([prevColor, currColor])
    .mode('oklab')
    .gamma(4)
    .colors(6);
  return colors.map((c, idx) => {
    if (idx === 0) return `${c} ${startPct.toFixed(3)}%`;
    if (idx === colors.length - 1) return `${c} ${endPct.toFixed(3)}%`;
    return c;
  });
}

// One linear-gradient across the whole width: month letters share the
// left 50%, day digits share the right 50%, with color transitions baked
// in. A single element means no panel boundaries and no sub-pixel seams.
function buildGradient(colors) {
  const stops = [`${colors[0]} 0%`];
  for (let i = 1; i < colors.length; i++) {
    const boundary = BOUNDARIES[i - 1];
    const isLast = i === colors.length - 1;
    const shift = WINDOW_SHIFT + (isLast ? LAST_BLOCK_EXTRA_SHIFT : 0);
    const start = boundary - shift;
    const end = boundary + (WINDOW - shift);
    stops.push(...transitionStops(colors[i - 1], colors[i], start, end));
  }
  return `linear-gradient(90deg, ${stops.join(',')})`;
}

function render() {
  const calendarDay = document.querySelector('.calendarDay');
  calendarDay.style.backgroundImage = buildGradient(getCurrentDateColors());
}

window.onload = () => {
  const calendarDay = document.createElement('div');
  calendarDay.className = 'calendarDay';
  document.body.appendChild(calendarDay);
  render();
  setInterval(render, 500);
};