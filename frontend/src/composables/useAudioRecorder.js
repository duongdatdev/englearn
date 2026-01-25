import { ref } from 'vue'

export function useAudioRecorder() {
  const isRecording = ref(false)
  const audioBlob = ref(null)
  const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const error = ref(null)
  
  let mediaRecorder = null
  let chunks = []

  const startRecording = async () => {
    if (!isSupported) {
      error.value = 'Trình duyệt không hỗ trợ ghi âm.'
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Prefer webm/opus or mp4
      let options = {}
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' }
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' }
      }

      mediaRecorder = new MediaRecorder(stream, options)
      chunks = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        audioBlob.value = new Blob(chunks, { type: mimeType })
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        isRecording.value = false
      }

      mediaRecorder.start()
      isRecording.value = true
      error.value = null
    } catch (err) {
      console.error('Error accessing microphone:', err)
      error.value = 'Không thể truy cập micro. Vui lòng cấp quyền.'
      isRecording.value = false
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    }
  }

  return {
    isSupported,
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording
  }
}
