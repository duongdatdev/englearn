<template>
    <Teleport to="body">
        <Transition name="celebration">
            <div class="celebration-overlay" v-if="show" @click="close">
                <div class="celebration-modal" @click.stop>
                    <!-- Confetti -->
                    <div class="confetti-container">
                        <div v-for="i in 50" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
                    </div>

                    <!-- Content -->
                    <div class="celebration-content">
                        <div class="celebration-icon" :class="animationClass">
                            {{ icon }}
                        </div>

                        <h2 class="celebration-title">{{ title }}</h2>
                        <p class="celebration-message">{{ message }}</p>

                        <div class="celebration-reward" v-if="xpReward">
                            <span class="reward-badge">+{{ xpReward }} XP</span>
                        </div>

                        <button class="btn btn-primary btn-celebrate" @click="close">
                            <FeatherIcon type="check" :size="18" />
                            Tuyệt vời!
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import FeatherIcon from './FeatherIcon.vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        default: 'streak' // streak, level, achievement
    },
    title: {
        type: String,
        default: 'Chúc mừng!'
    },
    message: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: '🎉'
    },
    xpReward: {
        type: Number,
        default: 0
    }
})

const emit = defineEmits(['close'])

const animationClass = computed(() => {
    switch (props.type) {
        case 'streak': return 'bounce-fire'
        case 'level': return 'spin-star'
        case 'achievement': return 'pulse-badge'
        default: return 'bounce'
    }
})

function close() {
    emit('close')
}

function getConfettiStyle(index) {
    const colors = ['#ff6b35', '#f7931e', '#ffd700', '#26a69a', '#4caf50', '#2196f3', '#9c27b0']
    const color = colors[index % colors.length]
    const delay = Math.random() * 2
    const left = Math.random() * 100
    const duration = 2 + Math.random() * 2
    const size = 6 + Math.random() * 8

    return {
        '--confetti-color': color,
        '--delay': `${delay}s`,
        '--left': `${left}%`,
        '--duration': `${duration}s`,
        '--size': `${size}px`
    }
}
</script>

<style scoped>
.celebration-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
}

.celebration-modal {
    position: relative;
    background: var(--card-bg);
    border-radius: var(--radius-xl);
    padding: 3rem 2rem;
    max-width: 380px;
    width: 100%;
    text-align: center;
    overflow: hidden;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
}

.confetti-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.confetti {
    position: absolute;
    width: var(--size);
    height: var(--size);
    background: var(--confetti-color);
    left: var(--left);
    top: -20px;
    border-radius: 2px;
    animation: confetti-fall var(--duration) ease-in var(--delay) infinite;
    opacity: 0;
}

.confetti:nth-child(even) {
    border-radius: 50%;
}

@keyframes confetti-fall {
    0% {
        opacity: 1;
        transform: translateY(0) rotate(0deg);
    }

    100% {
        opacity: 0;
        transform: translateY(400px) rotate(720deg);
    }
}

.celebration-content {
    position: relative;
    z-index: 1;
}

.celebration-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.celebration-icon.bounce-fire {
    animation: bounce-fire 1s ease infinite;
}

.celebration-icon.spin-star {
    animation: spin-star 2s ease infinite;
}

.celebration-icon.pulse-badge {
    animation: pulse-badge 1s ease infinite;
}

@keyframes bounce-fire {

    0%,
    100% {
        transform: translateY(0) scale(1);
    }

    50% {
        transform: translateY(-10px) scale(1.1);
    }
}

@keyframes spin-star {
    0% {
        transform: rotate(0deg) scale(1);
    }

    25% {
        transform: rotate(15deg) scale(1.1);
    }

    75% {
        transform: rotate(-15deg) scale(1.1);
    }

    100% {
        transform: rotate(0deg) scale(1);
    }
}

@keyframes pulse-badge {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.15);
    }
}

.celebration-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, var(--mint-400), var(--mint-600));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.celebration-message {
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.celebration-reward {
    margin-bottom: 1.5rem;
}

.reward-badge {
    display: inline-block;
    padding: 0.5rem 1.25rem;
    background: linear-gradient(135deg, #ffd700 0%, #ff9800 100%);
    color: #333;
    font-weight: 700;
    font-size: 1.1rem;
    border-radius: 999px;
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
    animation: pulse 2s ease infinite;
}

@keyframes pulse {

    0%,
    100% {
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
    }

    50% {
        box-shadow: 0 8px 24px rgba(255, 152, 0, 0.6);
    }
}

.btn-celebrate {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    font-size: 1rem;
    font-weight: 600;
}

/* Transitions */
.celebration-enter-active {
    animation: celebration-in 0.4s ease;
}

.celebration-leave-active {
    animation: celebration-out 0.3s ease forwards;
}

@keyframes celebration-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.celebration-enter-active .celebration-modal {
    animation: modal-in 0.4s ease;
}

@keyframes modal-in {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes celebration-out {
    to {
        opacity: 0;
    }
}
</style>
