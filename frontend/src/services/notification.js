/**
 * Notification Service
 * Manages user notifications using localStorage
 */

const NOTIFICATION_KEY = 'englearn_notifications'

/**
 * Notification Types
 */
export const NOTIFICATION_TYPE = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    SRS: 'srs',
    ACHIEVEMENT: 'achievement'
}

/**
 * Get all notifications
 */
export function getNotifications() {
    const data = localStorage.getItem(NOTIFICATION_KEY)
    return data ? JSON.parse(data) : []
}

/**
 * Save notifications
 */
function saveNotifications(notifications) {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))
}

/**
 * Add a new notification
 * @param {object} notification { title, message, type, link }
 */
export function addNotification({ title, message, type = NOTIFICATION_TYPE.INFO, link = null }) {
    const notifications = getNotifications()
    
    const newNotification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        link,
        read: false,
        createdAt: new Date().toISOString()
    }
    
    // Add to beginning of list
    notifications.unshift(newNotification)
    
    // Limit to 50 recent notifications
    if (notifications.length > 50) {
        notifications.pop()
    }
    
    saveNotifications(notifications)
    
    // Dispatch event for reactivity if needed elsewhere
    window.dispatchEvent(new Event('notification-updated'))
    
    return newNotification
}

/**
 * Mark a notification as read
 */
export function markAsRead(id) {
    const notifications = getNotifications()
    const index = notifications.findIndex(n => n.id === id)
    
    if (index !== -1) {
        notifications[index].read = true
        saveNotifications(notifications)
        window.dispatchEvent(new Event('notification-updated'))
    }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead() {
    const notifications = getNotifications()
    notifications.forEach(n => n.read = true)
    saveNotifications(notifications)
    window.dispatchEvent(new Event('notification-updated'))
}

/**
 * Get unread count
 */
export function getUnreadCount() {
    const notifications = getNotifications()
    return notifications.filter(n => !n.read).length
}

/**
 * Check and generate system notifications (SRS reminders, etc.)
 * This should be called on app start
 */
import { getReviewStats } from './srs.js'

export function checkSystemNotifications() {
    const today = new Date().toISOString().split('T')[0]
    const lastCheck = localStorage.getItem('englearn_last_notification_check')
    
    // Only check once per day for daily reminders
    if (lastCheck !== today) {
        // Check SRS
        const srsStats = getReviewStats()
        if (srsStats.dueToday > 0) {
            addNotification({
                title: 'Nhắc nhở ôn tập',
                message: `Bạn có ${srsStats.dueToday} từ cần ôn tập hôm nay. Hãy duy trì chuỗi Streak nhé!`,
                type: NOTIFICATION_TYPE.SRS,
                link: '/review'
            })
        }
        
        // Mark check as done for today
        localStorage.setItem('englearn_last_notification_check', today)
    }
}
