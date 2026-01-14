package com.englearn.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgressDto {
    private Integer xp;
    private Integer level;
    private Integer totalWordsLearned;
    private Integer totalReviews;
    private Integer perfectReviews;
    private Integer streak;
    private Integer maxStreak;
    private LocalDate lastActiveDate;
    private String srsData;       // JSON string
    private String achievements;   // JSON array string
    private String history;        // JSON array string
}
