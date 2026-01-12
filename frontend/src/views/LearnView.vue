<template>
    <div class="learn-view animate-fadeIn">
        <!-- Header -->
        <div class="learn-header">
            <button class="btn btn-ghost" @click="goBack">
                <FeatherIcon type="arrow-left" :size="18" /> Quay lại
            </button>
            <div class="learn-title">
                <FeatherIcon type="book-open" :size="20" />
                <span>{{ showParagraphPractice ? 'Điền đoạn văn' : 'Học từ mới' }}</span>
            </div>
            <div class="learn-progress-text" v-if="!showParagraphPractice">
                {{ learnedCount }} / {{ words.length }}
            </div>
            <div class="learn-progress-text" v-else>
                AI Practice
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-container" v-if="!showParagraphPractice">
            <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>

        <!-- Learning Content -->
        <div class="learn-content" v-if="words.length > 0 && !isComplete && !showParagraphPractice">
            <LearnCard ref="learnCardRef" :word="currentWord" :all-words="words" @complete="handleComplete"
                @retry="handleRetry" />
        </div>

        <!-- Completion Screen -->
        <div class="completion-screen card" v-if="isComplete && !showParagraphPractice">
            <div class="completion-icon">
                <FeatherIcon type="award" :size="64" />
            </div>
            <h2 class="completion-title">Hoàn thành!</h2>
            <p class="completion-subtitle">Bạn đã học xong tất cả từ vựng trong bài này</p>

            <div class="completion-stats">
                <div class="stat-item">
                    <span class="stat-value">{{ words.length }}</span>
                    <span class="stat-label">Tổng số từ</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-value correct">{{ correctCount }}</span>
                    <span class="stat-label">Đúng ngay</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                    <span class="stat-value retry">{{ retryCount }}</span>
                    <span class="stat-label">Cần học lại</span>
                </div>
            </div>

            <div class="completion-actions">
                <button class="btn btn-secondary" @click="restartLearn">
                    <FeatherIcon type="refresh-cw" :size="18" /> Học lại
                </button>
                <button class="btn btn-primary" @click="goToQuiz">
                    <FeatherIcon type="edit-3" :size="18" /> Làm bài kiểm tra
                </button>
                <button class="btn btn-accent" @click="startParagraphPractice">
                    <FeatherIcon type="file-text" :size="18" /> Điền đoạn văn (AI)
                </button>
            </div>
        </div>

        <!-- Paragraph Practice Mode -->
        <div class="paragraph-practice card" v-if="showParagraphPractice">
            <!-- Loading State -->
            <div v-if="loadingParagraph" class="loading-state">
                <div class="loading-spinner">
                    <FeatherIcon type="loader" :size="40" class="spin" />
                </div>
                <p class="loading-text">AI đang tạo đoạn văn...</p>
                <p class="loading-hint">Sử dụng {{ words.length }} từ vựng bạn vừa học</p>
            </div>

            <!-- Paragraph Content -->
            <div v-else-if="paragraphData" class="paragraph-content">
                <div class="paragraph-header">
                    <FeatherIcon type="file-text" :size="24" />
                    <h3>Điền từ vào đoạn văn</h3>
                </div>

                <p class="paragraph-instruction">
                    <FeatherIcon type="info" :size="16" />
                    Nhấp vào ô trống, sau đó chọn từ phù hợp từ danh sách bên dưới
                </p>

                <!-- Paragraph Text with Blanks -->
                <div class="paragraph-text">
                    <template v-for="(part, index) in paragraphParts" :key="index">
                        <span v-if="part.type === 'text'">{{ part.content }}</span>
                        <button v-else class="blank-slot" :class="{
                            active: selectedBlank === part.position,
                            filled: userAnswers[part.position],
                            correct: showResults && isBlankCorrect(part.position),
                            wrong: showResults && !isBlankCorrect(part.position) && userAnswers[part.position]
                        }" @click="selectBlank(part.position)">
                            <span v-if="userAnswers[part.position]">{{ userAnswers[part.position] }}</span>
                            <span v-else class="blank-number">({{ part.position }})</span>
                        </button>
                    </template>
                </div>

                <!-- Word Bank -->
                <div class="word-bank" v-if="!showResults">
                    <span class="word-bank-label">
                        <FeatherIcon type="tag" :size="14" /> Chọn từ:
                    </span>
                    <div class="word-chips">
                        <button v-for="word in shuffledAnswers" :key="word" class="word-chip" :class="{
                            used: Object.values(userAnswers).includes(word),
                            selected: selectedWord === word
                        }" @click="selectWord(word)" :disabled="Object.values(userAnswers).includes(word)">
                            {{ word }}
                        </button>
                    </div>
                </div>

                <!-- Actions -->
                <div class="paragraph-actions">
                    <button v-if="!showResults" class="btn btn-secondary" @click="clearAllAnswers">
                        <FeatherIcon type="trash-2" :size="16" /> Xóa tất cả
                    </button>
                    <button v-if="!showResults" class="btn btn-primary" @click="checkParagraphAnswers"
                        :disabled="!allBlanksFilled">
                        <FeatherIcon type="check" :size="18" /> Kiểm tra đáp án
                    </button>
                    <button v-if="showResults" class="btn btn-secondary" @click="retryParagraph">
                        <FeatherIcon type="refresh-cw" :size="16" /> Thử lại
                    </button>
                    <button v-if="showResults" class="btn btn-primary" @click="generateNewParagraph">
                        <FeatherIcon type="cpu" :size="16" /> Đoạn văn mới
                    </button>
                    <button v-if="showResults" class="btn btn-ghost" @click="exitParagraphPractice">
                        <FeatherIcon type="arrow-left" :size="16" /> Quay lại
                    </button>
                </div>

                <!-- Results -->
                <div v-if="showResults" class="paragraph-results" :class="{ perfect: paragraphScore === 100 }">
                    <div class="results-header">
                        <FeatherIcon :type="paragraphScore === 100 ? 'award' : 'bar-chart-2'" :size="24" />
                        <span class="results-score">{{ correctAnswersCount }}/{{ totalBlanks }} đúng ({{
                            paragraphScore }}%)</span>
                    </div>
                    <div class="results-list">
                        <div v-for="blank in paragraphData.blanks" :key="blank.position" class="result-item"
                            :class="{ correct: isBlankCorrect(blank.position), wrong: !isBlankCorrect(blank.position) }">
                            <span class="result-position">({{ blank.position }})</span>
                            <span class="result-answer">{{ blank.answer }}</span>
                            <span class="result-vietnamese">{{ blank.vietnamese }}</span>
                            <FeatherIcon :type="isBlankCorrect(blank.position) ? 'check' : 'x'" :size="16" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="paragraphError" class="error-state">
                <FeatherIcon type="alert-circle" :size="48" />
                <p>{{ paragraphError }}</p>
                <button class="btn btn-primary" @click="generateNewParagraph">
                    <FeatherIcon type="refresh-cw" :size="16" /> Thử lại
                </button>
                <button class="btn btn-ghost" @click="exitParagraphPractice">
                    Quay lại
                </button>
            </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state card" v-if="words.length === 0">
            <FeatherIcon type="inbox" :size="48" />
            <p>Không có từ vựng nào trong bài học này</p>
            <button class="btn btn-primary" @click="goBack">Quay lại</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWordsByTopicId, getTopicById } from '../db/database.js'
import { api } from '../services/api.js'
import { initializeTopicCards } from '../services/srs.js'
import { recordWordLearned, updateStreak, checkAchievements } from '../services/gamification.js'
import LearnCard from '../components/LearnCard.vue'
import FeatherIcon from '../components/FeatherIcon.vue'

const route = useRoute()
const router = useRouter()

const learnCardRef = ref(null)
const words = ref([])
const topic = ref(null)
const currentIndex = ref(0)
const learnedWords = ref(new Set())
const correctCount = ref(0)
const retryCount = ref(0)
const isComplete = ref(false)

// Paragraph Practice State
const showParagraphPractice = ref(false)
const loadingParagraph = ref(false)
const paragraphData = ref(null)
const paragraphError = ref('')
const userAnswers = ref({})
const selectedBlank = ref(null)
const selectedWord = ref(null)
const showResults = ref(false)

const currentWord = computed(() => words.value[currentIndex.value] || {})
const learnedCount = computed(() => learnedWords.value.size)
const progressPercent = computed(() =>
    words.value.length > 0 ? (learnedCount.value / words.value.length) * 100 : 0
)

// Paragraph computed properties
const paragraphParts = computed(() => {
    if (!paragraphData.value?.paragraph) return []

    const text = paragraphData.value.paragraph
    const parts = []
    let lastIndex = 0

    // Find all blanks (1), (2), etc.
    const regex = /\((\d+)\)/g
    let match

    while ((match = regex.exec(text)) !== null) {
        // Add text before the blank
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            })
        }
        // Add the blank
        parts.push({
            type: 'blank',
            position: parseInt(match[1])
        })
        lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.substring(lastIndex)
        })
    }

    return parts
})

const shuffledAnswers = computed(() => {
    if (!paragraphData.value?.blanks) return []
    const answers = paragraphData.value.blanks.map(b => b.answer)
    return [...answers].sort(() => Math.random() - 0.5)
})

const totalBlanks = computed(() => paragraphData.value?.blanks?.length || 0)

const allBlanksFilled = computed(() => {
    if (!paragraphData.value?.blanks) return false
    return paragraphData.value.blanks.every(b => userAnswers.value[b.position])
})

const correctAnswersCount = computed(() => {
    if (!paragraphData.value?.blanks) return 0
    return paragraphData.value.blanks.filter(b =>
        userAnswers.value[b.position]?.toLowerCase() === b.answer.toLowerCase()
    ).length
})

const paragraphScore = computed(() => {
    if (totalBlanks.value === 0) return 0
    return Math.round((correctAnswersCount.value / totalBlanks.value) * 100)
})

onMounted(async () => {
    try {
        const topicId = route.params.topicId
        topic.value = await getTopicById(topicId)
        words.value = await getWordsByTopicId(topicId)
    } catch (error) {
        console.error('Error loading words:', error)
    }
})

function handleComplete(word) {
    learnedWords.value.add(word.id)
    correctCount.value++
    moveToNext()
}

function handleRetry(word) {
    retryCount.value++
    learnCardRef.value?.reset()
}

function moveToNext() {
    if (learnedWords.value.size >= words.value.length) {
        isComplete.value = true
        // Add all words to SRS queue
        const topicId = route.params.topicId
        const wordsWithTopic = words.value.map(w => ({ ...w, topicId }))
        initializeTopicCards(wordsWithTopic, topicId)

        // Award XP for each word learned
        words.value.forEach(() => recordWordLearned())

        // Update streak
        updateStreak()

        // Check for new achievements
        checkAchievements()
    } else {
        let nextIndex = currentIndex.value
        for (let i = 0; i < words.value.length; i++) {
            nextIndex = (currentIndex.value + 1 + i) % words.value.length
            if (!learnedWords.value.has(words.value[nextIndex].id)) {
                break
            }
        }
        currentIndex.value = nextIndex
    }
}

function restartLearn() {
    currentIndex.value = 0
    learnedWords.value.clear()
    correctCount.value = 0
    retryCount.value = 0
    isComplete.value = false
}

function goBack() {
    router.back()
}

function goToQuiz() {
    router.push(`/quiz/${topic.value?.id}/vn-en`)
}

// Paragraph Practice Functions
async function startParagraphPractice() {
    showParagraphPractice.value = true
    await generateNewParagraph()
}

async function generateNewParagraph() {
    loadingParagraph.value = true
    paragraphError.value = ''
    paragraphData.value = null
    userAnswers.value = {}
    selectedBlank.value = null
    selectedWord.value = null
    showResults.value = false

    try {
        const wordsList = words.value.map(w => ({
            english: w.english,
            vietnamese: w.vietnamese
        }))

        const result = await api.generateParagraphBlanks(wordsList, topic.value?.name || 'General Business')

        if (result.success && result.paragraph && result.blanks?.length > 0) {
            paragraphData.value = result
        } else {
            paragraphError.value = result.message || 'Không thể tạo đoạn văn. Vui lòng thử lại.'
        }
    } catch (error) {
        console.error('Error generating paragraph:', error)
        paragraphError.value = 'Lỗi kết nối. Vui lòng thử lại.'
    }

    loadingParagraph.value = false
}

function selectBlank(position) {
    selectedBlank.value = position
    // If a word was already selected, fill the blank
    if (selectedWord.value) {
        userAnswers.value[position] = selectedWord.value
        selectedWord.value = null
        selectedBlank.value = null
    }
}

function selectWord(word) {
    selectedWord.value = word
    // If a blank was already selected, fill it
    if (selectedBlank.value !== null) {
        userAnswers.value[selectedBlank.value] = word
        selectedBlank.value = null
        selectedWord.value = null
    }
}

function clearAllAnswers() {
    userAnswers.value = {}
    selectedBlank.value = null
    selectedWord.value = null
}

function checkParagraphAnswers() {
    showResults.value = true
}

function isBlankCorrect(position) {
    const blank = paragraphData.value?.blanks?.find(b => b.position === position)
    if (!blank) return false
    return userAnswers.value[position]?.toLowerCase() === blank.answer.toLowerCase()
}

function retryParagraph() {
    userAnswers.value = {}
    selectedBlank.value = null
    selectedWord.value = null
    showResults.value = false
}

function exitParagraphPractice() {
    showParagraphPractice.value = false
    paragraphData.value = null
    userAnswers.value = {}
    showResults.value = false
}
</script>

<style scoped>
.learn-view {
    max-width: 700px;
    margin: 0 auto;
    padding-bottom: 2rem;
}

/* Header */
.learn-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.learn-header .btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.learn-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.learn-progress-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    padding: 0.35rem 0.75rem;
    border-radius: var(--radius-full);
}

/* Progress Bar */
.progress-bar-container {
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
    margin-bottom: 2rem;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--mint-400), var(--mint-500));
    border-radius: 3px;
    transition: width 0.4s ease;
}

/* Learning Content */
.learn-content {
    margin-bottom: 2rem;
}

/* Completion Screen */
.completion-screen {
    padding: 3rem 2rem;
    text-align: center;
}

.completion-icon {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--mint-100), var(--mint-200));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: var(--mint-500);
}

.completion-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
}

.completion-subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    margin: 0 0 2rem;
}

.completion-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-xl);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-value.correct {
    color: #10b981;
}

.stat-value.retry {
    color: #f59e0b;
}

.stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: var(--border-color);
}

.completion-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.completion-actions .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-accent {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    border: none;
}

.btn-accent:hover {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

/* Paragraph Practice */
.paragraph-practice {
    padding: 2rem;
}

.loading-state {
    text-align: center;
    padding: 3rem 1rem;
}

.loading-spinner {
    margin-bottom: 1.5rem;
}

.spin {
    animation: spin 1s linear infinite;
    color: var(--mint-500);
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
}

.loading-hint {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
}

.paragraph-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: var(--mint-500);
}

.paragraph-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.paragraph-instruction {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.paragraph-text {
    font-size: 1.1rem;
    line-height: 2;
    color: var(--text-primary);
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
}

.blank-slot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 100px;
    padding: 0.35rem 0.75rem;
    margin: 0 0.2rem;
    background: var(--bg-tertiary);
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
}

.blank-slot:hover {
    border-color: var(--mint-400);
    background: rgba(16, 185, 129, 0.1);
}

.blank-slot.active {
    border-color: var(--mint-500);
    border-style: solid;
    background: rgba(16, 185, 129, 0.15);
    color: var(--mint-600);
}

.blank-slot.filled {
    border-style: solid;
    border-color: var(--mint-400);
    background: rgba(16, 185, 129, 0.1);
    color: var(--text-primary);
}

.blank-slot.correct {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
}

.blank-slot.wrong {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.blank-number {
    font-weight: 600;
}

.word-bank {
    margin-bottom: 1.5rem;
}

.word-bank-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
}

.word-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.word-chip {
    padding: 0.5rem 1rem;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-full);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.word-chip:hover:not(:disabled) {
    border-color: var(--mint-400);
    background: rgba(16, 185, 129, 0.1);
}

.word-chip.selected {
    border-color: var(--mint-500);
    background: var(--mint-100);
    color: var(--mint-600);
}

.word-chip.used {
    opacity: 0.4;
    cursor: not-allowed;
    text-decoration: line-through;
}

.paragraph-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.paragraph-actions .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.paragraph-results {
    margin-top: 1.5rem;
    padding: 1.25rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
}

.paragraph-results.perfect {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.results-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: var(--mint-500);
}

.results-score {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.results-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: var(--card-bg);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
}

.result-item.correct {
    border-left: 3px solid #10b981;
}

.result-item.wrong {
    border-left: 3px solid #ef4444;
}

.result-position {
    font-weight: 600;
    color: var(--text-muted);
    min-width: 30px;
}

.result-answer {
    font-weight: 600;
    color: var(--text-primary);
}

.result-vietnamese {
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-left: auto;
}

.error-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-muted);
}

.error-state p {
    margin: 1rem 0 1.5rem;
}

/* Empty State */
.empty-state {
    padding: 3rem 2rem;
    text-align: center;
    color: var(--text-muted);
}

.empty-state p {
    margin: 1rem 0 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
    .learn-header {
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .learn-title {
        order: -1;
        width: 100%;
        justify-content: center;
    }

    .completion-stats {
        flex-direction: column;
        gap: 1rem;
    }

    .stat-divider {
        width: 60px;
        height: 1px;
    }

    .completion-actions {
        flex-direction: column;
    }

    .paragraph-text {
        font-size: 1rem;
        padding: 1rem;
    }

    .blank-slot {
        min-width: 80px;
        padding: 0.25rem 0.5rem;
        font-size: 0.9rem;
    }

    .word-chip {
        font-size: 0.85rem;
        padding: 0.4rem 0.75rem;
    }

    .paragraph-actions {
        flex-direction: column;
    }
}
</style>
