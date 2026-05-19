/*
somedays.blue v1
Synaesthetic calendar 2026
Ellen Nickles
*/

const myColors = [
  "hsla(208, 100%, 97%, 0.95)", // 0 aliceblue
  "hsla(60, 100%, 94%, 0.95)", // 1 light yellow
  "hsla(240, 100%, 50%, 0.95)", // 2 blue
  "hsla(39, 100%, 50%, 0.95)", // 3 orange
  "hsla(0, 100%, 50%, 0.92)", // 4 red
  "hsla(271, 76%, 53%, 0.95)", // 5 blueviolet
  "hsla(300, 100%, 48%, 0.95)", // 6 magenta variation
  "hsla(130, 100%, 28%, 0.95)", // 7 green variation
  "hsla(27, 100%, 50%, 0.95)", // 8 darker orange
  "hsla(348, 83%, 42%, 0.95)", // 9 crimson
];

function getCurrentDateDigits() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = String(now.getDate()).padStart(2, '0');
  return `${month}${day}`;
}

const GRADIENT_END = 45;
// The last digit has no neighbor to bleed into, so its solid color block
// reads narrower than the other digits. Shifting its transition earlier
// widens that block. Higher = wider last block (max ~GRADIENT_END).
const LAST_DIGIT_SHIFT = 18;
// With 4 digits every block should read as an even quarter of the width.
// The gamma-skewed blend pushes each perceived color boundary right of its
// segment line, so all transitions shift left by this same amount to pull
// the boundaries back onto the 25/50/75 quarter marks.
const FOUR_DIGIT_SHIFT = 37;

// chroma-interpolated stops for one digit-to-digit transition, with the
// first and last color pinned to absolute positions across the full width.
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

// One linear-gradient across the whole width: the width is split into equal
// segments, one per digit, with the color transitions baked in. A single
// element means no panel boundaries and therefore no sub-pixel seams.
function buildGradient(digits) {
  const segment = 100 / digits.length;
  const stops = [`${myColors[parseInt(digits[0])]} 0%`];
  for (let i = 1; i < digits.length; i++) {
    const prevColor = myColors[parseInt(digits[i - 1])];
    const currColor = myColors[parseInt(digits[i])];
    const shift = digits.length === 4
      ? FOUR_DIGIT_SHIFT
      : (i === digits.length - 1 ? LAST_DIGIT_SHIFT : 0);
    const start = segment * (i - shift / 100);
    const end = segment * (i + (GRADIENT_END - shift) / 100);
    stops.push(...transitionStops(prevColor, currColor, start, end));
  }
  return `linear-gradient(90deg, ${stops.join(',')})`;
}

function render() {
  const calendarDay = document.querySelector('.calendarDay');
  calendarDay.style.backgroundImage = buildGradient(getCurrentDateDigits());
}

window.onload = () => {
  const calendarDay = document.createElement('div');
  calendarDay.className = 'calendarDay';
  document.body.appendChild(calendarDay);
  render();
  setInterval(render, 500);
};