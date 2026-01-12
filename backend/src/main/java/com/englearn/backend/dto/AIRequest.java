package com.englearn.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIRequest {
    private String word;
    private String input;
    private String expected;
    private String context;
    private String level;
    private String question;
    private String wrongAnswer;
    private String correctAnswer;
    
    // For paragraph generation
    private List<Map<String, String>> words;
    private String topic;
    
    // For sentence grading
    private String userSentence;
    private String vietnamese;
}
