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
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  /* Added shadow for better separation */
}

/* Added mint top border for flair */
.navbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--mint-400), var(--mint-600));
}

.navbar-container {
  max-width: 1400px;
  /* Increased max-width */
  margin: 0 auto;
  padding: 0 2rem;
  height: 70px;
  /* Slightly taller */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  /* Bolder logo */
  color: var(--mint-600);
  text-decoration: none;
  letter-spacing: -0.025em;
}

[data-theme="dark"] .navbar-brand {
  color: var(--mint-400);
}

.brand-icon {
  color: var(--mint-500);
  filter: drop-shadow(0 2px 4px rgba(21, 183, 158, 0.2));
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
}

.nav-link:hover {
  color: var(--mint-600);
  background-color: var(--mint-50);
}

[data-theme="dark"] .nav-link:hover {
  color: var(--mint-400);
  background-color: rgba(21, 183, 158, 0.1);
}

.nav-link.router-link-active {
  color: var(--mint-700);
  background-color: var(--mint-50);
  font-weight: 600;
}

[data-theme="dark"] .nav-link.router-link-active {
  color: var(--mint-300);
  background-color: rgba(21, 183, 158, 0.15);
}

.nav-icon {
  display: flex;
  align-items: center;
  opacity: 0.8;
}

.nav-link:hover .nav-icon {
  opacity: 1;
}

/* Register Button */
.btn-register {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-full);
  /* Pill shape */
  font-weight: 600;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 6px -1px rgba(21, 183, 158, 0.3);
}

.btn-register:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 10px -1px rgba(21, 183, 158, 0.4);
}

/* Sound Toggle */
.sound-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sound-toggle:hover {
  background-color: var(--bg-tertiary);
  color: var(--mint-500);
  border-color: var(--border-color);
}

/* User Menu */
.user-menu {
  position: relative;
  margin-left: 0.5rem;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem;
  padding-right: 1rem;
  background: var(--bg-tertiary);
  /* Light bg for user button */
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-button:hover {
  border-color: var(--mint-300);
  background-color: var(--bg-secondary);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint-500) 0%, var(--mint-600) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid var(--bg-secondary);
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
  top: calc(100% + 1rem);
  /* More spacing */
  right: 0;
  min-width: 260px;
  /* Wider */
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  z-index: 1000;
  transform-origin: top right;
}

.dropdown-header {
  padding: 1.25rem;
  background-color: var(--bg-tertiary);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
}

.user-email {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  /* More gap */
  width: 100%;
  padding: 0.85rem 1.25rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--mint-50);
  color: var(--mint-700);
}

[data-theme="dark"] .dropdown-item:hover {
  background: rgba(21, 183, 158, 0.1);
  color: var(--mint-400);
}

/* Dropdown Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media (max-width: 1024px) {
  .nav-link span:not(.nav-icon) {
    display: none;
  }

  .navbar-container {
    padding: 0 1rem;
  }
}

@media (max-width: 768px) {
  .btn-register span {
    display: none;
  }
}
</style>
