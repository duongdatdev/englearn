package com.englearn.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIResponse {
    private boolean success;
    private String message;
    
    // Synonyms/Antonyms
    private List<String> synonyms;
    private List<String> antonyms;
    
    // Spell Check / Semantic Match
    private boolean isCorrect;
    private String suggestion;
    private String explanation;
    private String transcript; // For pronunciation check
    
    // Word Explanation
    private String wordExplanation;
    private String grammarNote;
    private List<String> usageExamples;
    
    // Sentence Generator
    private List<String> sentences;
    
    // Quiz Hint
    private String hint;
    private String memoryTip;
    
    // Paragraph Fill-in-the-Blank
    private String paragraph;
    private List<Map<String, Object>> blanks;
    
    // Sentence Grading
    private int score;
    private String feedback;
    private String correctedSentence;
    private String tips;
    
    // Word Type Learning
    private List<Map<String, Object>> wordTypes;  // For lesson content
    private List<Map<String, Object>> questions;  // For quiz questions
}
