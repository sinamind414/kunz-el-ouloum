/**
 * Web Audio API synthesizer for interactive learning sound effects
 * This avoids needing external heavy audio files and runs completely offline.
 */

let audioCtx: AudioContext | null = null;

export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('svt_sound_muted') === 'true';
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('svt_sound_muted', muted ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('svt_sound_mute_changed', { detail: { muted } }));
}

export function toggleSoundMute(): boolean {
  const current = isSoundMuted();
  setSoundMuted(!current);
  return !current;
}

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
  if (isSoundMuted()) return;
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
 * Play a rich, celebratory fanfare sound for completing Daily Goals (100%)
 */
export function playDailyGoalCelebrationSound() {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Arpeggio notes: C5, E5, G5, C6, E6
    const notes = [
      { freq: 523.25, start: 0, dur: 0.18, type: 'triangle' as OscillatorType, vol: 0.12 },
      { freq: 659.25, start: 0.10, dur: 0.18, type: 'triangle' as OscillatorType, vol: 0.12 },
      { freq: 783.99, start: 0.20, dur: 0.22, type: 'triangle' as OscillatorType, vol: 0.14 },
      { freq: 1046.50, start: 0.32, dur: 0.55, type: 'sine' as OscillatorType, vol: 0.18 },
      { freq: 1318.51, start: 0.38, dur: 0.65, type: 'sine' as OscillatorType, vol: 0.15 }
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      // Shimmer vibrato on the climax notes
      if (n.dur > 0.4) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(7, now + n.start);
        lfoGain.gain.setValueAtTime(4.0, now + n.start);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now + n.start);
        lfo.stop(now + n.start + n.dur);
      }

      gain.gain.setValueAtTime(0.001, now + n.start);
      gain.gain.linearRampToValueAtTime(n.vol, now + n.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur);
    });

    // Deep warm base thud
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(130.81, now); // C3
    bassOsc.frequency.exponentialRampToValueAtTime(65.41, now + 0.4);

    bassGain.gain.setValueAtTime(0.18, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);

    bassOsc.start(now);
    bassOsc.stop(now + 0.4);

  } catch (error) {
    console.warn("Web Audio API celebration error", error);
  }
}

/**
 * Play a fire / triumphant milestone sound for study streaks (e.g., 3, 7, 14, 30 days)
 */
export function playStreakMilestoneSound(streakDays: number = 7) {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pitch scaling based on streak magnitude
    const pitchOffset = Math.min(6, Math.floor(streakDays / 3)) * 20;

    // Fire spark rising sweep
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(220 + pitchOffset, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(880 + pitchOffset, now + 0.25);

    // Filter to soften the sawtooth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.25);

    sweepGain.gain.setValueAtTime(0.08, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    sweepOsc.connect(filter);
    filter.connect(sweepGain);
    sweepGain.connect(ctx.destination);

    sweepOsc.start(now);
    sweepOsc.stop(now + 0.28);

    // Triumphant multi-chord bells
    const chordNotes = [
      { f: 440 + pitchOffset, t: 0.20, d: 0.45 },
      { f: 554.37 + pitchOffset, t: 0.28, d: 0.50 },
      { f: 659.25 + pitchOffset, t: 0.36, d: 0.55 },
      { f: 880 + pitchOffset, t: 0.46, d: 0.85 },
      { f: 1108.73 + pitchOffset, t: 0.52, d: 0.90 }
    ];

    chordNotes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.001, now + note.t);
      gain.gain.linearRampToValueAtTime(0.14, now + note.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });

    // Sub-bass resonance
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(110, now + 0.2);
    subGain.gain.setValueAtTime(0.15, now + 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now + 0.2);
    subOsc.stop(now + 0.8);

  } catch (error) {
    console.warn("Web Audio API streak error", error);
  }
}

/**
 * Play a quick crisp XP reward coin ping
 */
export function playXPGainSound() {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain1.gain.setValueAtTime(0.09, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.22);
  } catch (e) {
    console.warn("Web Audio error", e);
  }
}

/**
 * Play a short low-pitched error buzz
 */
export function playFailureSound() {
  if (isSoundMuted()) return;
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
