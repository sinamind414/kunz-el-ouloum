/**
 * Web Audio API synthesizer for interactive learning sound effects
 * This avoids needing external heavy audio files and runs completely offline.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a pleasant, high-pitched success chime
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
    
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second note harmonizer starting slightly later
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6
    
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);

  } catch (error) {
    console.warn("Web Audio API not supported or blocked by user interaction gesture", error);
  }
}

/**
 * Play a short low-pitched error buzz
 */
export function playFailureSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.25);
  } catch (error) {
    console.warn("Web Audio API error", error);
  }
}

let pirateLoopId: any = null;
let pirateGainNode: GainNode | null = null;

const SHANTY_NOTES = [
  // Drunken Sailor (Classic pirate theme)
  { note: 'D4', dur: 0.28 }, { note: 'D4', dur: 0.28 }, { note: 'D4', dur: 0.28 }, { note: 'D4', dur: 0.56 },
  { note: 'F4', dur: 0.28 }, { note: 'A4', dur: 0.28 }, { note: 'F4', dur: 0.28 },
  { note: 'C4', dur: 0.28 }, { note: 'C4', dur: 0.28 }, { note: 'C4', dur: 0.28 }, { note: 'C4', dur: 0.56 },
  { note: 'E4', dur: 0.28 }, { note: 'G4', dur: 0.28 }, { note: 'E4', dur: 0.28 },
  { note: 'D4', dur: 0.28 }, { note: 'D4', dur: 0.28 }, { note: 'D4', dur: 0.28 }, { note: 'D4', dur: 0.56 },
  { note: 'F4', dur: 0.28 }, { note: 'A4', dur: 0.28 }, { note: 'D5', dur: 0.28 }, { note: 'C5', dur: 0.56 },
  { note: 'A4', dur: 0.28 }, { note: 'G4', dur: 0.28 }, { note: 'E4', dur: 0.28 }, { note: 'D4', dur: 0.84 },
];

const NOTE_FREQS: Record<string, number> = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00
};

export function startPirateMusic(volume: number = 0.08) {
  try {
    const ctx = getAudioContext();
    if (pirateLoopId) return; // already playing
    
    pirateGainNode = ctx.createGain();
    pirateGainNode.gain.setValueAtTime(volume, ctx.currentTime);
    pirateGainNode.connect(ctx.destination);
    
    let noteIndex = 0;
    let nextNoteTime = ctx.currentTime + 0.1;
    
    function playNextNote() {
      if (!pirateGainNode) return;
      const ctxActive = getAudioContext();
      const item = SHANTY_NOTES[noteIndex];
      const freq = NOTE_FREQS[item.note] || 293.66;
      
      const osc = ctxActive.createOscillator();
      const oscGain = ctxActive.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, nextNoteTime);
      
      // Add very subtle vibrato (6Hz) to mimic real concertina/accordion bellow
      const lfo = ctxActive.createOscillator();
      const lfoGain = ctxActive.createGain();
      lfo.frequency.setValueAtTime(6, nextNoteTime);
      lfoGain.gain.setValueAtTime(3.0, nextNoteTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      oscGain.gain.setValueAtTime(0, nextNoteTime);
      oscGain.gain.linearRampToValueAtTime(0.6, nextNoteTime + 0.03);
      oscGain.gain.setValueAtTime(0.6, nextNoteTime + item.dur - 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + item.dur);
      
      osc.connect(oscGain);
      oscGain.connect(pirateGainNode);
      
      lfo.start(nextNoteTime);
      osc.start(nextNoteTime);
      
      lfo.stop(nextNoteTime + item.dur);
      osc.stop(nextNoteTime + item.dur);
      
      // Low organic rhythmic bass drone on the roots (D and C)
      if (noteIndex % 4 === 0) {
        const bassOsc = ctxActive.createOscillator();
        const bassGain = ctxActive.createGain();
        bassOsc.type = 'triangle';
        
        const filter = ctxActive.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, nextNoteTime);
        
        const bassFreq = item.note.startsWith('C') ? 130.81 : 146.83; // C3 vs D3
        bassOsc.frequency.setValueAtTime(bassFreq, nextNoteTime);
        
        bassGain.gain.setValueAtTime(0, nextNoteTime);
        bassGain.gain.linearRampToValueAtTime(0.3, nextNoteTime + 0.08);
        bassGain.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + item.dur * 1.8);
        
        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(pirateGainNode);
        
        bassOsc.start(nextNoteTime);
        bassOsc.stop(nextNoteTime + item.dur * 1.8);
      }
      
      nextNoteTime += item.dur;
      noteIndex = (noteIndex + 1) % SHANTY_NOTES.length;
      
      const delay = (nextNoteTime - ctxActive.currentTime) * 1000 - 30;
      pirateLoopId = setTimeout(playNextNote, Math.max(10, delay));
    }
    
    playNextNote();
  } catch (error) {
    console.warn("Failed to play pirate music:", error);
  }
}

export function stopPirateMusic() {
  if (pirateLoopId) {
    clearTimeout(pirateLoopId);
    pirateLoopId = null;
  }
  if (pirateGainNode) {
    try {
      const ctx = getAudioContext();
      pirateGainNode.gain.setValueAtTime(pirateGainNode.gain.value, ctx.currentTime);
      pirateGainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      const nodeToDisconnect = pirateGainNode;
      setTimeout(() => {
        try {
          nodeToDisconnect.disconnect();
        } catch (e) {}
      }, 350);
      pirateGainNode = null;
    } catch (e) {
      pirateGainNode = null;
    }
  }
}

/**
 * Play a light subtle flip click

 */
export function playFlipSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (error) {
    console.warn("Web Audio API error", error);
  }
}
