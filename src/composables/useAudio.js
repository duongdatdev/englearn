import { ref } from 'vue'

export function useAudio() {
  const isPlaying = ref(false)
  const audio = ref(null)

  const playAudio = async (word) => {
    if (isPlaying.value) return

    try {
      isPlaying.value = true
      
      // Free Dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        const phonetics = data[0].phonetics
        // Find the first audio available
        let audioUrl = phonetics.find(p => p.audio && p.audio.length > 0)?.audio

        if (audioUrl) {
          // Fix protocol-relative URLs
          if (audioUrl.startsWith('//')) {
            audioUrl = 'https:' + audioUrl
          }

          if (audio.value) {
            audio.value.pause()
            audio.value = null
          }
          
          audio.value = new Audio(audioUrl)
          audio.value.onended = () => {
            isPlaying.value = false
          }
          audio.value.play().catch(e => {
            console.error('Audio play error:', e)
            isPlaying.value = false
          })
        } else {
          console.warn('No audio found for word:', word)
          isPlaying.value = false
        }
      } else {
        console.warn('Word not found in dictionary:', word)
        isPlaying.value = false
      }
    } catch (error) {
      console.error('Error fetching audio:', error)
      isPlaying.value = false
    }
  }

  return {
    isPlaying,
    playAudio
  }
}
