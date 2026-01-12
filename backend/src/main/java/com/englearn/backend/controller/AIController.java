package com.englearn.backend.controller;

import com.englearn.backend.dto.AIRequest;
import com.englearn.backend.dto.AIResponse;
import com.englearn.backend.service.GeminiService;
import com.englearn.backend.repository.WordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private WordRepository wordRepository;

    /**
     * Generate synonyms and antonyms for a word
     */
    @PostMapping("/synonyms-antonyms")
    public ResponseEntity<AIResponse> getSynonymsAntonyms(@RequestBody AIRequest request) {
        if (request.getWord() == null || request.getWord().isBlank()) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp từ cần tìm")
                    .build()
            );
        }
        AIResponse response = geminiService.generateSynonymsAntonyms(request.getWord());
        return ResponseEntity.ok(response);
    }

    /**
     * Check spelling with semantic matching
     * Accepts equivalent Vietnamese meanings
     */
    @PostMapping("/spell-check")
    public ResponseEntity<AIResponse> checkSpelling(@RequestBody AIRequest request) {
        if (request.getInput() == null || request.getExpected() == null) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp input và expected")
                    .build()
            );
        }
        AIResponse response = geminiService.checkSpelling(
            request.getInput(), 
            request.getExpected(),
            request.getContext()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get detailed word explanation
     */
    @PostMapping("/explain")
    public ResponseEntity<AIResponse> explainWord(@RequestBody AIRequest request) {
        if (request.getWord() == null || request.getWord().isBlank()) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp từ cần giải thích")
                    .build()
            );
        }
        AIResponse response = geminiService.explainWord(request.getWord(), request.getContext());
        return ResponseEntity.ok(response);
    }

    /**
     * Generate example sentences
     */
    @PostMapping("/sentences")
    public ResponseEntity<AIResponse> generateSentences(@RequestBody AIRequest request) {
        if (request.getWord() == null || request.getWord().isBlank()) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp từ cần tạo câu")
                    .build()
            );
        }
        AIResponse response = geminiService.generateSentences(request.getWord(), request.getLevel());
        return ResponseEntity.ok(response);
    }

    /**
     * Get quiz hint without revealing answer
     */
    @PostMapping("/quiz-hint")
    public ResponseEntity<AIResponse> getQuizHint(@RequestBody AIRequest request) {
        if (request.getQuestion() == null || request.getCorrectAnswer() == null) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp câu hỏi và đáp án đúng")
                    .build()
            );
        }
        AIResponse response = geminiService.getQuizHint(
            request.getQuestion(),
            request.getWrongAnswer(),
            request.getCorrectAnswer()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Smart search with fuzzy matching
     */
    @PostMapping("/smart-search")
    public ResponseEntity<AIResponse> smartSearch(@RequestBody AIRequest request) {
        if (request.getInput() == null || request.getInput().isBlank()) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp từ khóa tìm kiếm")
                    .build()
            );
        }
        
        // Get all words from database for searching
        List<String> wordList = wordRepository.findAll().stream()
            .map(word -> word.getEnglish())
            .collect(Collectors.toList());
        
        AIResponse response = geminiService.smartSearch(request.getInput(), wordList);
        return ResponseEntity.ok(response);
    }

    /**
     * Generate paragraph with fill-in-the-blank for vocabulary practice
     */
    @PostMapping("/paragraph-blanks")
    public ResponseEntity<AIResponse> generateParagraphBlanks(@RequestBody AIRequest request) {
        if (request.getWords() == null || request.getWords().isEmpty()) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp danh sách từ vựng")
                    .build()
            );
        }
        
        String topic = request.getTopic() != null ? request.getTopic() : "General Business";
        AIResponse response = geminiService.generateParagraphWithBlanks(request.getWords(), topic);
        return ResponseEntity.ok(response);
    }

    /**
     * Grade a user's sentence using a vocabulary word
     */
    @PostMapping("/grade-sentence")
    public ResponseEntity<AIResponse> gradeSentence(@RequestBody AIRequest request) {
        if (request.getWord() == null || request.getUserSentence() == null) {
            return ResponseEntity.badRequest().body(
                AIResponse.builder()
                    .success(false)
                    .message("Vui lòng cung cấp từ vựng và câu cần chấm điểm")
                    .build()
            );
        }
        
        String vietnamese = request.getVietnamese() != null ? request.getVietnamese() : "";
        AIResponse response = geminiService.gradeSentence(
            request.getWord(),
            vietnamese,
            request.getUserSentence()
        );
        return ResponseEntity.ok(response);
    }
}
