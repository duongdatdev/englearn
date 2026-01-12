<template>
    <div class="learn-card">
        <!-- Progress Steps -->
        <div class="step-indicators">
            <div class="step-indicator" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
                <span class="step-number">1</span>
                <span class="step-label">Xem từ</span>
            </div>
            <div class="step-connector" :class="{ active: currentStep >= 2 }"></div>
            <div class="step-indicator" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
                <span class="step-number">2</span>
                <span class="step-label">Nghe</span>
            </div>
            <div class="step-connector" :class="{ active: currentStep >= 3 }"></div>
            <div class="step-indicator" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
                <span class="step-number">3</span>
                <span class="step-label">Ghi nhớ</span>
            </div>
            <div class="step-connector" :class="{ active: currentStep >= 4 }"></div>
            <div class="step-indicator" :class="{ active: currentStep >= 4 }">
                <span class="step-number">4</span>
                <span class="step-label">Đặt câu</span>
            </div>
        </div>

        <!-- Step 1: View Word -->
        <div class="step-content" v-if="currentStep === 1">
            <div class="word-display card">
                <div class="word-main">
                    <h2 class="word-english">{{ word.english }}</h2>
                    <button class="btn-audio" @click="playWordAudio">
                        <FeatherIcon type="volume-2" :size="20" />
                    </button>
                </div>
                <p class="word-pronunciation" v-if="word.pronunciation">{{ word.pronunciation }}</p>
                <div class="word-divider"></div>
                <p class="word-vietnamese">{{ word.vietnamese }}</p>
                <p class="word-meaning" v-if="word.meaning">{{ word.meaning }}</p>

                <div class="word-details" v-if="word.example || word.grammar">
                    <div class="detail-item" v-if="word.example">
                        <span class="detail-label">
                            <FeatherIcon type="edit-3" :size="14" /> Ví dụ
                        </span>
                        <p class="detail-content">{{ word.example }}</p>
                    </div>
                    <div class="detail-item" v-if="word.grammar">
                        <span class="detail-label">
                            <FeatherIcon type="type" :size="14" /> Ngữ pháp
                        </span>
                        <p class="detail-content">{{ word.grammar }}</p>
                    </div>
                    <div class="detail-item" v-if="word.wordForms">
                        <span class="detail-label">
                            <FeatherIcon type="list" :size="14" /> Word Forms
                        </span>
                        <p class="detail-content mono">{{ word.wordForms }}</p>
                    </div>
                </div>
            </div>

            <div class="step-action">
                <p class="step-hint" v-if="!canProceed">
                    <FeatherIcon type="clock" :size="14" /> Đọc kỹ thông tin... ({{ countdown }}s)
                </p>
                <button class="btn btn-primary btn-lg" @click="goToStep(2)" :disabled="!canProceed">
                    <FeatherIcon type="headphones" :size="18" /> Tiếp theo: Nghe phát âm
                </button>
            </div>
        </div>

        <!-- Step 2: Listen & Repeat -->
        <div class="step-content" v-if="currentStep === 2">
            <div class="listen-display card">
                <div class="listen-icon-wrapper">
                    <div class="listen-icon" :class="{ playing: isPlaying }">
                        <FeatherIcon type="headphones" :size="48" />
                    </div>
                </div>

                <h2 class="word-english large">{{ word.english }}</h2>
                <p class="word-pronunciation large" v-if="word.pronunciation">{{ word.pronunciation }}</p>

                <div class="listen-actions">
                    <button class="btn btn-secondary btn-icon-text" @click="playWordAudio">
                        <FeatherIcon type="volume-2" :size="20" />
                        Nghe lại
                    </button>
                    <button class="btn btn-secondary btn-icon-text" @click="playWordAudio">
                        <FeatherIcon type="mic" :size="20" />
                        Nhắc theo
                    </button>
                </div>

                <p class="listen-instruction">
                    <FeatherIcon type="info" :size="16" />
                    Hãy nghe và nhắc lại từ này nhiều lần để ghi nhớ phát âm
                </p>
            </div>

            <div class="step-action">
                <button class="btn btn-ghost" @click="goToStep(1)">
                    <FeatherIcon type="arrow-left" :size="16" /> Quay lại
                </button>
                <button class="btn btn-primary btn-lg" @click="startQuiz">
                    <FeatherIcon type="zap" :size="18" /> Tiếp theo: Kiểm tra
                </button>
            </div>
        </div>

        <!-- Step 3: Quiz -->
        <div class="step-content" v-if="currentStep === 3">
            <div class="quiz-display card">
                <div class="quiz-question">
                    <FeatherIcon type="help-circle" :size="24" class="quiz-icon" />
                    <p class="quiz-prompt">{{ quizPrompt }}</p>
                </div>

                <!-- Multiple Choice -->
                <div class="quiz-options" v-if="quizType === 'choice'">
                    <button v-for="(option, index) in quizOptions" :key="index" class="quiz-option" :class="{
                        selected: selectedAnswer === index,
                        correct: showResult && index === correctAnswerIndex,
                        wrong: showResult && selectedAnswer === index && selectedAnswer !== correctAnswerIndex
                    }" @click="selectAnswer(index)" :disabled="showResult">
                        <span class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}</span>
                        {{ option }}
                    </button>
                </div>

                <!-- Type Answer -->
                <div class="quiz-input" v-else>
                    <input type="text" v-model="typedAnswer" class="input input-lg" :class="{ 'input-error': showWrongAttempt }"
                        :placeholder="inputPlaceholder"
                        @keyup.enter="checkTypedAnswer" :disabled="isCorrect" ref="answerInput" />
                    <button class="btn btn-primary" @click="checkTypedAnswer"
                        :disabled="!typedAnswer.trim() || isCorrect">
                        Kiểm tra
                    </button>
                </div>

                <!-- Wrong Attempt Message -->
                <div class="quiz-result wrong" v-if="showWrongAttempt && !isCorrect">
                    <FeatherIcon type="x-circle" :size="24" />
                    <div class="result-content">
                        <p class="result-title">Chưa đúng! Hãy thử lại.</p>
                        <p class="result-hint" v-if="attemptCount >= 2">
                            <FeatherIcon type="info" :size="14" />
                            Gợi ý: Bắt đầu bằng chữ "<strong>{{ correctAnswer.charAt(0).toUpperCase() }}</strong>"
                        </p>
                        <p class="result-answer" v-if="attemptCount >= 3">
                            Đáp án đúng: <strong>{{ correctAnswer }}</strong>
                        </p>
                    </div>
                </div>
                
                <!-- Correct Result -->
                <div class="quiz-result correct" v-if="isCorrect">
                    <FeatherIcon type="check-circle" :size="24" />
                    <div class="result-content">
                        <p class="result-title">Chính xác!</p>
                    </div>
                </div>
            </div>

            <div class="step-action">
                <button class="btn btn-ghost" @click="goToStep(2)" v-if="!isCorrect">
                    <FeatherIcon type="arrow-left" :size="16" /> Quay lại
                </button>
                <button class="btn btn-primary btn-lg" @click="goToSentenceStep" v-if="isCorrect">
                    <FeatherIcon type="edit-3" :size="18" />
                    Tiếp: Đặt câu
                </button>
            </div>
        </div>

        <!-- Step 4: Write Sentence -->
        <div class="step-content" v-if="currentStep === 4">
            <div class="sentence-display card">
                <div class="sentence-header">
                    <FeatherIcon type="edit-3" :size="24" class="sentence-icon" />
                    <div>
                        <h3 class="sentence-title">Đặt câu với từ vựng</h3>
                        <p class="sentence-subtitle">Viết một câu tiếng Anh sử dụng từ: <strong>{{ word.english
                                }}</strong></p>
                    </div>
                </div>

                <div class="word-reminder">
                    <span class="word-reminder-english">{{ word.english }}</span>
                    <span class="word-reminder-divider">→</span>
                    <span class="word-reminder-vietnamese">{{ word.vietnamese }}</span>
                </div>

                <div class="sentence-input-wrapper">
                    <textarea v-model="userSentence" class="sentence-textarea"
                        placeholder="Ví dụ: I need to confirm my appointment." :disabled="isGrading || showGradeResult"
                        ref="sentenceInput" rows="3"></textarea>
                </div>

                <!-- Grading Loading -->
                <div class="grading-loading" v-if="isGrading">
                    <FeatherIcon type="loader" :size="20" class="spin" />
                    <span>AI đang chấm điểm...</span>
                </div>

                <!-- Grading Result -->
                <div class="grading-result" v-if="showGradeResult" :class="gradeResultClass">
                    <div class="grade-score-wrapper">
                        <div class="grade-score">
                            <span class="score-value">{{ gradeResult.score }}</span>
                            <span class="score-max">/100</span>
                        </div>
                        <span class="grade-label">{{ gradeLabel }}</span>
                    </div>

                    <div class="grade-feedback">
                        <FeatherIcon type="message-circle" :size="16" />
                        <p>{{ gradeResult.feedback }}</p>
                    </div>

                    <div class="grade-corrected" v-if="gradeResult.correctedSentence">
                        <span class="corrected-label">
                            <FeatherIcon type="check-circle" :size="14" /> Câu đúng:
                        </span>
                        <p class="corrected-text">{{ gradeResult.correctedSentence }}</p>
                    </div>

                    <div class="grade-tips" v-if="gradeResult.tips">
                        <span class="tips-label">
                            <FeatherIcon type="star" :size="14" /> Mẹo:
                        </span>
                        <p class="tips-text">{{ gradeResult.tips }}</p>
                    </div>
                </div>

                <!-- Grading Error -->
                <div class="grading-error" v-if="gradeError">
                    <FeatherIcon type="alert-circle" :size="16" />
                    <span>{{ gradeError }}</span>
                </div>
            </div>

            <div class="step-action">
                <button class="btn btn-ghost" @click="skipSentence" v-if="!showGradeResult">
                    Bỏ qua
                </button>
                <button class="btn btn-primary btn-lg" @click="gradeSentence" v-if="!showGradeResult"
                    :disabled="!userSentence.trim() || isGrading">
                    <FeatherIcon type="cpu" :size="18" /> Chấm điểm
                </button>
                <button class="btn btn-secondary" @click="retrySentence" v-if="showGradeResult">
                    <FeatherIcon type="refresh-cw" :size="16" /> Viết lại
                </button>
                <button class="btn btn-primary btn-lg" @click="completeWord" v-if="showGradeResult">
                    <FeatherIcon type="arrow-right" :size="18" />
                    {{ isCorrect ? 'Từ tiếp theo' : 'Học lại từ này' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useAudio } from '../composables/useAudio.js'
import { useSoundEffects } from '../composables/useSoundEffects.js'
import { api } from '../services/api.js'
import FeatherIcon from './FeatherIcon.vue'

const { playSuccess, playError, playClick, playLevelUp, playStepComplete } = useSoundEffects()

const props = defineProps({
    word: {
        type: Object,
        required: true
    },
    allWords: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['complete', 'retry'])

const currentStep = ref(1)
const canProceed = ref(false)
const countdown = ref(3)

// Quiz state
const quizType = ref('choice') // 'choice' or 'type'
const quizOptions = ref([])
const selectedAnswer = ref(null)
const typedAnswer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)
const correctAnswerIndex = ref(0)
const showWrongAttempt = ref(false)
const attemptCount = ref(0)
const answerInput = ref(null)

// Step 4: Sentence grading state
const userSentence = ref('')
const sentenceInput = ref(null)
const isGrading = ref(false)
const showGradeResult = ref(false)
const gradeResult = ref({ score: 0, feedback: '', correctedSentence: '', tips: '' })
const gradeError = ref('')

const { isPlaying, playAudio } = useAudio()

const quizPrompt = computed(() => {
    if (quizType.value === 'choice') {
        return `"${props.word.vietnamese}" trong tiếng Anh là gì?`
    }
    return `Gõ từ tiếng Anh có nghĩa "${props.word.vietnamese}"`
})

const inputPlaceholder = computed(() => 'Gõ từ tiếng Anh...')

const correctAnswer = computed(() => props.word.english)

// Computed for grade result styling
const gradeResultClass = computed(() => {
    const score = gradeResult.value.score
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
})

const gradeLabel = computed(() => {
    const score = gradeResult.value.score
    if (score >= 90) return 'Xuất sắc!'
    if (score >= 70) return 'Tốt!'
    if (score >= 50) return 'Khá'
    return 'Cần cải thiện'
})

function playWordAudio() {
    playAudio(props.word.english)
}

function goToStep(step) {
    currentStep.value = step
    playClick()
    if (step === 1) {
        startCountdown()
    }
}

function startCountdown() {
    canProceed.value = false
    countdown.value = 3
    const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
            clearInterval(timer)
            canProceed.value = true
        }
    }, 1000)
}

function startQuiz() {
    currentStep.value = 3
    selectedAnswer.value = null
    typedAnswer.value = ''
    showResult.value = false
    isCorrect.value = false
    showWrongAttempt.value = false
    attemptCount.value = 0

    // Randomly choose quiz type
    quizType.value = Math.random() > 0.5 ? 'choice' : 'type'

    if (quizType.value === 'choice') {
        generateQuizOptions()
    } else {
        nextTick(() => {
            answerInput.value?.focus()
        })
    }
}

function generateQuizOptions() {
    const options = [props.word.english]
    const otherWords = props.allWords.filter(w => w.id !== props.word.id)

    // Shuffle and pick 3 random wrong answers
    const shuffled = otherWords.sort(() => Math.random() - 0.5)
    for (let i = 0; i < 3 && i < shuffled.length; i++) {
        options.push(shuffled[i].english)
    }

    // Shuffle options and remember correct index
    quizOptions.value = options.sort(() => Math.random() - 0.5)
    correctAnswerIndex.value = quizOptions.value.indexOf(props.word.english)
}

function selectAnswer(index) {
    if (showResult.value) return
    selectedAnswer.value = index
    showResult.value = true
    isCorrect.value = index === correctAnswerIndex.value
    
    if (isCorrect.value) {
        playSuccess()
    } else {
        playError()
    }
}

function checkTypedAnswer() {
    if (!typedAnswer.value.trim() || isCorrect.value) return

    const userAnswer = typedAnswer.value.trim().toLowerCase()
    const correctAnswerLower = props.word.english.toLowerCase()
    
    if (userAnswer === correctAnswerLower) {
        isCorrect.value = true
        showResult.value = true
        showWrongAttempt.value = false
        playSuccess()
    } else {
        attemptCount.value++
        showWrongAttempt.value = true
        playError()
        
        // Clear input and focus for retry
        typedAnswer.value = ''
        nextTick(() => {
            answerInput.value?.focus()
        })
    }
}

function completeWord() {
    if (isCorrect.value) {
        emit('complete', props.word)
    } else {
        emit('retry', props.word)
    }
    reset()
}

// Step 4 functions
function goToSentenceStep() {
    currentStep.value = 4
    userSentence.value = ''
    showGradeResult.value = false
    gradeError.value = ''
    gradeResult.value = { score: 0, feedback: '', correctedSentence: '', tips: '' }
    nextTick(() => {
        sentenceInput.value?.focus()
    })
}

async function gradeSentence() {
    if (!userSentence.value.trim() || isGrading.value) return

    isGrading.value = true
    gradeError.value = ''

    try {
        const result = await api.gradeSentence(
            props.word.english,
            props.word.vietnamese,
            userSentence.value.trim()
        )

        if (result.success) {
            gradeResult.value = {
                score: result.score || 0,
                feedback: result.feedback || '',
                correctedSentence: result.correctedSentence || '',
                tips: result.tips || ''
            }
            showGradeResult.value = true
            
            // Play sound based on score
            if (result.score >= 70) {
                playLevelUp()
            } else {
                playStepComplete()
            }
        } else {
            gradeError.value = result.message || 'Lỗi chấm điểm. Vui lòng thử lại.'
        }
    } catch (error) {
        console.error('Error grading sentence:', error)
        gradeError.value = 'Lỗi kết nối. Vui lòng thử lại.'
    }

    isGrading.value = false
}

function retrySentence() {
    userSentence.value = ''
    showGradeResult.value = false
    gradeError.value = ''
    nextTick(() => {
        sentenceInput.value?.focus()
    })
}

function skipSentence() {
    completeWord()
}

function reset() {
    currentStep.value = 1
    canProceed.value = false
    selectedAnswer.value = null
    typedAnswer.value = ''
    showResult.value = false
    isCorrect.value = false
    showWrongAttempt.value = false
    attemptCount.value = 0
    // Reset Step 4 state
    userSentence.value = ''
    showGradeResult.value = false
    gradeError.value = ''
    gradeResult.value = { score: 0, feedback: '', correctedSentence: '', tips: '' }
    startCountdown()
}

watch(() => props.word, () => {
    reset()
})

onMounted(() => {
    startCountdown()
    playWordAudio()
})

defineExpose({ reset })
</script>

<style scoped>
.learn-card {
    max-width: 550px;
    margin: 0 auto;
}

/* Step Indicators */
.step-indicators {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 2rem;
}

.step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.4;
    transition: all 0.3s ease;
}

.step-indicator.active {
    opacity: 1;
}

.step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-muted);
    transition: all 0.3s ease;
}

.step-indicator.active .step-number {
    background: var(--mint-500);
    color: white;
}

.step-indicator.completed .step-number {
    background: var(--mint-400);
    color: white;
}

.step-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
}

.step-indicator.active .step-label {
    color: var(--text-primary);
}

.step-connector {
    width: 60px;
    height: 3px;
    background: var(--bg-tertiary);
    margin: 0 0.5rem;
    margin-bottom: 1.5rem;
    border-radius: 2px;
    transition: background 0.3s ease;
}

.step-connector.active {
    background: var(--mint-400);
}

/* Step Content */
.step-content {
    animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Word Display - Step 1 */
.word-display {
    padding: 2rem;
    text-align: center;
}

.word-main {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
}

.word-english {
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.word-english.large {
    font-size: 2.75rem;
}

.btn-audio {
    background: var(--mint-100);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--mint-600);
    transition: all 0.2s ease;
}

.btn-audio:hover {
    background: var(--mint-200);
    transform: scale(1.1);
}

.word-pronunciation {
    font-size: 1.1rem;
    color: var(--text-muted);
    font-style: italic;
    margin: 0.5rem 0;
}

.word-pronunciation.large {
    font-size: 1.35rem;
}

.word-divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--mint-400), var(--mint-500));
    margin: 1.25rem auto;
    border-radius: 2px;
}

.word-vietnamese {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--mint-600);
    margin: 0 0 0.5rem;
}

.word-meaning {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

.word-details {
    margin-top: 1.5rem;
    text-align: left;
    border-top: 1px solid var(--border-color);
    padding-top: 1.25rem;
}

.detail-item {
    margin-bottom: 1rem;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--mint-500);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.35rem;
}

.detail-content {
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

.detail-content.mono {
    font-family: monospace;
    background: var(--bg-tertiary);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md);
}

/* Step Action */
.step-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
}

.step-hint {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.875rem;
    color: var(--text-muted);
    margin: 0;
}

.btn-lg {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Listen Display - Step 2 */
.listen-display {
    padding: 2.5rem 2rem;
    text-align: center;
}

.listen-icon-wrapper {
    margin-bottom: 1.5rem;
}

.listen-icon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--mint-100), var(--mint-200));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    color: var(--mint-600);
    transition: all 0.3s ease;
}

.listen-icon.playing {
    animation: pulse 1s infinite;
    background: linear-gradient(135deg, var(--mint-400), var(--mint-500));
    color: white;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }
}

.listen-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 1.5rem 0;
}

.btn-icon-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.listen-instruction {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-muted);
    margin: 0;
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
}

/* Quiz Display - Step 3 */
.quiz-display {
    padding: 2rem;
}

.quiz-question {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.quiz-icon {
    color: var(--mint-500);
    flex-shrink: 0;
    margin-top: 0.15rem;
}

.quiz-prompt {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.5;
}

.quiz-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.quiz-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-primary);
}

.quiz-option:hover:not(:disabled) {
    border-color: var(--mint-400);
    background: rgba(16, 185, 129, 0.1);
}

.quiz-option.selected {
    border-color: var(--mint-500);
    background: rgba(16, 185, 129, 0.15);
}

.quiz-option.correct {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
}

.quiz-option.wrong {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.option-letter {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-muted);
    flex-shrink: 0;
}

.quiz-option.selected .option-letter {
    background: var(--mint-500);
    color: white;
}

/* Quiz Input */
.quiz-input {
    display: flex;
    gap: 0.75rem;
}

.quiz-input .input {
    flex: 1;
}

.input-lg {
    padding: 0.875rem 1rem;
    font-size: 1rem;
}

/* Quiz Result */
.quiz-result {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    margin-top: 1.25rem;
}

.quiz-result.correct {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.quiz-result.wrong {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.result-content {
    flex: 1;
}

.result-title {
    font-weight: 600;
    font-size: 1rem;
    margin: 0 0 0.25rem;
}

.result-answer {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.9;
}

.result-answer strong {
    font-weight: 600;
}

.result-hint {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    margin: 0.5rem 0 0;
    color: var(--text-secondary);
}

.input-error {
    border-color: #ef4444 !important;
    animation: shake 0.4s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    50% { transform: translateX(8px); }
    75% { transform: translateX(-8px); }
}

/* Step 4: Sentence Writing */
.sentence-display {
    padding: 2rem;
}

.sentence-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.sentence-icon {
    color: var(--mint-500);
    flex-shrink: 0;
    margin-top: 0.15rem;
}

.sentence-title {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.25rem;
}

.sentence-subtitle {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
}

.sentence-subtitle strong {
    color: var(--mint-600);
}

.word-reminder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.25));
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.word-reminder-english {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.word-reminder-divider {
    color: var(--text-muted);
    font-size: 1.1rem;
}

.word-reminder-vietnamese {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--mint-600);
}

.sentence-input-wrapper {
    margin-bottom: 1rem;
}

.sentence-textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    font-family: inherit;
    background: var(--card-bg);
    color: var(--text-primary);
    resize: vertical;
    transition: border-color 0.2s ease;
}

.sentence-textarea:focus {
    outline: none;
    border-color: var(--mint-400);
}

.sentence-textarea:disabled {
    background: var(--bg-tertiary);
    cursor: not-allowed;
}

.grading-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem;
    color: var(--mint-500);
    font-weight: 500;
}

.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.grading-result {
    padding: 1.25rem;
    border-radius: var(--radius-lg);
    margin-top: 1rem;
}

.grading-result.excellent {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.grading-result.good {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.grading-result.fair {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.grading-result.poor {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.grade-score-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.grade-score {
    display: flex;
    align-items: baseline;
}

.score-value {
    font-size: 2rem;
    font-weight: 700;
}

.grading-result.excellent .score-value {
    color: #10b981;
}

.grading-result.good .score-value {
    color: #22c55e;
}

.grading-result.fair .score-value {
    color: #f59e0b;
}

.grading-result.poor .score-value {
    color: #ef4444;
}

.score-max {
    font-size: 1rem;
    color: var(--text-muted);
}

.grade-label {
    font-size: 1rem;
    font-weight: 600;
}

.grading-result.excellent .grade-label {
    color: #10b981;
}

.grading-result.good .grade-label {
    color: #22c55e;
}

.grading-result.fair .grade-label {
    color: #f59e0b;
}

.grading-result.poor .grade-label {
    color: #ef4444;
}

.grade-feedback {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
}

.grade-feedback p {
    margin: 0;
    line-height: 1.5;
}

.grade-corrected,
.grade-tips {
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    margin-top: 0.75rem;
}

.corrected-label,
.tips-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
}

.corrected-label {
    color: #10b981;
}

.tips-label {
    color: #f59e0b;
}

.corrected-text,
.tips-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

.grading-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius-md);
    color: #ef4444;
    font-size: 0.9rem;
    margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .step-connector {
        width: 40px;
    }

    .word-english {
        font-size: 1.75rem;
    }

    .word-english.large {
        font-size: 2rem;
    }

    .listen-actions {
        flex-direction: column;
    }

    .quiz-input {
        flex-direction: column;
    }

    .step-action {
        flex-direction: column;
    }
}
</style>
