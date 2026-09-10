// Mysterious entry to the home page: a hylian riddle, then a door, then home.
// Each step transitions through a black veil (fade to black, swap, fade
// back in) rather than a plain crossfade.
// Placeholder answer for now — swap once the real text/riddle is decided.
// Session cookie "Enter" remembers a visitor who reached the door so a
// reload skips straight to home (cleared when the browser session ends —
// no Max-Age/Expires set).
function hasEnteredCookie() {
  return document.cookie.split('; ').some((c) => c.startsWith('Enter='));
}

function markEntered() {
  document.cookie = 'Enter=1; path=/; SameSite=Lax';
}

document.addEventListener('DOMContentLoaded', () => {
  const ANSWER = 'triforce';

  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-answer');
  const error = document.getElementById('gate-error');
  const gate = document.getElementById('gate');
  const door = document.getElementById('door');
  const doorTrigger = document.getElementById('door-trigger');
  const doorPath = document.querySelector('.door__path-plane');
  const home = document.getElementById('home');
  const veil = document.getElementById('veil');

  if (!form || !gate || !door || !doorTrigger || !home || !veil) return;

  if (hasEnteredCookie()) {
    gate.hidden = true;
    door.hidden = true;
    home.hidden = false;
    return;
  }

  // Fades the screen to black, runs `swap` once it's fully dark, then
  // fades back in on whatever `swap` made visible. Uses a timeout as a
  // fallback in case `transitionend` never fires (reduced-motion, a
  // stale cached transition, etc.) so the flow can't get stuck.
  const VEIL_MS = 1800;
  const DOOR_APPROACH_MS = 6000;
  function throughBlack(swap) {
    let done = false;
    const proceed = () => {
      if (done) return;
      done = true;
      swap();
      requestAnimationFrame(() => veil.classList.remove('veil--on'));
    };
    veil.addEventListener('transitionend', proceed, { once: true });
    setTimeout(proceed, VEIL_MS + 100);
    veil.classList.add('veil--on');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim().toLowerCase();

    if (value === ANSWER) {
      error.hidden = true;
      doorTrigger.classList.remove('door__square--near');
      if (doorPath) doorPath.classList.remove('door__path-plane--near');
      throughBlack(() => {
        gate.hidden = true;
        door.hidden = false;
        // Starts small (scale set in CSS) and grows to full size in sync
        // with the veil fading out, so the door — and the path leading to
        // it — feel like they're coming toward you rather than just
        // fading in. Forcing a reflow before adding the class is
        // required — the element was `display:none` a moment ago, so
        // without it the browser has nothing to transition *from* and
        // just jumps straight to the end state.
        // Interactions are held off until it's fully arrived: a :hover
        // triggered mid-scale (filter transition kicking in) is what was
        // making the growth stutter.
        doorTrigger.style.pointerEvents = 'none';
        void doorTrigger.offsetWidth;
        doorTrigger.classList.add('door__square--near');
        if (doorPath) doorPath.classList.add('door__path-plane--near');
        setTimeout(() => { doorTrigger.style.pointerEvents = ''; }, DOOR_APPROACH_MS);
      });
    } else {
      error.hidden = false;
      gate.classList.remove('gate--shake');
      void gate.offsetWidth; // restart the animation
      gate.classList.add('gate--shake');
    }
  });

  doorTrigger.addEventListener('click', () => {
    markEntered();
    throughBlack(() => {
      door.hidden = true;
      home.hidden = false;
    });
  });
});
