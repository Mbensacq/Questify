// Sound effects for the game
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export const sounds = {
  taskComplete: () => {
    // Pleasant chime sound
    playTone(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.3), 200); // G5
  },
  
  xpGain: () => {
    // Coin-like sound
    playTone(987.77, 0.05, 'square', 0.2); // B5
    setTimeout(() => playTone(1318.51, 0.1, 'square', 0.2), 50); // E6
  },
  
  levelUp: () => {
    // Fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.4), i * 150);
    });
  },
  
  achievementUnlock: () => {
    // Triumphant sound
    playTone(392, 0.15, 'triangle', 0.3); // G4
    setTimeout(() => playTone(523.25, 0.15, 'triangle', 0.3), 150); // C5
    setTimeout(() => playTone(659.25, 0.15, 'triangle', 0.3), 300); // E5
    setTimeout(() => playTone(783.99, 0.3, 'triangle', 0.4), 450); // G5
  },
  
  questComplete: () => {
    // Epic completion sound
    const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.25), i * 100);
    });
  },
  
  error: () => {
    playTone(200, 0.2, 'sawtooth', 0.2);
  },
  
  click: () => {
    playTone(800, 0.05, 'square', 0.1);
  },
  
  streak: () => {
    // Fire-like ascending sound
    playTone(349.23, 0.1, 'triangle', 0.3); // F4
    setTimeout(() => playTone(440, 0.1, 'triangle', 0.3), 80); // A4
    setTimeout(() => playTone(523.25, 0.15, 'triangle', 0.4), 160); // C5
  },
};

export const playSoundIfEnabled = (soundName: keyof typeof sounds, enabled: boolean = true) => {
  if (enabled && audioContext) {
    // Resume audio context if it was suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    sounds[soundName]();
  }
};
