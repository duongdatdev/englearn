<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar">
            <span v-if="user">{{ getInitials(user.displayName || user.email) }}</span>
            <FeatherIcon v-else type="user" :size="40" />
          </div>
          <div class="user-info">
            <h1>{{ user?.displayName || 'Người dùng' }}</h1>
            <p class="email">{{ user?.email }}</p>
            <span class="role-badge" :class="user?.role?.toLowerCase()">
              <FeatherIcon :type="user?.role === 'ADMIN' ? 'shield' : 'user'" :size="14" />
              {{ user?.role === 'ADMIN' ? 'Admin' : 'Thành viên' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon xp">
            <FeatherIcon type="zap" :size="24" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.xp }}</span>
            <span class="stat-label">Điểm XP</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon level">
            <FeatherIcon type="star" :size="24" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.level }}</span>
            <span class="stat-label">Cấp độ</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon streak">
            <FeatherIcon type="activity" :size="24" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.streak }}</span>
            <span class="stat-label">Ngày liên tiếp</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon words">
            <FeatherIcon type="book" :size="24" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalWordsLearned }}</span>
            <span class="stat-label">Từ đã học</span>
          </div>
        </div>
      </div>

      <!-- Level Progress -->
      <div class="level-section card">
        <h2>
          <FeatherIcon type="trending-up" :size="20" />
          Tiến độ cấp độ
        </h2>
        <div class="level-progress">
          <div class="level-info">
            <span class="current-level">Level {{ stats.level }}</span>
            <span class="next-level">Level {{ stats.level + 1 }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: stats.levelProgress + '%' }"></div>
          </div>
          <p class="xp-info">{{ stats.xpInLevel }} / {{ stats.xpNeeded }} XP</p>
        </div>
      </div>

      <!-- Achievements -->
      <div class="achievements-section card">
        <h2>
          <FeatherIcon type="award" :size="20" />
          Thành tựu
        </h2>
        <div class="achievements-grid">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="achievement"
            :class="{ unlocked: achievement.unlocked }"
          >
            <div class="achievement-icon">
              <FeatherIcon :type="achievement.icon" :size="24" />
            </div>
            <div class="achievement-info">
              <span class="achievement-name">{{ achievement.name }}</span>
              <span class="achievement-desc">{{ achievement.description }}</span>
            </div>
            <div class="achievement-status">
              <FeatherIcon v-if="achievement.unlocked" type="check-circle" :size="20" />
              <FeatherIcon v-else type="lock" :size="20" />
            </div>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="account-section card">
        <h2>
          <FeatherIcon type="settings" :size="20" />
          Tài khoản
        </h2>
        <div class="account-actions">
          <button class="btn-secondary" @click="handleLogout">
            <FeatherIcon type="log-out" :size="18" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { getStats, getLevelInfo, getAchievements } from '../services/gamification.js'
import FeatherIcon from '../components/FeatherIcon.vue'

const router = useRouter()
const { user, logout, isAuthenticated } = useAuth()

const stats = ref({
  xp: 0,
  level: 1,
  streak: 0,
  totalWordsLearned: 0,
  levelProgress: 0,
  xpInLevel: 0,
  xpNeeded: 100
})

const achievements = ref([])

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }

  // Load stats from gamification service
  const gamificationStats = getStats()
  const levelInfo = getLevelInfo()
  
  stats.value = {
    xp: gamificationStats.xp,
    level: gamificationStats.level,
    streak: gamificationStats.streak,
    totalWordsLearned: gamificationStats.totalWordsLearned,
    levelProgress: levelInfo.progress,
    xpInLevel: levelInfo.xpInLevel,
    xpNeeded: levelInfo.xpNeeded
  }

  achievements.value = getAchievements()
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 64px);
  background: var(--bg-primary);
  padding: 2rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Profile Header */
.profile-header {
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  border-radius: var(--radius-2xl);
  padding: 2.5rem;
  margin-bottom: 2rem;
  color: white;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.user-info h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.email {
  opacity: 0.9;
  margin-bottom: 0.75rem;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(234, 179, 8, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.xp { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.level { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.streak { background: linear-gradient(135deg, #ef4444, #dc2626); }
.stat-icon.words { background: linear-gradient(135deg, var(--mint-500), var(--mint-600)); }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Cards */
.card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.card h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

/* Level Progress */
.level-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.current-level {
  font-weight: 600;
  color: var(--mint-500);
}

.next-level {
  color: var(--text-muted);
}

.progress-bar {
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--mint-400), var(--mint-500));
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.xp-info {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Achievements */
.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.achievement {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  opacity: 0.5;
  transition: all var(--transition-fast);
}

.achievement.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, rgba(21, 183, 158, 0.1), rgba(21, 183, 158, 0.05));
  border: 1px solid rgba(21, 183, 158, 0.2);
}

.achievement-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.achievement.unlocked .achievement-icon {
  background: var(--mint-500);
  color: white;
}

.achievement-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.achievement-name {
  font-weight: 600;
  color: var(--text-primary);
}

.achievement-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.achievement-status {
  color: var(--text-muted);
}

.achievement.unlocked .achievement-status {
  color: var(--mint-500);
}

/* Account Actions */
.account-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
