<template>
    <div class="review-card" :class="{ flipped: isFlipped }">
        <div class="card-inner" @click="flip">
            <!-- Front (Question) -->
            <div class="card-front">
                <div class="card-hint">
                    <FeatherIcon type="help-circle" :size="16" />
                    <span>Bạn có nhớ nghĩa của từ này không?</span>
                </div>

                <div class="card-word">
                    {{ word.word || word.english }}
                </div>

                <button class="btn-audio" @click.stop="playAudio" v-if="word.word || word.english">
                    <FeatherIcon type="volume-2" :size="20" />
                </button>

                <div class="card-tap-hint">
                    <FeatherIcon type="rotate-cw" :size="14" />
                    Click để xem nghĩa
                </div>
            </div>

            <!-- Back (Answer) -->
            <div class="card-back">
                <div class="card-word-back">
                    {{ word.word || word.english }}
                </div>

                <div class="card-divider"></div>

                <div class="card-meaning">
                    {{ word.vietnamese }}
                </div>

                <div class="card-info" v-if="word.meaning">
                    <FeatherIcon type="info" :size="14" />
                    <span>{{ word.meaning }}</span>
                </div>
            </div>
        </div>

        <!-- Rating Buttons (show after flip) -->
        <div class="rating-buttons" v-if="isFlipped && !rated">
            <button class="rating-btn forgot" @click="rate(0)">
                <span class="rating-icon">😕</span>
                <span class="rating-label">Quên</span>
            </button>
            <button class="rating-btn hard" @click="rate(3)">
                <span class="rating-icon">🤔</span>
                <span class="rating-label">Khó</span>
            </button>
            <button class="rating-btn good" @click="rate(4)">
                <span class="rating-icon">😊</span>
                <span class="rating-label">Nhớ</span>
            </button>
            <button class="rating-btn easy" @click="rate(5)">
                <span class="rating-icon">🎯</span>
                <span class="rating-label">Dễ</span>
            </button>
        </div>

        <!-- Next Review Info (after rating) -->
        <div class="next-review-info" v-if="rated && nextReviewInfo">
            <FeatherIcon type="calendar" :size="16" />
            <span>Ôn tập lại sau {{ nextReviewInfo }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FeatherIcon from './FeatherIcon.vue'
import { updateCardProgress, QUALITY } from '../services/srs.js'

const props = defineProps({
    word: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['rated', 'next'])

const isFlipped = ref(false)
const rated = ref(false)
const nextReviewInfo = ref('')

function flip() {
    if (!rated.value) {
        isFlipped.value = !isFlipped.value
    }
}

function rate(quality) {
    const result = updateCardProgress(props.word.wordId, quality)
    rated.value = true

    if (result) {
        // Format next review info
        if (result.interval === 1) {
            nextReviewInfo.value = '1 ngày'
        } else if (result.interval < 7) {
            nextReviewInfo.value = `${result.interval} ngày`
        } else if (result.interval < 30) {
            nextReviewInfo.value = `${Math.round(result.interval / 7)} tuần`
        } else {
            nextReviewInfo.value = `${Math.round(result.interval / 30)} tháng`
        }
    }

    emit('rated', { wordId: props.word.wordId, quality, result })

    // Auto advance after rating
    setTimeout(() => {
        emit('next')
    }, 1000)
}

function playAudio() {
    const word = props.word.word || props.word.english
    if (word) {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        utterance.rate = 0.85
        speechSynthesis.speak(utterance)
    }
}

// Reset card state when word changes
function reset() {
    isFlipped.value = false
    rated.value = false
    nextReviewInfo.value = ''
}

defineExpose({ reset })
</script>

<style scoped>
.review-card {
    perspective: 1000px;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
}

.card-inner {
    position: relative;
    width: 100%;
    min-height: 280px;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.review-card.flipped .card-inner {
    transform: rotateY(180deg);
}

.card-front,
.card-back {
    position: absolute;
    width: 100%;
    min-height: 280px;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    border-radius: var(--radius-xl);
    background: var(--card-bg);
    border: 2px solid var(--border-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-back {
    transform: rotateY(180deg);
    background: linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%);
}

.card-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
}

.card-word {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
    margin-bottom: 1rem;
}

.card-word-back {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--mint-500);
    text-align: center;
}

.card-divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, var(--mint-400), var(--mint-500));
    border-radius: 2px;
    margin: 1rem 0;
}

.card-meaning {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
}

.card-info {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    color: var(--text-secondary);
    max-width: 100%;
}

.card-info span {
    line-height: 1.4;
}

.btn-audio {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--bg-secondary);
    border: 2px solid var(--border-color);
    color: var(--mint-500);
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 1rem;
}

.btn-audio:hover {
    background: var(--mint-500);
    color: white;
    border-color: var(--mint-500);
    transform: scale(1.1);
}

.card-tap-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.8rem;
    opacity: 0.7;
}

/* Rating Buttons */
.rating-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-top: 1.5rem;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.rating-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 1rem 0.5rem;
    border-radius: var(--radius-lg);
    border: 2px solid var(--border-color);
    background: var(--card-bg);
    cursor: pointer;
    transition: all 0.2s;
}

.rating-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.rating-btn.forgot:hover {
    border-color: #ef5350;
    background: rgba(239, 83, 80, 0.1);
}

.rating-btn.hard:hover {
    border-color: #ff9800;
    background: rgba(255, 152, 0, 0.1);
}

.rating-btn.good:hover {
    border-color: var(--mint-500);
    background: rgba(38, 166, 154, 0.1);
}

.rating-btn.easy:hover {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.1);
}

.rating-icon {
    font-size: 1.75rem;
}

.rating-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
}

/* Next Review Info */
.next-review-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    color: var(--mint-500);
    font-weight: 500;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@media (max-width: 480px) {
    .card-word {
        font-size: 2rem;
    }

    .rating-buttons {
        grid-template-columns: repeat(2, 1fr);
    }

    .rating-btn {
        padding: 0.75rem;
    }

    .rating-icon {
        font-size: 1.5rem;
    }
}
</style>
