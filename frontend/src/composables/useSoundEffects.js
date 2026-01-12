import { ref } from 'vue'

// Sound settings stored in localStorage
const SOUND_ENABLED_KEY = 'englearn_sound_enabled'
const isSoundEnabled = ref(localStorage.getItem(SOUND_ENABLED_KEY) !== 'false')

// Audio context singleton
let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  // Resume context if suspended (required by browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

// Play a tone with given frequency and duration
function playTone(frequency, duration, type = 'sine', volume = 0.3) {
  if (!isSoundEnabled.value) return
  
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    // Envelope for smoother sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    console.warn('Sound effect error:', e)
  }
}

// Play a sequence of tones
function playSequence(notes, baseVolume = 0.3) {
  if (!isSoundEnabled.value) return
  
  const ctx = getAudioContext()
  let time = ctx.currentTime
  
  notes.forEach(({ freq, duration, type = 'sine' }) => {
    try {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.type = type
      oscillator.frequency.setValueAtTime(freq, time)
      
      gainNode.gain.setValueAtTime(0, time)
      gainNode.gain.linearRampToValueAtTime(baseVolume, time + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration)
      
      oscillator.start(time)
      oscillator.stop(time + duration)
      
      time += duration * 0.8 // Slight overlap for smoother melody
    } catch (e) {
      console.warn('Sequence sound error:', e)
    }
  })
}

export function useSoundEffects() {
  // Toggle sound on/off
  function toggleSound() {
    isSoundEnabled.value = !isSoundEnabled.value
    localStorage.setItem(SOUND_ENABLED_KEY, isSoundEnabled.value)
    
    // Play a confirmation sound when enabling
    if (isSoundEnabled.value) {
      playClick()
    }
  }
  
  // Success sound - ascending cheerful melody
  function playSuccess() {
    playSequence([
      { freq: 523.25, duration: 0.1 },  // C5
      { freq: 659.25, duration: 0.1 },  // E5
      { freq: 783.99, duration: 0.15 }, // G5
    ], 0.25)
  }
  
  // Error sound - low descending tone
  function playError() {
    playSequence([
      { freq: 311.13, duration: 0.15, type: 'triangle' }, // Eb4
      { freq: 233.08, duration: 0.2, type: 'triangle' },  // Bb3
    ], 0.3)
  }
  
  // Click sound - short percussive
  function playClick() {
    playTone(800, 0.05, 'sine', 0.15)
  }
  
  // Flip sound - whoosh-like effect
  function playFlip() {
    if (!isSoundEnabled.value) return
    
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      oscillator.type = 'sine'
      // Sweep from low to high for flip effect
      oscillator.frequency.setValueAtTime(200, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } catch (e) {
      console.warn('Flip sound error:', e)
    }
  }
  
  // Level up / celebration fanfare
  function playLevelUp() {
    playSequence([
      { freq: 523.25, duration: 0.1 },  // C5
      { freq: 587.33, duration: 0.1 },  // D5
      { freq: 659.25, duration: 0.1 },  // E5
      { freq: 783.99, duration: 0.1 },  // G5
      { freq: 1046.50, duration: 0.25 }, // C6
    ], 0.25)
  }
  
  // Notification chime
  function playNotification() {
    playSequence([
      { freq: 880, duration: 0.1 },   // A5
      { freq: 1108.73, duration: 0.15 }, // C#6
    ], 0.2)
  }
  
  // Step completion - subtle positive feedback
  function playStepComplete() {
    playTone(698.46, 0.1, 'sine', 0.2) // F5
  }
  
  return {
    isSoundEnabled,
    toggleSound,
    playSuccess,
    playError,
    playClick,
    playFlip,
    playLevelUp,
    playNotification,
    playStepComplete
  }
}
