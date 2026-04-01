// Synthesized sound effects and generative background music using Web Audio API
// No external audio files — everything is generated programmatically

let ctx = null;
let masterGain = null;
let sfxGain = null;
let musicGain = null;
let musicOscs = [];
let musicTimeout = null;
let isMuted = false;
let volume = 0.5;

export function ensureContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = isMuted ? 0 : volume;
    masterGain.connect(ctx.destination);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.8;
    sfxGain.connect(masterGain);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.06;
    musicGain.connect(masterGain);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function osc(type, freq, duration, gainVal = 0.12) {
  ensureContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(gainVal, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  o.connect(g);
  g.connect(sfxGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + duration);
  return { osc: o, gain: g };
}

// --- Sound Effects ---

export function playClick() {
  ensureContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.06);
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  o.connect(g);
  g.connect(sfxGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.06);
}

export function playConnect() {
  osc('sine', 523, 0.15, 0.12);
  osc('sine', 659, 0.15, 0.1);
}

export function playSell() {
  ensureContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(660, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.12);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  o.connect(g);
  g.connect(sfxGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.12);
}

export function playSuccess() {
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    const delay = i * 0.1;
    ensureContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.setValueAtTime(0.15, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
    o.connect(g);
    g.connect(sfxGain);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + 0.2);
  });
}

export function playFail() {
  osc('square', 220, 0.5, 0.1);
  osc('square', 233, 0.5, 0.08);
}

export function playOverload() {
  ensureContext();
  for (let i = 0; i < 3; i++) {
    const delay = i * 0.08;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 800;
    f.Q.value = 10;
    o.type = 'sawtooth';
    o.frequency.value = 150;
    g.gain.setValueAtTime(0.001, ctx.currentTime + delay);
    g.gain.setValueAtTime(0.1, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.04);
    o.connect(f);
    f.connect(g);
    g.connect(sfxGain);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + 0.04);
  }
}

export function playSpikeTraffic() {
  ensureContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(440, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  o.connect(g);
  g.connect(sfxGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.12);
}

export function playTick() {
  osc('sine', 1047, 0.03, 0.05);
}

export function playDeleteEdge() {
  ensureContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(440, ctx.currentTime);
  o.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.08);
  g.gain.setValueAtTime(0.08, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  o.connect(g);
  g.connect(sfxGain);
  o.start(ctx.currentTime);
  o.stop(ctx.currentTime + 0.08);
}

// --- Background Music ---

const CHORDS = [
  [130.81, 164.81, 196.00],  // C3 E3 G3
  [110.00, 130.81, 164.81],  // A2 C3 E3
  [87.31, 110.00, 130.81],   // F2 A2 C3
  [98.00, 123.47, 146.83],   // G2 B2 D3
];

function playMusicCycle() {
  if (!ctx || isMuted) return;

  const cycleDuration = 16; // 4 chords × 4 seconds
  const now = ctx.currentTime;

  CHORDS.forEach((chord, ci) => {
    const chordStart = now + ci * 4;
    const chordEnd = chordStart + 4;

    chord.forEach(freq => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();

      o.type = 'sine';
      o.frequency.value = freq;
      f.type = 'lowpass';
      f.frequency.value = 400;
      f.Q.value = 1;

      // Gentle fade in/out per chord
      g.gain.setValueAtTime(0.001, chordStart);
      g.gain.linearRampToValueAtTime(1, chordStart + 0.5);
      g.gain.setValueAtTime(1, chordEnd - 0.5);
      g.gain.linearRampToValueAtTime(0.001, chordEnd);

      o.connect(f);
      f.connect(g);
      g.connect(musicGain);
      o.start(chordStart);
      o.stop(chordEnd + 0.01);
      musicOscs.push(o);
    });
  });

  musicTimeout = setTimeout(() => {
    musicOscs = [];
    playMusicCycle();
  }, (cycleDuration - 0.5) * 1000);
}

export function startMusic() {
  ensureContext();
  stopMusic();
  if (musicGain) musicGain.gain.setValueAtTime(0.06, ctx.currentTime);
  playMusicCycle();
}

export function stopMusic() {
  if (musicTimeout) {
    clearTimeout(musicTimeout);
    musicTimeout = null;
  }
  musicOscs.forEach(o => {
    try { o.stop(); } catch { /* already stopped */ }
  });
  musicOscs = [];
}

// --- Volume Controls ---

export function setVolume(v) {
  volume = v;
  if (masterGain && !isMuted) masterGain.gain.value = v;
}

export function toggleMute() {
  isMuted = !isMuted;
  if (masterGain) masterGain.gain.value = isMuted ? 0 : volume;
  if (isMuted) stopMusic();
  return isMuted;
}

export function getMuted() {
  return isMuted;
}

export function getVolume() {
  return volume;
}
