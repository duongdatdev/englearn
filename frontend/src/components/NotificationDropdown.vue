<template>
    <div class="notification-dropdown" v-click-outside="closeDropdown">
        <!-- Bell Icon -->
        <button class="notification-btn" @click="toggleDropdown" :class="{ active: isOpen }">
            <FeatherIcon type="bell" :size="20" />
            <span class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
        </button>

        <!-- Dropdown Content -->
        <Transition name="fade">
            <div class="dropdown-menu card" v-if="isOpen">
                <div class="dropdown-header">
                    <h3>Thông báo</h3>
                    <button class="btn-text" @click="markAllRead" v-if="unreadCount > 0">
                        Đánh dấu đã đọc
                    </button>
                </div>

                <div class="notification-list" v-if="notifications.length > 0">
                    <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                        :class="{ unread: !notification.read, clickable: notification.link }"
                        @click="handleNotificationClick(notification)">
                        
                        <div class="notif-icon" :class="getTypeClass(notification.type)">
                            <FeatherIcon :type="getIconType(notification.type)" :size="18" />
                        </div>
                        
                        <div class="notif-content">
                            <h4 class="notif-title">{{ notification.title }}</h4>
                            <p class="notif-message">{{ notification.message }}</p>
                            <span class="notif-time">{{ formatTime(notification.createdAt) }}</span>
                        </div>
                        
                        <div class="notif-status" v-if="!notification.read"></div>
                    </div>
                </div>

                <div class="empty-state" v-else>
                    <FeatherIcon type="bell-off" :size="32" />
                    <p>Không có thông báo nào</p>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import FeatherIcon from './FeatherIcon.vue'
import { 
    getNotifications, 
    getUnreadCount, 
    markAsRead, 
    markAllAsRead, 
    checkSystemNotifications,
    NOTIFICATION_TYPE 
} from '../services/notification.js'

const router = useRouter()
const isOpen = ref(false)
const notifications = ref([])
const unreadCount = ref(0)

// Click outside directive implementation locally
const vClickOutside = {
    mounted(el, binding) {
        el.clickOutsideEvent = function(event) {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event, el)
            }
        }
        document.body.addEventListener('click', el.clickOutsideEvent)
    },
    unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
    }
}

function loadNotifications() {
    notifications.value = getNotifications()
    unreadCount.value = getUnreadCount()
}

function toggleDropdown() {
    isOpen.value = !isOpen.value
}

function closeDropdown() {
    isOpen.value = false
}

function markAllRead() {
    markAllAsRead()
    loadNotifications()
}

function handleNotificationClick(notification) {
    if (!notification.read) {
        markAsRead(notification.id)
        loadNotifications()
    }
    
    if (notification.link) {
        router.push(notification.link)
        closeDropdown()
    }
}

function getTypeClass(type) {
    switch (type) {
        case NOTIFICATION_TYPE.SUCCESS: return 'icon-success'
        case NOTIFICATION_TYPE.WARNING: return 'icon-warning'
        case NOTIFICATION_TYPE.ERROR: return 'icon-error'
        case NOTIFICATION_TYPE.SRS: return 'icon-srs'
        case NOTIFICATION_TYPE.ACHIEVEMENT: return 'icon-achievement'
        default: return 'icon-info'
    }
}

function getIconType(type) {
    switch (type) {
        case NOTIFICATION_TYPE.SUCCESS: return 'check-circle'
        case NOTIFICATION_TYPE.WARNING: return 'alert-triangle'
        case NOTIFICATION_TYPE.ERROR: return 'alert-circle'
        case NOTIFICATION_TYPE.SRS: return 'clock'
        case NOTIFICATION_TYPE.ACHIEVEMENT: return 'award'
        default: return 'info'
    }
}

function formatTime(isoString) {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
}

// Event listener for updates
function onNotificationUpdate() {
    loadNotifications()
}

onMounted(() => {
    // Check for system notifications (daily reminders)
    checkSystemNotifications()
    
    // Load initial data
    loadNotifications()
    
    // Listen for updates from other components
    window.addEventListener('notification-updated', onNotificationUpdate)
})

onUnmounted(() => {
    window.removeEventListener('notification-updated', onNotificationUpdate)
})
</script>

<style scoped>
.notification-dropdown {
    position: relative;
}

.notification-btn {
    position: relative;
    background: none;
    border: none;
    padding: 0.5rem;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.notification-btn:hover, .notification-btn.active {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
}

.notification-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #ef4444;
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--navbar-bg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: -80px; /* Adjust alignment */
    margin-top: 0.75rem;
    width: 320px;
    max-height: 480px;
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    z-index: 1000;
    overflow: hidden;
}

/* Arrow tip */
.dropdown-menu::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 88px; /* Match icon center */
    width: 12px;
    height: 12px;
    background: var(--card-bg);
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
    transform: rotate(45deg);
}

.dropdown-header {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dropdown-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.btn-text {
    background: none;
    border: none;
    color: var(--mint-500);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
}

.btn-text:hover {
    text-decoration: underline;
}

.notification-list {
    overflow-y: auto;
    max-height: 400px;
}

.notification-item {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    transition: background 0.2s;
    position: relative;
}

.notification-item:hover {
    background: var(--bg-tertiary);
}

.notification-item.unread {
    background: linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent);
}

.notification-item.clickable {
    cursor: pointer;
}

.notif-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.icon-info { background: var(--bg-tertiary); color: var(--text-muted); }
.icon-success { background: rgba(16, 185, 129, 0.1); color: var(--mint-500); }
.icon-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.icon-error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.icon-srs { background: rgba(255, 107, 53, 0.1); color: #ff6b35; }
.icon-achievement { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

.notif-content {
    flex: 1;
}

.notif-title {
    margin: 0 0 0.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
}

.notif-message {
    margin: 0 0 0.25rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

.notif-time {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.notif-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--mint-500);
    position: absolute;
    top: 1rem;
    right: 1rem;
}

.empty-state {
    padding: 2rem;
    text-align: center;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

@media (max-width: 768px) {
    .dropdown-menu {
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        width: 100%;
        margin: 0;
        border-radius: 0;
        border-left: none;
        border-right: none;
        max-height: 60vh;
    }
    
    .dropdown-menu::before {
        display: none;
    }
}
</style>
