<template>
    <div class="grammar-detail container animate-fadeIn">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <h2 class="loading-title">Generating AI Lesson...</h2>
            <p class="loading-desc">Please wait while we prepare the content for <span class="highlight">{{
                formatTenseName(route.params.tense) }}</span></p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <h3 class="error-title">Error Loading Lesson</h3>
            <p class="error-msg">{{ error }}</p>
            <button @click="fetchLesson" class="btn btn-primary">
                Try Again
            </button>
        </div>

        <!-- Content -->
        <div v-else-if="lesson" class="content-wrapper">
            <!-- Header -->
            <div class="lesson-header">
                <div class="header-bg"></div>
                <!-- Decorative elements -->
                <div class="bubble bubble-1"></div>
                <div class="bubble bubble-2"></div>

                <div class="header-content">
                    <button @click="router.back()" class="back-btn">
                        <FeatherIcon type="arrow-left" :size="20" class="back-icon" />
                        Back to Tenses
                    </button>
                    <h1 class="lesson-title">{{ lesson.title }}</h1>
                    <p class="lesson-desc">{{ lesson.description }}</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="tabs-container">
                <div class="tabs-list">
                    <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id"
                        :class="['tab-btn', { 'active': currentTab === tab.id }]">
                        {{ tab.name }}
                        <div v-if="currentTab === tab.id" class="active-indicator"></div>
                    </button>
                </div>
            </div>

            <!-- Tab Content -->
            <div class="tab-content-panel">

                <!-- Theory Tab -->
                <div v-if="currentTab === 'theory'" class="tab-pane animate-fadeIn">
                    <section class="mb-section">
                        <h3 class="section-heading structure">
                            <span class="icon-box structure-icon">📐</span>
                            Structure
                        </h3>
                        <div class="markdown-content box-style" v-html="formatMarkdown(lesson.structure)"></div>
                    </section>

                    <section>
                        <h3 class="section-heading usage">
                            <span class="icon-box usage-icon">💡</span>
                            Usage
                        </h3>
                        <div class="markdown-content" v-html="formatMarkdown(lesson.usage)"></div>
                    </section>
                </div>

                <!-- Examples Tab -->
                <div v-if="currentTab === 'examples'" class="tab-pane animate-fadeIn">
                    <h3 class="section-title">Usage Examples</h3>
                    <div class="examples-list">
                        <div v-for="(example, index) in lesson.examples" :key="index" class="example-item">
                            <span class="example-badge">
                                {{ index + 1 }}
                            </span>
                            <p class="example-text">{{ example }}</p>
                        </div>
                    </div>
                </div>

                <!-- Practice Tab -->
                <div v-if="currentTab === 'practice'" class="tab-pane animate-fadeIn">
                    <div class="practice-header">
                        <h3 class="section-title">Practice Quiz</h3>
                        <button @click="regenerateQuestions" class="btn-regenerate" :disabled="regenerating">
                            <FeatherIcon type="refresh-cw" :size="16" class="btn-icon"
                                :class="{ 'spin': regenerating }" />
                            {{ regenerating ? 'Generating...' : 'Regenerate Questions (AI)' }}
                        </button>
                    </div>

                    <div v-if="regenerating" class="regen-loading">
                        <div class="spinner-sm"></div>
                        <p>Creating new questions with AI...</p>
                    </div>

                    <div v-else class="quiz-list">
                        <div v-for="(q, index) in lesson.exercises" :key="index" class="quiz-card">
                            <h4 class="quiz-question">
                                <span class="q-label">Question {{ index + 1 }}:</span>
                                <span class="q-text">{{ q.question }}</span>
                            </h4>

                            <div class="options-grid">
                                <button v-for="option in q.options" :key="option" @click="selectAnswer(index, option)"
                                    :class="['option-btn', getOptionClass(index, option, q)]"
                                    :disabled="userAnswers[index] !== undefined">
                                    <span class="option-text">{{ option }}</span>
                                    <!-- Feedback Overlays -->
                                    <div v-if="isCorrect(index, q) && userAnswers[index] === option"
                                        class="feedback-overlay correct"></div>
                                    <div v-if="!isCorrect(index, q) && userAnswers[index] === option"
                                        class="feedback-overlay incorrect"></div>
                                </button>
                            </div>

                            <!-- Feedback Text -->
                            <div v-if="userAnswers[index] !== undefined"
                                :class="['feedback-msg', isCorrect(index, q) ? 'msg-correct' : 'msg-incorrect']">
                                <p class="feedback-heading">
                                    <FeatherIcon :type="isCorrect(index, q) ? 'check-circle' : 'x-circle'" :size="18"
                                        class="feedback-icon" />
                                    {{ isCorrect(index, q) ? 'Correct!' : 'Incorrect' }}
                                </p>
                                <p class="feedback-explanation">{{ q.explanation }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../services/api'
import { marked } from 'marked'
import FeatherIcon from '../components/FeatherIcon.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const regenerating = ref(false)
const error = ref(null)
const lesson = ref(null)
const currentTab = ref('theory')
const userAnswers = ref({})

const tabs = [
    { id: 'theory', name: 'Theory & Structure' },
    { id: 'examples', name: 'Examples' },
    { id: 'practice', name: 'Practice Quiz' }
]

const formatTenseName = (slug) => {
    if (!slug) return '';
    return slug.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const formatMarkdown = (text) => {
    try {
        return marked.parse(text || '')
    } catch (e) {
        return (text || '').replace(/\n/g, '<br>')
    }
}

const fetchLesson = async (refresh = false) => {
    if (refresh) {
        regenerating.value = true
    } else {
        loading.value = true
    }

    error.value = null
    try {
        const tenseName = formatTenseName(route.params.tense)
        const data = await api.getGrammarLesson(tenseName, refresh)
        lesson.value = data

        // Reset answers if regenerating
        if (refresh) {
            userAnswers.value = {}
        }
    } catch (err) {
        error.value = err.message || 'Failed to load lesson'
    } finally {
        loading.value = false
        regenerating.value = false
    }
}

const regenerateQuestions = () => {
    fetchLesson(true)
}

const selectAnswer = (questionIndex, option) => {
    userAnswers.value[questionIndex] = option
}

const isCorrect = (index, question) => {
    const selected = userAnswers.value[index]
    if (!selected) return false

    const optionLetter = selected.split('.')[0].trim()
    const correctLetter = question.correctAnswer.split('.')[0].trim()

    return optionLetter === correctLetter
}

const getOptionClass = (index, option, question) => {
    const selected = userAnswers.value[index]
    const isSelected = selected === option

    // Default State
    if (!selected) {
        return 'default'
    }

    // Selected State
    if (isSelected) {
        return isCorrect(index, question) ? 'selected-correct' : 'selected-incorrect'
    }

    // Reveal Correct Answer
    const optionLetter = option.split('.')[0].trim()
    const correctLetter = question.correctAnswer.split('.')[0].trim()
    if (selected && optionLetter === correctLetter) {
        return 'reveal-correct'
    }

    return 'disabled'
}

onMounted(() => {
    fetchLesson()
})
</script>

<style scoped>
.grammar-detail {
    padding: 2rem 1rem;
    max-width: 900px;
    margin: 0 auto;
}

/* Loading State */
.loading-state {
    text-align: center;
    padding: 5rem 0;
}

.spinner {
    width: 4rem;
    height: 4rem;
    border: 4px solid #e5e7eb;
    border-top-color: var(--mint-500);
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.loading-desc {
    color: var(--text-muted);
}

.highlight {
    color: var(--mint-600);
    font-weight: 500;
}

/* Error State */
.error-state {
    background-color: #fef2f2;
    color: #991b1b;
    padding: 1.5rem;
    border-radius: var(--radius-xl);
    text-align: center;
    border: 1px solid #fee2e2;
}

[data-theme="dark"] .error-state {
    background-color: rgba(127, 29, 29, 0.2);
    color: #fca5a5;
    border-color: rgba(127, 29, 29, 0.4);
}

.error-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.error-msg {
    margin-bottom: 1rem;
}

/* Lesson Header */
.lesson-header {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-xl);
    padding: 2rem;
    color: white;
    margin-bottom: 2rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.header-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    z-index: 1;
}

.bubble {
    position: absolute;
    background: white;
    opacity: 0.1;
    border-radius: 50%;
    z-index: 2;
}

.bubble-1 {
    top: 0;
    right: 0;
    width: 16rem;
    height: 16rem;
    transform: translate(50%, -50%);
}

.bubble-2 {
    bottom: 0;
    left: 0;
    width: 8rem;
    height: 8rem;
    transform: translate(-50%, 50%);
}

.header-content {
    position: relative;
    z-index: 3;
}

.back-btn {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: #dbeafe;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 1.5rem;
    padding: 0;
    transition: color 0.2s;
}

.back-btn:hover {
    color: white;
}

.back-icon {
    margin-right: 0.5rem;
}

.lesson-title {
    font-size: 2.25rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    line-height: 1.2;
}

.lesson-desc {
    font-size: 1.125rem;
    color: #dbeafe;
    line-height: 1.6;
    max-width: 40rem;
}

/* Tabs */
.tabs-container {
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 1.5rem;
}

.tabs-list {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
}

.tab-btn {
    position: relative;
    padding: 0.75rem 1.5rem;
    background: none;
    border: none;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s;
}

.tab-btn:hover {
    color: var(--text-primary);
}

.tab-btn.active {
    color: var(--mint-600);
}

[data-theme="dark"] .tab-btn.active {
    color: var(--mint-400);
}

.active-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--mint-500);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
}

/* Tab Content */
.tab-content-panel {
    background-color: var(--card-bg);
    padding: 2rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    min-height: 400px;
}

/* Content Sections */
.mb-section {
    margin-bottom: 2rem;
}

.section-heading,
.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
}

.icon-box {
    display: inline-flex;
    padding: 0.5rem;
    border-radius: 0.5rem;
    margin-right: 0.75rem;
}

.structure-icon {
    background-color: #dbeafe;
    color: #2563eb;
}

.usage-icon {
    background-color: #dcfce7;
    color: #166534;
}

[data-theme="dark"] .structure-icon {
    background-color: rgba(37, 99, 235, 0.2);
    color: #60a5fa;
}

[data-theme="dark"] .usage-icon {
    background-color: rgba(22, 101, 52, 0.2);
    color: #4ade80;
}

.markdown-content {
    color: var(--text-secondary);
    line-height: 1.7;
}

.box-style {
    background-color: var(--bg-tertiary);
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
}

/* Examples */
.examples-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.example-item {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    background-color: var(--mint-50);
    border: 1px solid var(--mint-100);
    border-radius: var(--radius-lg);
}

[data-theme="dark"] .example-item {
    background-color: rgba(21, 183, 158, 0.1);
    border-color: rgba(21, 183, 158, 0.2);
}

.example-badge {
    display: flex;
    width: 2rem;
    height: 2rem;
    align-items: center;
    justify-content: center;
    background-color: var(--mint-200);
    color: var(--mint-800);
    border-radius: 50%;
    font-weight: 700;
    margin-right: 1rem;
    flex-shrink: 0;
}

[data-theme="dark"] .example-badge {
    background-color: rgba(21, 183, 158, 0.3);
    color: #ccfbef;
}

.example-text {
    color: var(--text-secondary);
    font-size: 1.125rem;
    margin: 0;
    padding-top: 0.125rem;
}

/* Practice Header */
.practice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.btn-regenerate {
    display: flex;
    align-items: center;
    padding: 0.6rem 1.2rem;
    background-color: var(--bt-primary, var(--mint-500));
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    gap: 0.5rem;
}

.btn-regenerate:hover:not(:disabled) {
    background-color: var(--mint-600);
    transform: translateY(-1px);
}

.btn-regenerate:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-icon.spin {
    animation: spin 1s linear infinite;
}

.regen-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--text-muted);
}

.spinner-sm {
    width: 2rem;
    height: 2rem;
    border: 3px solid #e5e7eb;
    border-top-color: var(--mint-500);
    border-radius: 50%;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
}

/* Quiz */
.quiz-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.quiz-card {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    transition: box-shadow 0.2s;
}

.quiz-card:hover {
    box-shadow: var(--shadow-md);
}

.quiz-question {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.q-label {
    color: var(--text-muted);
    margin-right: 0.5rem;
    font-weight: 400;
}

.options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
}

@media (min-width: 768px) {
    .options-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.option-btn {
    position: relative;
    text-align: left;
    padding: 1rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    cursor: pointer;
    transition: all 0.2s;
    overflow: hidden;
    font-family: inherit;
    font-size: 1rem;
    color: var(--text-secondary);
}

/* Option States */
.option-btn.default:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--mint-400);
}

.option-btn.selected-correct {
    border-color: var(--success);
    color: #15803d;
    /* dark green */
    font-weight: 600;
}

[data-theme="dark"] .option-btn.selected-correct {
    color: #4ade80;
}

.option-btn.selected-incorrect {
    border-color: var(--error);
    color: #b91c1c;
    /* dark red */
    font-weight: 600;
}

[data-theme="dark"] .option-btn.selected-incorrect {
    color: #f87171;
}

.option-btn.reveal-correct {
    border-color: var(--success);
    background-color: #f0fdf4;
    color: #15803d;
}

[data-theme="dark"] .option-btn.reveal-correct {
    background-color: rgba(22, 163, 74, 0.1);
    color: #4ade80;
}

.option-btn.disabled {
    opacity: 0.6;
    cursor: default;
}

.feedback-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.feedback-overlay.correct {
    background-color: rgba(34, 197, 94, 0.1);
}

.feedback-overlay.incorrect {
    background-color: rgba(239, 68, 68, 0.1);
}

/* Feedback Msg */
.feedback-msg {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: var(--radius-md);
    border-left-width: 4px;
    border-left-style: solid;
}

.msg-correct {
    background-color: #f0fdf4;
    border-left-color: var(--success);
    color: #166534;
}

[data-theme="dark"] .msg-correct {
    background-color: rgba(22, 163, 74, 0.1);
    color: #86efac;
}

.msg-incorrect {
    background-color: #fef2f2;
    border-left-color: var(--error);
    color: #991b1b;
}

[data-theme="dark"] .msg-incorrect {
    background-color: rgba(239, 68, 68, 0.1);
    color: #fca5a5;
}

.feedback-heading {
    font-weight: 700;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
}

.feedback-icon {
    margin-right: 0.5rem;
}

.feedback-explanation {
    opacity: 0.9;
    margin: 0;
    font-size: 0.95rem;
}
</style>
