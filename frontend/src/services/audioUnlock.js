// src/services/audioUnlock.js
// Global audio unlocker — called once per session on first user gesture

let audioCtx = null;

export const getSharedAudioContext = () => {
  if (audioCtx && audioCtx.state === "running") return audioCtx;
  
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    
    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    return audioCtx;
  } catch (err) {
    console.warn("[Audio] Context failed:", err.message);
    return null;
  }
};

// Silent unlock — call once on app boot
export const primeAudio = () => {
  const unlock = () => {
    getSharedAudioContext();
    // Remove listeners once unlocked
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
    document.removeEventListener("keydown", unlock);
  };

  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
};