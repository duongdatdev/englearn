<template>
    <div class="dashboard-widget card">
        <!-- Stats Row -->
        <div class="stats-row">
            <!-- Streak -->
            <div class="stat-item streak" :class="{ active: streak.current > 0 }">
                <div class="stat-icon">
                    <span class="fire-icon" :class="{ burning: streak.current > 0 }">🔥</span>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{{ streak.current }}</span>
                    <span class="stat-label">Streak</span>
                </div>
            </div>

            <!-- XP & Level -->
            <div class="stat-item level">
                <div class="stat-icon">
                    <span class="level-badge">{{ stats.level }}</span>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{{ formatXP(stats.xp) }} XP</span>
                    <div class="progress-bar-mini">
                        <div class="progress-fill" :style="{ width: stats.levelProgress + '%' }"></div>
                    </div>
                </div>
            </div>

            <!-- Due Today -->
            <div class="stat-item due" :class="{ 'has-due': reviewStats.dueToday > 0 }">
                <div class="stat-icon">
                    <FeatherIcon type="clock" :size="24" />
                </div>
                <div class="stat-content">
                    <span class="stat-value">{{ reviewStats.dueToday }}</span>
                    <span class="stat-label">Cần ôn</span>
                </div>
            </div>

            <!-- Total Words -->
            <div class="stat-item total">
                <div class="stat-icon">
                    <FeatherIcon type="book-open" :size="24" />
                </div>
                <div class="stat-content">
                    <span class="stat-value">{{ reviewStats.totalCards }}</span>
                    <span class="stat-label">Từ đã học</span>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions" v-if="reviewStats.dueToday > 0">
            <button class="btn btn-primary btn-review" @click="startReview">
                <FeatherIcon type="refresh-cw" :size="16" />
                Ôn tập ngay ({{ reviewStats.dueToday }} từ)
            </button>
        </div>

        <!-- Motivation Message -->
        <div class="motivation" v-if="motivationMessage">
            <span class="motivation-icon">{{ motivationIcon }}</span>
            <span class="motivation-text">{{ motivationMessage }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FeatherIcon from './FeatherIcon.vue'
import { getReviewStats } from '../services/srs.js'
import { getStats, getStreak, checkAchievements } from '../services/gamification.js'

const router = useRouter()

const stats = ref({
    xp: 0,
    level: 1,
    levelProgress: 0
})

const streak = ref({
    current: 0,
    max: 0
})

const reviewStats = ref({
    totalCards: 0,
    dueToday: 0,
    mastered: 0
})

const motivationMessages = [
    { condition: (s, r) => r.dueToday === 0 && r.totalCards > 0, icon: '🎉', message: 'Tuyệt vời! Bạn đã hoàn thành ôn tập hôm nay!' },
    { condition: (s, r) => s.current >= 7, icon: '⚡', message: (s) => `Chuỗi ${s.current} ngày! Đừng bỏ cuộc!` },
    { condition: (s, r) => s.current >= 3, icon: '🔥', message: 'Giữ vững streak của bạn!' },
    { condition: (s, r) => r.dueToday > 10, icon: '💪', message: 'Nhiều từ cần ôn - hãy bắt đầu ngay!' },
    { condition: (s, r) => r.dueToday > 0, icon: '📚', message: 'Hãy dành vài phút ôn tập nhé!' },
    { condition: () => true, icon: '🌟', message: 'Học từ mới để mở rộng vốn từ!' }
]

const motivationMessage = computed(() => {
    for (const msg of motivationMessages) {
        if (msg.condition(streak.value, reviewStats.value)) {
            // Handle function messages
            if (typeof msg.message === 'function') {
                return msg.message(streak.value)
            }
            return msg.message
        }
    }
    return ''
})

const motivationIcon = computed(() => {
    for (const msg of motivationMessages) {
        if (msg.condition(streak.value, reviewStats.value)) {
            return msg.icon
        }
    }
    return '🌟'
})

function formatXP(xp) {
    if (xp >= 1000) {
        return (xp / 1000).toFixed(1) + 'k'
    }
    return xp || 0
}

function startReview() {
    router.push('/review')
}

function loadData() {
    try {
        const statsData = getStats()
        stats.value = {
            xp: statsData?.xp || 0,
            level: statsData?.level || 1,
            levelProgress: statsData?.levelProgress || 0
        }

        const streakData = getStreak()
        streak.value = {
            current: streakData?.current || 0,
            max: streakData?.max || 0
        }

        const reviewData = getReviewStats()
        reviewStats.value = {
            totalCards: reviewData?.totalCards || 0,
            dueToday: reviewData?.dueToday || 0,
            mastered: reviewData?.mastered || 0
        }

        checkAchievements()
    } catch (error) {
        console.error('Error loading dashboard data:', error)
    }
}

onMounted(() => {
    loadData()
})

// Expose refresh method
defineExpose({ refresh: loadData })
</script>

<style scoped>
.dashboard-widget {
    background: linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%);
    border: 1px solid var(--border-color);
    padding: 1.25rem;
    margin-bottom: 1.5rem;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: var(--radius-lg);
    background: var(--bg-primary);
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
}

.fire-icon {
    font-size: 1.5rem;
    filter: grayscale(100%);
    transition: filter 0.3s;
}

.fire-icon.burning {
    filter: none;
    animation: pulse-fire 1.5s ease-in-out infinite;
}

@keyframes pulse-fire {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}

.level-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--mint-400) 0%, var(--mint-600) 100%);
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
}

.stat-content {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.stat-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.progress-bar-mini {
    width: 60px;
    height: 4px;
    background: var(--bg-secondary);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--mint-400), var(--mint-500));
    border-radius: 2px;
    transition: width 0.5s ease;
}

.stat-item.streak.active .stat-icon {
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
}

.stat-item.due.has-due .stat-icon {
    background: linear-gradient(135deg, var(--mint-400) 0%, var(--mint-500) 100%);
    color: white;
}

.quick-actions {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.btn-review {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem;
    font-weight: 600;
    background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
    box-shadow: 0 4px 12px rgba(38, 166, 154, 0.3);
}

.btn-review:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(38, 166, 154, 0.4);
}

.motivation {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--mint-500);
}

.motivation-icon {
    font-size: 1.25rem;
}

.motivation-text {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .stats-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .stat-item {
        padding: 0.5rem;
    }

    .stat-icon {
        width: 36px;
        height: 36px;
    }

    .stat-value {
        font-size: 1rem;
    }
}
</style>
