<template>
    <div class="grammar-view container mx-auto px-4 py-8">
        <div class="mb-8 text-center">
            <h1
                class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                12 English Tenses
            </h1>
            <p class="text-gray-600 text-lg">Master English grammar with AI-powered lessons</p>
        </div>

        <!-- Tense Groups -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Present Tenses -->
            <div class="space-y-4">
                <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">Present Tenses</h2>
                <div v-for="tense in presentTenses" :key="tense" @click="goToLesson(tense)"
                    class="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-blue-300 group">
                    <h3 class="font-semibold text-lg text-gray-700 group-hover:text-blue-600 transition-colors">
                        {{ tense }}
                    </h3>
                </div>
            </div>

            <!-- Past Tenses -->
            <div class="space-y-4">
                <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">Past Tenses</h2>
                <div v-for="tense in pastTenses" :key="tense" @click="goToLesson(tense)"
                    class="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-green-300 group">
                    <h3 class="font-semibold text-lg text-gray-700 group-hover:text-green-600 transition-colors">
                        {{ tense }}
                    </h3>
                </div>
            </div>

            <!-- Future Tenses -->
            <div class="space-y-4">
                <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2">Future Tenses</h2>
                <div v-for="tense in futureTenses" :key="tense" @click="goToLesson(tense)"
                    class="bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-purple-300 group">
                    <h3 class="font-semibold text-lg text-gray-700 group-hover:text-purple-600 transition-colors">
                        {{ tense }}
                    </h3>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

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
}
</style>
