import { ref } from 'vue'

export function useAudio() {
  const isPlaying = ref(false)
  const audio = ref(null)

  const playAudio = async (word) => {
    if (isPlaying.value) return

    //Web Speech API
    // Check if Web Speech API is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API is not supported in this browser')
      return
    }

    try {
      isPlaying.value = true
      
      // Cancel any ongoing speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1
      
      utterance.onend = () => {
        isPlaying.value = false
      }
      
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e)
        isPlaying.value = false
      }
      
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Error with speech synthesis:', error)
      isPlaying.value = false
    }

    //Free Dictionary API
    // try {
    //   isPlaying.value = true
    //   
    //   // Free Dictionary API
    //   const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    //   const data = await response.json()

    //   if (Array.isArray(data) && data.length > 0) {
    //     const phonetics = data[0].phonetics
    //     // Find the first audio available
    //     let audioUrl = phonetics.find(p => p.audio && p.audio.length > 0)?.audio

    //     if (audioUrl) {
    //       // Fix protocol-relative URLs
    //       if (audioUrl.startsWith('//')) {
    //         audioUrl = 'https:' + audioUrl
    //       }

    //       if (audio.value) {
    //         audio.value.pause()
    //         audio.value = null
    //       }
    //       
    //       audio.value = new Audio(audioUrl)
    //       audio.value.onended = () => {
    //         isPlaying.value = false
    //       }
    //       audio.value.play().catch(e => {
    //         console.error('Audio play error:', e)
    //         isPlaying.value = false
    //       })
    //     } else {
    //       console.warn('No audio found for word:', word)
    //       isPlaying.value = false
    //     }
    //   } else {
    //     console.warn('Word not found in dictionary:', word)
    //     isPlaying.value = false
    //   }
    // } catch (error) {
    //   console.error('Error fetching audio:', error)
    //   isPlaying.value = false
    // }
  }

  return {
    isPlaying,
    playAudio
  }
}
