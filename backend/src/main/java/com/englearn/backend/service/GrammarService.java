package com.englearn.backend.service;

import com.englearn.backend.dto.AIResponse;
import com.englearn.backend.model.GrammarLesson;
import com.englearn.backend.repository.GrammarLessonRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GrammarService {

    @Autowired
    private GrammarLessonRepository grammarLessonRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ObjectMapper objectMapper;

    public GrammarLesson getLesson(String tenseName, boolean refresh) {
        // 1. Check DB if not refreshing
        if (!refresh) {
            Optional<GrammarLesson> existingLesson = grammarLessonRepository.findByTenseName(tenseName);
            if (existingLesson.isPresent()) {
                return existingLesson.get();
            }
        }

        // 2. Generate AI content
        AIResponse response = geminiService.generateGrammarLesson(tenseName);

        if (!response.isSuccess()) {
             throw new RuntimeException("Failed to generate lesson: " + response.getMessage());
        }

        // 3. Save to DB (Update if exists or create new)
        GrammarLesson lesson;
        Optional<GrammarLesson> existingLesson = grammarLessonRepository.findByTenseName(tenseName);
        if (existingLesson.isPresent()) {
            lesson = existingLesson.get();
        } else {
            lesson = new GrammarLesson();
            lesson.setTenseName(tenseName);
        }

        lesson.setTitle(response.getTitle());
        lesson.setDescription(response.getDescription());
        lesson.setStructure(response.getStructure());
        lesson.setUsage(response.getUsage());
        
        // Convert Lists to JsonNode
        lesson.setExamples(objectMapper.valueToTree(response.getUsageExamples()));
        lesson.setExercises(objectMapper.valueToTree(response.getQuestions()));

        return grammarLessonRepository.save(lesson);
    }
}
