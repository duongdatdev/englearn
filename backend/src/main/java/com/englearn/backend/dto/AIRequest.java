package com.englearn.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
}
