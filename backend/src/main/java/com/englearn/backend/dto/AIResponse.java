package com.englearn.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

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
    
    // Word Explanation
    private String wordExplanation;
    private String grammarNote;
    private List<String> usageExamples;
    
    // Sentence Generator
    private List<String> sentences;
    
    // Quiz Hint
    private String hint;
    private String memoryTip;
}
