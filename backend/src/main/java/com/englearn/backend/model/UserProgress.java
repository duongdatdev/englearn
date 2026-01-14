package com.englearn.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Gamification stats
    @Builder.Default
    private Integer xp = 0;

    @Builder.Default
    private Integer level = 1;

    @Builder.Default
    private Integer totalWordsLearned = 0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private Integer perfectReviews = 0;

    // Streak tracking
    @Builder.Default
    private Integer streak = 0;

    @Builder.Default
    private Integer maxStreak = 0;

    private LocalDate lastActiveDate;

    // SRS card data stored as JSON
    @Column(columnDefinition = "TEXT")
    private String srsData;

    // Achievement IDs stored as JSON array
    @Column(columnDefinition = "TEXT")
    private String achievements;

    // XP history stored as JSON array
    @Column(columnDefinition = "TEXT")
    private String history;
}
