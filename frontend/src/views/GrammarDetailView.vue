<template>
    <div class="grammar-detail container mx-auto px-4 py-8 max-w-4xl">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 class="text-2xl font-bold text-gray-700">Generating AI Lesson...</h2>
            <p class="text-gray-500">Please wait while we prepare the content for {{ formatTenseName(route.params.tense)
                }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-xl text-center">
            <h3 class="text-xl font-bold mb-2">Error Loading Lesson</h3>
            <p>{{ error }}</p>
            <button @click="fetchLesson" class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Try Again
            </button>
        </div>

        <!-- Content -->
        <div v-else-if="lesson" class="space-y-8">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white shadow-lg">
                <button @click="router.back()" class="mb-4 flex items-center text-blue-100 hover:text-white">
                    <span class="mr-2">←</span> Back to Tenses
                </button>
                <h1 class="text-4xl font-bold mb-2">{{ lesson.title }}</h1>
                <p class="text-blue-100 text-lg">{{ lesson.description }}</p>
            </div>

            <!-- Tabs -->
            <div class="flex space-x-2 border-b border-gray-200">
                <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id" :class="['px-6 py-3 font-medium transition-colors relative',
                    currentTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700']">
                    {{ tab.name }}
                    <div v-if="currentTab === tab.id"
                        class="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                </button>
            </div>

            <!-- Tab Content -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">

                <!-- Theory Tab -->
                <div v-if="currentTab === 'theory'" class="space-y-6">
                    <section>
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span class="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📐</span> Structure
                        </h3>
                        <div class="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-200"
                            v-html="formatMarkdown(lesson.structure)"></div>
                    </section>

                    <section>
                        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <span class="bg-green-100 text-green-600 p-2 rounded-lg mr-3">💡</span> Usage
                        </h3>
                        <div class="prose max-w-none text-gray-700" v-html="formatMarkdown(lesson.usage)"></div>
                    </section>
                </div>

                <!-- Examples Tab -->
                <div v-if="currentTab === 'examples'" class="space-y-4">
                    <h3 class="text-xl font-bold text-gray-800 mb-6">Usage Examples</h3>
                    <div v-for="(example, index) in lesson.examples" :key="index"
                        class="flex items-start bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <span
                            class="bg-blue-200 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                            {{ index + 1 }}
                        </span>
                        <p class="text-lg text-gray-800 pt-1">{{ example }}</p>
                    </div>
                </div>

                <!-- Practice Tab -->
                <div v-if="currentTab === 'practice'" class="space-y-8">
                    <div v-for="(q, index) in lesson.exercises" :key="index"
                        class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <h4 class="font-bold text-lg text-gray-800 mb-4">
                            Question {{ index + 1 }}: <span class="text-gray-600 font-normal">{{ q.question }}</span>
                        </h4>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button v-for="option in q.options" :key="option" @click="selectAnswer(index, option)"
                                :class="['p-3 rounded-lg text-left transition-all border',
                                    getOptionClass(index, option, q)]" :disabled="userAnswers[index] !== undefined">
                                {{ option }}
                            </button>
                        </div>

                        <!-- Feedback -->
                        <div v-if="userAnswers[index] !== undefined" class="mt-4 p-4 rounded-lg bg-gray-50 text-sm">
                            <p class="font-semibold" :class="isCorrect(index, q) ? 'text-green-600' : 'text-red-600'">
                                {{ isCorrect(index, q) ? '✅ Correct!' : '❌ Incorrect' }}
                            </p>
                            <p class="text-gray-600 mt-1">{{ q.explanation }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api'
import { marked } from 'marked' // We'll need marked or a similar utility if available, otherwise simple text or manual formatting

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const lesson = ref(null)
const currentTab = ref('theory')
const userAnswers = ref({})

const tabs = [
    { id: 'theory', name: 'Theory & Structure' },
    { id: 'examples', name: 'Examples' },
    { id: 'practice', name: 'Practice Quiz' }
]

const formatTenseName = (slug) => {
    return slug.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

// Simple fallback formatter if marked is not installed, but usually vue projects might have it
// If not, we can assume API sends safe text or install it. Assuming simple text for now if marked fails.
const formatMarkdown = (text) => {
    try {
        return marked.parse(text || '')
    } catch (e) {
        // Fallback: simple line breaks
        return (text || '').replace(/\n/g, '<br>')
    }
}

const fetchLesson = async () => {
    loading.value = true
    error.value = null
    try {
        const tenseName = formatTenseName(route.params.tense)
        lesson.value = await api.getGrammarLesson(tenseName)
    } catch (err) {
        error.value = err.message || 'Failed to load lesson'
    } finally {
        loading.value = false
    }
}

const selectAnswer = (questionIndex, option) => {
    userAnswers.value[questionIndex] = option
}

const isCorrect = (index, question) => {
    const selected = userAnswers.value[index]
    // Ideally backend sends options as "A. Answer", so we might need to check strict equality or contains
    // Or check if selected option starts with the correct answer letter (e.g. "A")
    // Let's assume correctAnswer is "A" or "A." or full string.
    // We'll normalize for safety.

    if (!selected) return false

    // If correctAnswer is just "A", "B"... and options are "A. ...", "B. ..."
    const optionLetter = selected.split('.')[0].trim()
    const correctLetter = question.correctAnswer.split('.')[0].trim() // Handle cases like "A. is..." or just "A"

    return optionLetter === correctLetter
}

const getOptionClass = (index, option, question) => {
    const selected = userAnswers.value[index]
    if (!selected) return 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'

    // If this option was selected
    if (selected === option) {
        return isCorrect(index, question)
            ? 'bg-green-100 border-green-500 text-green-700'
            : 'bg-red-100 border-red-500 text-red-700'
    }

    // If this is the correct answer (show it even if user picked wrong)
    const optionLetter = option.split('.')[0].trim()
    const correctLetter = question.correctAnswer.split('.')[0].trim()

    if (selected && optionLetter === correctLetter) {
        return 'bg-green-100 border-green-500 text-green-700'
    }

    return 'border-gray-200 opacity-50'
}

onMounted(() => {
    fetchLesson()
})
</script>

<style scoped>
/* Markdown Content Styling */
:deep(.prose) h1,
:deep(.prose) h2,
:deep(.prose) h3 {
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #1f2937;
}

:deep(.prose) ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
}

:deep(.prose) li {
    margin-bottom: 0.25rem;
}

:deep(.prose) p {
    margin-bottom: 1rem;
    line-height: 1.6;
}

:deep(.prose) strong {
    color: #2563eb;
    font-weight: 600;
}
</style>
