<template>
    <div class="review-view animate-fadeIn">
        <!-- Header -->
        <div class="review-header">
            <button class="btn btn-ghost" @click="goBack">
                <FeatherIcon type="arrow-left" :size="18" /> Quay lại
            </button>
            <h1 class="review-title">
                <FeatherIcon type="refresh-cw" :size="24" /> Ôn tập hàng ngày
            </h1>
            <div class="header-spacer"></div>
        </div>

        <!-- Progress Bar -->
        <div class="review-progress" v-if="cards.length > 0 && !isComplete">
            <div class="progress-info">
                <span>{{ currentIndex + 1 }} / {{ cards.length }}</span>
                <span class="progress-stats">
                    <span class="stat correct">✓ {{ correctCount }}</span>
                    <span class="stat wrong">✗ {{ wrongCount }}</span>
                </span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
        </div>

        <!-- Review Card -->
        <div class="review-content" v-if="cards.length > 0 && !isComplete">
            <ReviewCard ref="reviewCardRef" :word="currentCard" :options="currentQuizOptions" @rated="handleRated"
                @next="nextCard" />
        </div>

        <!-- Empty State -->
        <div class="empty-state card" v-if="cards.length === 0 && !loading">
            <div class="empty-icon">
                <FeatherIcon type="gift" :size="48" />
            </div>
            <h2>Không có từ nào cần ôn tập!</h2>
            <p>Bạn đã hoàn thành tất cả các từ cần ôn tập hôm nay. Hãy học thêm từ mới nhé!</p>
            <button class="btn btn-primary" @click="goBack">
                <FeatherIcon type="book-open" :size="18" /> Học từ mới
            </button>
        </div>

        <!-- Loading State -->
        <div class="loading-state" v-if="loading">
            <div class="loading-spinner"></div>
            <p>Đang tải từ vựng...</p>
        </div>

        <!-- Completion Screen -->
        <div class="completion-screen card" v-if="isComplete">
            <div class="completion-icon">
                <FeatherIcon v-if="accuracy >= 80" type="award" :size="48" />
                <FeatherIcon v-else-if="accuracy >= 50" type="thumbs-up" :size="48" />
                <FeatherIcon v-else type="zap" :size="48" />
            </div>

            <h2 class="completion-title">Hoàn thành ôn tập!</h2>

            <div class="completion-stats">
                <div class="stat-item correct-stat">
                    <span class="stat-value">{{ correctCount }}</span>
                    <span class="stat-label">Đúng</span>
                </div>
                <div class="stat-item accuracy-stat">
                    <span class="stat-value">{{ accuracy }}%</span>
                    <span class="stat-label">Độ chính xác</span>
                </div>
                <div class="stat-item wrong-stat">
                    <span class="stat-value">{{ wrongCount }}</span>
                    <span class="stat-label">Cần ôn lại</span>
                </div>
            </div>

            <div class="xp-earned" v-if="xpEarned > 0">
                <span class="xp-badge">+{{ xpEarned }} XP</span>
            </div>

            <div class="completion-message">
                <p v-if="accuracy === 100">
                    <FeatherIcon type="target" :size="16" /> Tuyệt vời! Bạn nhớ hết tất cả các từ!
                </p>
                <p v-else-if="accuracy >= 80">
                    <FeatherIcon type="star" :size="16" /> Rất tốt! Tiếp tục phát huy nhé!
                </p>
                <p v-else-if="accuracy >= 50">
                    <FeatherIcon type="book" :size="16" /> Tiếp tục ôn tập để cải thiện!
                </p>
                <p v-else>
                    <FeatherIcon type="sun" :size="16" /> Đừng nản! Luyện tập nhiều hơn sẽ tiến bộ!
                </p>
            </div>

            <div class="completion-actions">
                <button class="btn btn-secondary" @click="reviewAgain" v-if="wrongCount > 0">
                    <FeatherIcon type="refresh-cw" :size="18" /> Ôn lại từ sai ({{ wrongCount }})
                </button>
                <button class="btn btn-primary" @click="goBack">
                    <FeatherIcon type="home" :size="18" /> Về trang chủ
                </button>
            </div>
        </div>

        <!-- Celebration Modal -->
        <StreakCelebration :show="showCelebration" :type="celebrationType" :title="celebrationTitle"
            :message="celebrationMessage" :icon="celebrationIcon" :xp-reward="celebrationXP"
            @close="showCelebration = false" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import FeatherIcon from '../components/FeatherIcon.vue'
import ReviewCard from '../components/ReviewCard.vue'
import StreakCelebration from '../components/StreakCelebration.vue'
import { getCardsForReview, QUALITY } from '../services/srs.js'
import {
    recordReview,
    updateStreak,
    checkAchievements,
    XP_REWARDS
} from '../services/gamification.js'

import { api } from '../services/api.js'
import feather from 'feather-icons'

const router = useRouter()
const route = useRoute()

const cards = ref([])
const currentIndex = ref(0)
const results = ref([])
const loading = ref(true)
const isComplete = ref(false)
const xpEarned = ref(0)
const distractorPool = ref([])
const currentOptions = ref([])

const reviewCardRef = ref(null)

// Celebration state
const showCelebration = ref(false)
const celebrationType = ref('streak')
const celebrationTitle = ref('')
const celebrationMessage = ref('')
const celebrationIcon = ref('gift')
const celebrationXP = ref(0)

const currentCard = computed(() => cards.value[currentIndex.value] || {})
const progressPercent = computed(() =>
    cards.value.length > 0 ? ((currentIndex.value) / cards.value.length) * 100 : 0
)

const currentQuizOptions = computed(() => {
    if (!currentCard.value || distractorPool.value.length === 0) return []

    // Create options: correct answer + 3 random distractors
    const correct = currentCard.value
    const others = distractorPool.value
        .filter(w => w.id !== correct.wordId && w.vietnamese !== correct.vietnamese)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => ({ text: w.vietnamese, isCorrect: false }))

    const options = [
        { text: correct.vietnamese, isCorrect: true },
        ...others
    ].sort(() => 0.5 - Math.random())

    return options
})

const correctCount = computed(() =>
    results.value.filter(r => r.quality >= 3).length
)

const wrongCount = computed(() =>
    results.value.filter(r => r.quality < 3).length
)

const accuracy = computed(() => {
    if (results.value.length === 0) return 0
    return Math.round((correctCount.value / results.value.length) * 100)
})

onMounted(async () => {
    loading.value = true

    // Get topic ID if specified in route
    const topicId = route.params.topicId || null

    // Load cards for review
    cards.value = getCardsForReview(topicId)

    // Load distractors for quiz mode
    if (cards.value.length > 0) {
        try {
            // Fetch enough random words to have variety
            const randomWords = await api.getRandomWords(20)
            distractorPool.value = randomWords
        } catch (e) {
            console.error('Failed to load distractors:', e)
            // Fallback: use other cards as distractors if API fails
            distractorPool.value = cards.value.map(c => ({
                id: c.wordId,
                vietnamese: c.vietnamese
            }))
        }
    }

    loading.value = false

    // Update streak
    if (cards.value.length > 0) {
        const streakResult = updateStreak()

        // Check for streak milestone
        if (streakResult.increased && [3, 7, 14, 30].includes(streakResult.current)) {
            setTimeout(() => {
                showStreakCelebration(streakResult.current)
            }, 500)
        }
    }
})

function handleRated({ wordId, quality, result }) {
    results.value.push({ wordId, quality, result })

    // Add XP
    const isPerfect = quality >= 4
    const xpResult = recordReview(quality)
    xpEarned.value += quality >= 5 ? XP_REWARDS.REVIEW_EASY :
        quality >= 3 ? XP_REWARDS.REVIEW_CORRECT :
            XP_REWARDS.REVIEW_HARD

    // Check for level up
    if (xpResult.leveledUp) {
        setTimeout(() => {
            showLevelUpCelebration(xpResult.newLevel)
        }, 1500)
    }
}

function nextCard() {
    if (currentIndex.value < cards.value.length - 1) {
        currentIndex.value++
        // Reset the card component
        if (reviewCardRef.value) {
            reviewCardRef.value.reset()
        }
    } else {
        completeReview()
    }
}

function completeReview() {
    isComplete.value = true

    // Check for perfect review achievement
    if (accuracy.value === 100 && cards.value.length >= 5) {
        const achievements = checkAchievements()
        if (achievements.length > 0) {
            setTimeout(() => {
                showAchievementCelebration(achievements[0])
            }, 1000)
        }
    }
}

function showStreakCelebration(days) {
    celebrationType.value = 'streak'
    celebrationIcon.value = 'zap'
    celebrationTitle.value = `${days} ngày liên tiếp!`
    celebrationMessage.value = 'Bạn đang giữ streak rất tốt! Tiếp tục phát huy nhé!'
    celebrationXP.value = XP_REWARDS.STREAK_BONUS * days
    showCelebration.value = true
}

function showLevelUpCelebration(level) {
    celebrationType.value = 'level'
    celebrationIcon.value = 'star'
    celebrationTitle.value = `Level ${level}!`
    celebrationMessage.value = 'Chúc mừng bạn đã lên level mới!'
    celebrationXP.value = 0
    showCelebration.value = true
}

function showAchievementCelebration(achievement) {
    celebrationType.value = 'achievement'
    celebrationIcon.value = achievement.icon
    celebrationTitle.value = achievement.name
    celebrationMessage.value = achievement.description
    celebrationXP.value = 0
    showCelebration.value = true
}

function reviewAgain() {
    // Filter wrong cards and restart
    const wrongCards = results.value
        .filter(r => r.quality < 3)
        .map(r => cards.value.find(c => c.wordId === r.wordId))
        .filter(Boolean)

    cards.value = wrongCards
    currentIndex.value = 0
    results.value = []
    isComplete.value = false

    if (reviewCardRef.value) {
        reviewCardRef.value.reset()
    }
}

function goBack() {
    router.push('/')
}
</script>

<style scoped>
.review-view {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    min-height: 100vh;
}

.review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.review-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    color: var(--text-primary);
}

.header-spacer {
    width: 80px;
}

/* Progress */
.review-progress {
    margin-bottom: 2rem;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.progress-stats {
    display: flex;
    gap: 1rem;
}

.progress-stats .stat {
    font-weight: 600;
}

.progress-stats .correct {
    color: var(--mint-500);
}

.progress-stats .wrong {
    color: #ef5350;
}

.progress-bar {
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--mint-400), var(--mint-500));
    border-radius: 4px;
    transition: width 0.5s ease;
}

/* Review Content */
.review-content {
    margin-bottom: 2rem;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 3rem 2rem;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-state h2 {
    font-size: 1.5rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

/* Loading */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: var(--text-muted);
}

.loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--border-color);
    border-top-color: var(--mint-500);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Completion Screen */
.completion-screen {
    text-align: center;
    padding: 2.5rem 2rem;
}

.completion-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 1s ease infinite;
}

@keyframes bounce {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

.completion-title {
    font-size: 1.75rem;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
}

.completion-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-item {
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
}

.stat-value {
    display: block;
    font-size: 1.75rem;
    font-weight: 700;
}

.stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
}

.correct-stat .stat-value {
    color: var(--mint-500);
}

.accuracy-stat .stat-value {
    color: var(--text-primary);
}

.wrong-stat .stat-value {
    color: #ef5350;
}

.xp-earned {
    margin-bottom: 1.5rem;
}

.xp-badge {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    background: linear-gradient(135deg, #ffd700 0%, #ff9800 100%);
    color: #333;
    font-weight: 700;
    font-size: 1.1rem;
    border-radius: 999px;
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.completion-message {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
    font-size: 1rem;
}

.completion-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.completion-actions .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

@media (max-width: 480px) {
    .review-header {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .review-title {
        order: -1;
        width: 100%;
        justify-content: center;
        margin-bottom: 0.5rem;
    }

    .header-spacer {
        display: none;
    }

    .completion-stats {
        grid-template-columns: repeat(3, 1fr);
    }

    .stat-value {
        font-size: 1.5rem;
    }
}
</style>
