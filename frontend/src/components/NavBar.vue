<template>
  <nav class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="navbar-brand">
        <FeatherIcon type="book-open" :size="24" class="brand-icon" />
        <span class="brand-text">EngLearn</span>
      </router-link>

      <div class="navbar-menu">
        <router-link to="/" class="nav-link">
          <FeatherIcon type="home" :size="18" class="nav-icon" />
          <span>Trang chủ</span>
        </router-link>
        <router-link to="/review" class="nav-link">
          <FeatherIcon type="rotate-cw" :size="18" class="nav-icon" />
          <span>Ôn tập</span>
        </router-link>
        <router-link to="/admin" class="nav-link">
          <FeatherIcon type="settings" :size="18" class="nav-icon" />
          <span>Quản lý</span>
        </router-link>
        <NotificationDropdown />
        
        <!-- Sound Toggle -->
        <button class="sound-toggle" @click="toggleSound" :title="isSoundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'">
          <FeatherIcon :type="isSoundEnabled ? 'volume-2' : 'volume-x'" :size="18" />
        </button>
        
        <ThemeToggle />
      </div>
    </div>
  </nav>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'
import FeatherIcon from './FeatherIcon.vue'
import NotificationDropdown from './NotificationDropdown.vue'
import { useSoundEffects } from '../composables/useSoundEffects.js'

const { isSoundEnabled, toggleSound } = useSoundEffects()
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

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .nav-link span:not(.nav-icon) {
    display: none;
  }
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
</style>
