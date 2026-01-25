import { ref } from 'vue'

export function useSpeechRecognition() {
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const error = ref(null)
  
  // Browser support check
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const isSupported = !!SpeechRecognition

  let recognition = null
  let silenceTimeout = null

  if (isSupported) {
    recognition = new SpeechRecognition()
    recognition.continuous = true // Keep listening until manually stopped
    recognition.lang = 'en-US'
    recognition.interimResults = true

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
      transcript.value = ''
      interimTranscript.value = ''
    }

    recognition.onend = () => {
      isListening.value = false
      clearTimeout(silenceTimeout)
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interim = ''
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      
      if (finalTranscript) {
        transcript.value = finalTranscript.trim()
        // Auto-stop after getting final result with a small delay
        clearTimeout(silenceTimeout)
        silenceTimeout = setTimeout(() => {
          if (recognition && isListening.value) {
            recognition.stop()
          }
        }, 1500) // Wait 1.5s after final result before stopping
      }
      
      interimTranscript.value = interim
    }

    recognition.onerror = (event) => {
      // Ignore 'no-speech' error - user just didn't say anything
      if (event.error === 'no-speech') {
        error.value = 'Không nghe thấy giọng nói. Hãy thử lại.'
      } else if (event.error === 'audio-capture') {
        error.value = 'Không tìm thấy micro. Vui lòng kiểm tra thiết bị.'
      } else if (event.error === 'not-allowed') {
        error.value = 'Vui lòng cho phép truy cập micro.'
      } else {
        error.value = event.error
      }
      isListening.value = false
    }
  }

  const start = () => {
    if (!isSupported) {
      error.value = 'Trình duyệt không hỗ trợ nhận dạng giọng nói'
      return
    }
    transcript.value = ''
    interimTranscript.value = ''
    error.value = null
    try {
      recognition.start()
    } catch (e) {
      console.error('Recognition error:', e)
    }
  }

  const stop = () => {
    if (recognition && isListening.value) {
      recognition.stop()
    }
    clearTimeout(silenceTimeout)
  }

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop
  }
}
