<template>
    <div class="grammar-view container animate-fadeIn">
        <div class="header-section text-center">
            <h1 class="page-title">
                12 English Tenses
            </h1>
            <p class="page-subtitle">
                Master English grammar with AI-powered lessons. Select a tense below to start learning theory, examples,
                and practice exercises.
            </p>
        </div>

        <!-- Tense Groups -->
        <div class="tenses-grid">
            <!-- Present Tenses -->
            <div class="tense-group">
                <div class="group-header present">
                    <h2 class="group-title">Present Tenses</h2>
                    <p class="group-desc">Hành động ở hiện tại</p>
                </div>
                <div class="card-list">
                    <div v-for="tense in presentTenses" :key="tense" @click="goToLesson(tense)" class="tense-card">
                        <div class="card-content">
                            <h3 class="card-title">
                                {{ tense }}
                            </h3>
                            <FeatherIcon type="chevron-right" :size="20" class="card-icon" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Past Tenses -->
            <div class="tense-group">
                <div class="group-header past">
                    <h2 class="group-title">Past Tenses</h2>
                    <p class="group-desc">Hành động trong quá khứ</p>
                </div>
                <div class="card-list">
                    <div v-for="tense in pastTenses" :key="tense" @click="goToLesson(tense)" class="tense-card">
                        <div class="card-content">
                            <h3 class="card-title">
                                {{ tense }}
                            </h3>
                            <FeatherIcon type="chevron-right" :size="20" class="card-icon" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Future Tenses -->
            <div class="tense-group">
                <div class="group-header future">
                    <h2 class="group-title">Future Tenses</h2>
                    <p class="group-desc">Hành động trong tương lai</p>
                </div>
                <div class="card-list">
                    <div v-for="tense in futureTenses" :key="tense" @click="goToLesson(tense)" class="tense-card">
                        <div class="card-content">
                            <h3 class="card-title">
                                {{ tense }}
                            </h3>
                            <FeatherIcon type="chevron-right" :size="20" class="card-icon" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import FeatherIcon from '../components/FeatherIcon.vue'

const router = useRouter()

const tenses = [
    "Present Simple", "Present Continuous", "Present Perfect", "Present Perfect Continuous",
    "Past Simple", "Past Continuous", "Past Perfect", "Past Perfect Continuous",
    "Future Simple", "Future Continuous", "Future Perfect", "Future Perfect Continuous"
]

const presentTenses = computed(() => tenses.filter(t => t.startsWith('Present')))
const pastTenses = computed(() => tenses.filter(t => t.startsWith('Past')))
const futureTenses = computed(() => tenses.filter(t => t.startsWith('Future')))

const goToLesson = (tense) => {
    // Use kebab-case for URL
    const slug = tense.toLowerCase().replace(/\s+/g, '-')
    router.push(`/grammar/${slug}`)
}
</script>

<style scoped>
.grammar-view {
    min-height: 80vh;
    padding: 2rem 1rem;
    max-width: 1200px;
    margin: 0 auto;
}

.header-section {
    margin-bottom: 2.5rem;
    text-align: center;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    /* Fallback or required for clip */
    display: inline-block;
}

.page-subtitle {
    color: var(--text-muted);
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto;
}

/* Grid Layout */
.tenses-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 2rem;
}

@media (min-width: 900px) {
    .tenses-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Group Headers */
.group-header {
    padding-left: 1rem;
    margin-bottom: 1rem;
    border-left-width: 4px;
    border-left-style: solid;
}

.group-header.present {
    border-left-color: #3b82f6;
}

/* Blue */
.group-header.past {
    border-left-color: #10b981;
}

/* Green */
.group-header.future {
    border-left-color: #8b5cf6;
}

/* Purple */

.group-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.group-desc {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin: 0;
}

/* Card List */
.card-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.tense-card {
    background-color: var(--card-bg);
    padding: 1rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.tense-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-color: var(--mint-400);
}

.card-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    transition: color 0.15s;
}

.tense-card:hover .card-title {
    color: var(--mint-600);
}

.card-icon {
    color: var(--text-muted);
    transition: color 0.15s;
}

.tense-card:hover .card-icon {
    color: var(--mint-600);
}
</style>
