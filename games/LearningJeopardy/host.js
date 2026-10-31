/* ============================================================
   The Host — an original pixel-art character who lives beside
   the clue screen. Click him for help. He speaks in text only
   (a typewriter speech bubble); he never plays any sound.
   ============================================================ */

const HOST_SVG = `
<svg viewBox="0 0 16 22" width="120" height="165" shape-rendering="crispEdges" aria-hidden="true">
  <g class="host-mood"><g class="host-figure">
    <rect x="5" y="18" width="2.5" height="3" fill="#1b1b2f"/>
    <rect x="8.5" y="18" width="2.5" height="3" fill="#1b1b2f"/>
    <rect x="4.5" y="21" width="3" height="1" fill="#000"/>
    <rect x="8.5" y="21" width="3" height="1" fill="#000"/>

    <rect x="1.5" y="11" width="2" height="6" fill="#5b2a86"/>
    <rect x="1.5" y="17" width="2" height="1.5" fill="#f1c27d"/>

    <rect x="3.5" y="10" width="9" height="8" fill="#5b2a86"/>
    <rect x="6" y="10" width="4" height="4" fill="#fff"/>
    <rect x="5.5" y="10" width="1" height="5" fill="#3f1c5e"/>
    <rect x="9.5" y="10" width="1" height="5" fill="#3f1c5e"/>
    <rect x="6.5" y="10.2" width="3" height="1" fill="#ffcc33"/>
    <rect x="7.5" y="10" width="1" height="1.4" fill="#e0a800"/>
    <rect x="7.5" y="15" width="1" height="1" fill="#ffcc33"/>

    <rect x="7" y="9" width="2" height="1" fill="#e0ac69"/>
    <rect x="3" y="5" width="1" height="2" fill="#f1c27d"/>
    <rect x="12" y="5" width="1" height="2" fill="#f1c27d"/>
    <rect x="4" y="3" width="8" height="6" fill="#f1c27d"/>

    <rect x="4" y="1" width="8" height="2" fill="#3b2314"/>
    <rect x="6" y="0" width="5" height="1" fill="#3b2314"/>
    <rect x="4" y="3" width="1" height="2" fill="#3b2314"/>
    <rect x="11" y="3" width="1" height="2" fill="#3b2314"/>
    <rect x="5.5" y="4" width="2" height="0.5" fill="#3b2314"/>
    <rect x="8.5" y="4" width="2" height="0.5" fill="#3b2314"/>

    <g class="host-eyes">
      <rect x="6" y="5" width="1" height="1" fill="#000"/>
      <rect x="9" y="5" width="1" height="1" fill="#000"/>
    </g>
    <rect x="5" y="6.5" width="1" height="0.6" fill="#f4a3a3"/>
    <rect x="10" y="6.5" width="1" height="0.6" fill="#f4a3a3"/>
    <rect class="host-mouth-closed" x="7" y="7.2" width="2" height="0.5" fill="#7a2e2e"/>
    <rect class="host-mouth-open" x="7" y="7" width="2" height="1.2" fill="#4a1010"/>

    <g class="host-arm">
      <rect x="12.5" y="11" width="2" height="5" fill="#5b2a86"/>
      <rect x="12.5" y="16" width="2" height="1.5" fill="#f1c27d"/>
      <rect x="13" y="14" width="1" height="2" fill="#333"/>
      <rect x="12.5" y="12.8" width="2" height="1.4" fill="#aaa"/>
    </g>
  </g></g>
</svg>`;

const Host = (() => {
  const TYPE_MS = 18;
  const CHARS_PER_TICK = 2;
  const MOODS = ['talk', 'happy', 'sad', 'idle'];

  let root = null;
  let spriteBtn = null;
  let textEl = null;
  let fullEl = null;
  let captionEl = null;
  let bubbleEl = null;
  let timer = null;
  let fullText = '';
  let askHandler = null;

  const reducedMotion = () =>
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function create() {
    root = document.createElement('div');
    root.className = 'host mood-idle';
    root.innerHTML = `
      <div class="host-bubble is-empty" title="Click to show the full message">
        <div class="host-bubble-scroll">
          <span class="host-bubble-text" aria-hidden="true"></span>
          <span class="sr-only host-bubble-full" role="status" aria-live="polite"></span>
        </div>
      </div>
      <button type="button" class="host-sprite" aria-label="Ask the Host for help">${HOST_SVG}</button>
      <div class="host-caption"></div>
    `;
    spriteBtn = root.querySelector('.host-sprite');
    textEl = root.querySelector('.host-bubble-text');
    fullEl = root.querySelector('.host-bubble-full');
    captionEl = root.querySelector('.host-caption');
    bubbleEl = root.querySelector('.host-bubble');

    spriteBtn.addEventListener('click', () => { if (askHandler) askHandler(); });
    bubbleEl.addEventListener('click', finish);
  }

  function mount(dock) {
    if (!root) create();
    if (root.parentElement !== dock) dock.appendChild(root);
  }

  function setMood(mood) {
    MOODS.forEach((m) => root.classList.remove(`mood-${m}`));
    void root.offsetWidth; // restart one-shot mood animations
    root.classList.add(`mood-${mood}`);
  }

  function finish() {
    if (timer) { clearInterval(timer); timer = null; }
    if (textEl) textEl.textContent = fullText;
    if (root) root.classList.remove('talking');
  }

  function say(text, mood = 'talk') {
    if (!root) create();
    if (timer) { clearInterval(timer); timer = null; }
    fullText = text;
    fullEl.textContent = text;
    bubbleEl.classList.toggle('is-empty', !text);
    setMood(mood);

    if (!text || reducedMotion()) {
      textEl.textContent = text;
      root.classList.remove('talking');
      return;
    }

    root.classList.add('talking');
    let i = 0;
    textEl.textContent = '';
    timer = setInterval(() => {
      i += CHARS_PER_TICK;
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) finish();
    }, TYPE_MS);
  }

  function onAsk(handler) { askHandler = handler; }

  function setCaption(text) { if (captionEl) captionEl.textContent = text; }

  return { mount, say, finish, onAsk, setCaption };
})();
