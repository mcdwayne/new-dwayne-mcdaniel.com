/* ============================================================
   Tiny chiptune-style sound effects using the Web Audio API.
   Square-wave oscillators only, to mimic an NES pulse channel.
   All tones are original — no copyrighted game audio is used.
   ============================================================ */

let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function beep(freq, startOffset, duration, vol = 0.18, type = 'square') {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + startOffset;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch (e) { /* audio not available — fail silently */ }
}

const SFX = {
  select() { beep(660, 0, 0.08); },
  correct() {
    beep(523, 0, 0.12);
    beep(659, 0.1, 0.12);
    beep(784, 0.2, 0.18);
  },
  wrong() {
    beep(220, 0, 0.18, 0.2, 'sawtooth');
    beep(160, 0.14, 0.22, 0.2, 'sawtooth');
  },
  dailyDouble() {
    [392, 440, 494, 523, 659].forEach((f, i) => beep(f, i * 0.09, 0.12, 0.2));
  },
  roundFanfare() {
    [392, 523, 659, 784].forEach((f, i) => beep(f, i * 0.12, 0.2, 0.2));
  },
  tick() { beep(880, 0, 0.04, 0.1); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => beep(f, i * 0.1, 0.25, 0.22));
  },
};
