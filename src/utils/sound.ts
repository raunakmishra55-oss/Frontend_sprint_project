// Bleep sound effect using Web Audio API — no external files needed

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Play a classic TV censor bleep sound using oscillators.
 * Creates a 1000Hz sine wave beep that sounds like a broadcast censor tone.
 */
export function playBleepSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.35;

    // Main bleep tone (1000Hz sine — the classic censor beep)
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, now);

    // Gain envelope for a punchy bleep
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01); // Fast attack
    gainNode.gain.setValueAtTime(0.4, now + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Quick release

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (e) {
    console.warn('Could not play bleep sound:', e);
  }
}

/**
 * Play a dramatic "WRONG" buzzer sound for errors.
 */
export function playErrorSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.linearRampToValueAtTime(80, now + 0.3);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.3);
  } catch (e) {
    console.warn('Could not play error sound:', e);
  }
}

/**
 * Play a dramatic slam/impact sound for when the roast begins.
 */
export function playDramaticSlam(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Low impact
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(80, now);
    osc1.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Noise burst
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(200, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.15, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now);
    osc2.stop(now + 0.15);
  } catch (e) {
    console.warn('Could not play slam sound:', e);
  }
}
