<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-brand">
        <FeatherIcon type="book-open" :size="24" class="brand-icon" />
        <span class="brand-text">EngLearn</span>
      </router-link>

      <div class="navbar-menu">
        <!-- Guest navbar - minimal -->
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="nav-link">
            <FeatherIcon type="log-in" :size="18" class="nav-icon" />
            <span>Đăng nhập</span>
          </router-link>
          <router-link to="/register" class="btn-register">
            <FeatherIcon type="user-plus" :size="18" />
            <span>Đăng ký</span>
          </router-link>
        </template>

        <!-- Authenticated navbar - full features -->
        <template v-else>
          <router-link to="/" class="nav-link">
            <FeatherIcon type="home" :size="18" class="nav-icon" />
            <span>Trang chủ</span>
          </router-link>
          <router-link to="/review" class="nav-link">
            <FeatherIcon type="rotate-cw" :size="18" class="nav-icon" />
            <span>Ôn tập</span>
          </router-link>

          <router-link to="/grammar" class="nav-link">
            <FeatherIcon type="book" :size="18" class="nav-icon" />
            <span>Ngữ pháp</span>
          </router-link>

          <router-link to="/word-types" class="nav-link">
            <FeatherIcon type="git-branch" :size="18" class="nav-icon" />
            <span>Phân loại từ</span>
          </router-link>

          <router-link to="/my-decks" class="nav-link">
            <FeatherIcon type="layers" :size="18" class="nav-icon" />
            <span>Bộ từ của tôi</span>
          </router-link>

          <router-link to="/speaking-practice" class="nav-link">
            <FeatherIcon type="mic" :size="18" class="nav-icon" />
            <span>Luyện nói</span>
          </router-link>

          <!-- Admin link - only show if admin -->
          <router-link v-if="isAdmin" to="/admin" class="nav-link">
            <FeatherIcon type="settings" :size="18" class="nav-icon" />
            <span>Quản lý</span>
          </router-link>

          <NotificationDropdown />

          <!-- Sound Toggle -->
          <button class="sound-toggle" @click="toggleSound" :title="isSoundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'">
            <FeatherIcon :type="isSoundEnabled ? 'volume-2' : 'volume-x'" :size="18" />
          </button>

          <ThemeToggle />

          <!-- User Menu -->
          <div class="user-menu" ref="userMenuRef">
            <button class="user-button" @click="toggleUserMenu">
              <div class="user-avatar">
                {{ getInitials(user?.displayName || user?.email) }}
              </div>
              <FeatherIcon type="chevron-down" :size="14" class="chevron" :class="{ rotated: showUserMenu }" />
            </button>

            <Transition name="dropdown">
              <div v-if="showUserMenu" class="user-dropdown">
                <div class="dropdown-header">
                  <div class="user-info">
                    <span class="user-name">{{ user?.displayName || 'Người dùng' }}</span>
                    <span class="user-email">{{ user?.email }}</span>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                  <FeatherIcon type="user" :size="16" />
                  <span>Hồ sơ</span>
                </router-link>
                <button class="dropdown-item" @click="handleLogout">
                  <FeatherIcon type="log-out" :size="16" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <!-- Theme toggle for guests too -->
        <ThemeToggle v-if="!isAuthenticated" />
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from './ThemeToggle.vue'
import FeatherIcon from './FeatherIcon.vue'
import NotificationDropdown from './NotificationDropdown.vue'
import { useSoundEffects } from '../composables/useSoundEffects.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { isSoundEnabled, toggleSound } = useSoundEffects()
const { user, isAuthenticated, isAdmin, logout } = useAuth()

const showUserMenu = ref(false)
const userMenuRef = ref(null)

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function handleLogout() {
  showUserMenu.value = false
  logout()
  router.push('/')
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  background-color: var(--navbar-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mint-500);
  text-decoration: none;
}

.brand-icon {
  color: var(--mint-500);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--bg-tertiary);
  color: var(--mint-500);
}

.nav-link.router-link-active {
  background-color: var(--mint-100);
  color: var(--mint-700);
}

[data-theme="dark"] .nav-link.router-link-active {
  background-color: rgba(21, 183, 158, 0.2);
  color: var(--mint-400);
}

.nav-icon {
  display: flex;
  align-items: center;
}

/* Register Button */
.btn-register {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-lg);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-register:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(21, 183, 158, 0.3);
}

/* Sound Toggle */
.sound-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sound-toggle:hover {
  background-color: var(--bg-tertiary);
  color: var(--mint-500);
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem;
  padding-right: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-button:hover {
  border-color: var(--mint-500);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.chevron {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 220px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  padding: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .nav-link span:not(.nav-icon) {
    display: none;
  }

  .btn-register span {
    display: none;
  }
}
</style>
