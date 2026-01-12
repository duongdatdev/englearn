<template>
    <div class="paragraph-view animate-fadeIn">
        <!-- Header -->
        <div class="paragraph-header">
            <button class="btn btn-ghost" @click="goBack">
                <FeatherIcon type="arrow-left" :size="18" /> Quay lại
            </button>
            <div class="header-title">
                <FeatherIcon type="file-text" :size="20" />
                <span>Điền đoạn văn</span>
            </div>
            <div class="header-badge">
                <FeatherIcon type="cpu" :size="14" /> AI
            </div>
        </div>

        <!-- Topic Info -->
        <div class="topic-info" v-if="topic">
            <span class="topic-name">{{ topic.name }}</span>
            <span class="topic-meta">{{ words.length }} từ vựng</span>
        </div>

        <!-- Main Content -->
        <div class="paragraph-practice card">
            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <div class="loading-spinner">
                    <FeatherIcon type="loader" :size="48" class="spin" />
                </div>
                <p class="loading-text">AI đang tạo đoạn văn...</p>
                <p class="loading-hint">Sử dụng từ vựng từ chủ đề "{{ topic?.name }}"</p>
            </div>

            <!-- Paragraph Content -->
            <div v-else-if="paragraphData" class="paragraph-content">
                <div class="content-header">
                    <h3>Hoàn thành đoạn văn</h3>
                    <p class="instruction">
                        <FeatherIcon type="info" :size="16" />
                        Nhấp vào ô trống, sau đó chọn từ phù hợp từ danh sách bên dưới
                    </p>
                </div>

                <!-- Paragraph Text with Blanks -->
                <div class="paragraph-text-container">
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
                </div>

                <!-- Word Bank -->
                <div class="word-bank" v-if="!showResults">
                    <div class="word-bank-header">
                        <FeatherIcon type="tag" :size="16" />
                        <span>Chọn từ để điền:</span>
                    </div>
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
                    <button v-if="!showResults" class="btn btn-secondary" @click="clearAllAnswers"
                        :disabled="Object.keys(userAnswers).length === 0">
                        <FeatherIcon type="trash-2" :size="16" /> Xóa tất cả
                    </button>
                    <button v-if="!showResults" class="btn btn-primary btn-lg" @click="checkParagraphAnswers"
                        :disabled="!allBlanksFilled">
                        <FeatherIcon type="check" :size="18" /> Kiểm tra đáp án
                    </button>
                </div>

                <!-- Results -->
                <div v-if="showResults" class="paragraph-results" :class="{ perfect: paragraphScore === 100 }">
                    <div class="results-icon" :class="{ perfect: paragraphScore === 100 }">
                        <FeatherIcon :type="paragraphScore === 100 ? 'award' : 'bar-chart-2'" :size="40" />
                    </div>
                    <div class="results-score">
                        <span class="score-value">{{ correctAnswersCount }}/{{ totalBlanks }}</span>
                        <span class="score-percent">({{ paragraphScore }}%)</span>
                    </div>
                    <p class="results-message">
                        {{ getResultsMessage }}
                    </p>

                    <div class="results-list">
                        <div v-for="blank in paragraphData.blanks" :key="blank.position" class="result-item"
                            :class="{ correct: isBlankCorrect(blank.position), wrong: !isBlankCorrect(blank.position) }">
                            <span class="result-position">({{ blank.position }})</span>
                            <span class="result-answer">{{ blank.answer }}</span>
                            <span class="result-vietnamese">{{ blank.vietnamese }}</span>
                            <FeatherIcon :type="isBlankCorrect(blank.position) ? 'check-circle' : 'x-circle'"
                                :size="18" />
                        </div>
                    </div>

                    <div class="results-actions">
                        <button class="btn btn-secondary" @click="retryParagraph">
                            <FeatherIcon type="refresh-cw" :size="16" /> Thử lại
                        </button>
                        <button class="btn btn-primary" @click="generateNewParagraph">
                            <FeatherIcon type="cpu" :size="16" /> Đoạn văn mới
                        </button>
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
                <div class="error-icon">
                    <FeatherIcon type="alert-circle" :size="48" />
                </div>
                <p class="error-message">{{ error }}</p>
                <div class="error-actions">
                    <button class="btn btn-primary" @click="generateNewParagraph">
                        <FeatherIcon type="refresh-cw" :size="16" /> Thử lại
                    </button>
                    <button class="btn btn-ghost" @click="goBack">
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWordsByTopicId, getTopicById } from '../db/database.js'
import { api } from '../services/api.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const route = useRoute()
const router = useRouter()

const words = ref([])
const topic = ref(null)
const loading = ref(true)
const paragraphData = ref(null)
const error = ref('')
const userAnswers = ref({})
const selectedBlank = ref(null)
const selectedWord = ref(null)
const showResults = ref(false)

// Computed properties
const paragraphParts = computed(() => {
    if (!paragraphData.value?.paragraph) return []

    const text = paragraphData.value.paragraph
    const parts = []
    let lastIndex = 0

    const regex = /\((\d+)\)/g
    let match

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.substring(lastIndex, match.index)
            })
        }
        parts.push({
            type: 'blank',
            position: parseInt(match[1])
        })
        lastIndex = match.index + match[0].length
    }

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

const getResultsMessage = computed(() => {
    if (paragraphScore.value === 100) return 'Xuất sắc! Bạn đã điền đúng tất cả!'
    if (paragraphScore.value >= 70) return 'Tốt lắm! Tiếp tục cố gắng nhé!'
    return 'Hãy xem lại các từ và thử lại!'
})

onMounted(async () => {
    try {
        const topicId = route.params.topicId
        topic.value = await getTopicById(topicId)
        words.value = await getWordsByTopicId(topicId)
        await generateNewParagraph()
    } catch (err) {
        console.error('Error loading data:', err)
        error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
        loading.value = false
    }
})

async function generateNewParagraph() {
    loading.value = true
    error.value = ''
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
            error.value = result.message || 'Không thể tạo đoạn văn. Vui lòng thử lại.'
        }
    } catch (err) {
        console.error('Error generating paragraph:', err)
        error.value = 'Lỗi kết nối. Vui lòng thử lại.'
    }

    loading.value = false
}

function selectBlank(position) {
    selectedBlank.value = position
    if (selectedWord.value) {
        userAnswers.value[position] = selectedWord.value
        selectedWord.value = null
        selectedBlank.value = null
    }
}

function selectWord(word) {
    selectedWord.value = word
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

function goBack() {
    router.back()
}
</script>

<style scoped>
.paragraph-view {
    max-width: 750px;
    margin: 0 auto;
    padding-bottom: 2rem;
}

/* Header */
.paragraph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.paragraph-header .btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text-primary);
}

.header-badge {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    border-radius: var(--radius-full);
    font-size: 0.8rem;
    font-weight: 600;
}

/* Topic Info */
.topic-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
}

.topic-name {
    font-weight: 600;
    color: var(--text-primary);
}

.topic-meta {
    font-size: 0.875rem;
    color: var(--text-muted);
}

/* Main Card */
.paragraph-practice {
    padding: 2rem;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 4rem 1rem;
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
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 0.5rem;
}

.loading-hint {
    font-size: 0.95rem;
    color: var(--text-muted);
    margin: 0;
}

/* Content Header */
.content-header {
    margin-bottom: 1.5rem;
}

.content-header h3 {
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
}

.instruction {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
}

/* Paragraph Text */
.paragraph-text-container {
    margin-bottom: 1.5rem;
}

.paragraph-text {
    font-size: 1.15rem;
    line-height: 2.2;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
    padding: 1.75rem;
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-color);
}

.blank-slot {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 110px;
    padding: 0.4rem 0.85rem;
    margin: 0.15rem 0.25rem;
    background: var(--card-bg);
    border: 2px dashed var(--mint-300);
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
}

.blank-slot:hover {
    border-color: var(--mint-500);
    background: rgba(16, 185, 129, 0.1);
    transform: translateY(-1px);
}

.blank-slot.active {
    border-color: var(--mint-500);
    border-style: solid;
    background: rgba(16, 185, 129, 0.15);
    color: var(--mint-600);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.blank-slot.filled {
    border-style: solid;
    border-color: var(--mint-400);
    background: rgba(16, 185, 129, 0.1);
    color: var(--text-primary);
    font-weight: 600;
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
    font-weight: 700;
    color: var(--mint-500);
}

/* Word Bank */
.word-bank {
    margin-bottom: 2rem;
}

.word-bank-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 1rem;
}

.word-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
}

.word-chip {
    padding: 0.6rem 1.25rem;
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-full);
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.word-chip:hover:not(:disabled) {
    border-color: var(--mint-400);
    background: rgba(16, 185, 129, 0.1);
    transform: translateY(-2px);
}

.word-chip.selected {
    border-color: var(--mint-500);
    background: var(--mint-100);
    color: var(--mint-600);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.word-chip.used {
    opacity: 0.35;
    cursor: not-allowed;
    text-decoration: line-through;
}

/* Actions */
.paragraph-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.paragraph-actions .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-lg {
    padding: 0.875rem 2rem;
    font-size: 1.05rem;
}

/* Results */
.paragraph-results {
    margin-top: 2rem;
    padding: 2rem;
    background: var(--bg-tertiary);
    border-radius: var(--radius-xl);
    text-align: center;
}

.paragraph-results.perfect {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    border: 2px solid rgba(16, 185, 129, 0.3);
}

.results-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: var(--mint-500);
}

.results-icon.perfect {
    background: linear-gradient(135deg, var(--mint-100), var(--mint-200));
}

.results-score {
    margin-bottom: 0.5rem;
}

.score-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
}

.score-percent {
    font-size: 1.25rem;
    color: var(--text-muted);
    margin-left: 0.5rem;
}

.results-message {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0 0 1.5rem;
}

.results-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    text-align: left;
}

.result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--card-bg);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
}

.result-item.correct {
    border-left: 4px solid #10b981;
}

.result-item.correct svg {
    color: #10b981;
}

.result-item.wrong {
    border-left: 4px solid #ef4444;
}

.result-item.wrong svg {
    color: #ef4444;
}

.result-position {
    font-weight: 600;
    color: var(--text-muted);
    min-width: 35px;
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

.results-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.results-actions .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Error State */
.error-state {
    text-align: center;
    padding: 4rem 1rem;
}

.error-icon {
    color: #ef4444;
    margin-bottom: 1rem;
}

.error-message {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0 0 1.5rem;
}

.error-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .paragraph-header {
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .header-title {
        order: -1;
        width: 100%;
        justify-content: center;
    }

    .paragraph-text {
        font-size: 1rem;
        padding: 1.25rem;
        line-height: 2;
    }

    .blank-slot {
        min-width: 85px;
        padding: 0.3rem 0.6rem;
        font-size: 0.9rem;
    }

    .word-chip {
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
    }

    .paragraph-actions {
        flex-direction: column;
    }

    .results-actions {
        flex-direction: column;
    }
}
</style>
