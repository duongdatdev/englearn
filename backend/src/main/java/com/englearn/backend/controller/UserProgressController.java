package com.englearn.backend.controller;

import com.englearn.backend.dto.UserProgressDto;
import com.englearn.backend.model.User;
import com.englearn.backend.model.UserProgress;
import com.englearn.backend.repository.UserProgressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class UserProgressController {

    private final UserProgressRepository userProgressRepository;

    public UserProgressController(UserProgressRepository userProgressRepository) {
        this.userProgressRepository = userProgressRepository;
    }

    @GetMapping("/progress")
    public ResponseEntity<?> getProgress(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        UserProgress progress = userProgressRepository.findByUserId(user.getId())
                .orElse(null);

        if (progress == null) {
            // Create default progress
            progress = UserProgress.builder()
                    .user(user)
                    .xp(0)
                    .level(1)
                    .totalWordsLearned(0)
                    .totalReviews(0)
                    .perfectReviews(0)
                    .streak(0)
                    .maxStreak(0)
                    .achievements("[]")
                    .srsData("{}")
                    .history("[]")
                    .build();
            progress = userProgressRepository.save(progress);
        }

        return ResponseEntity.ok(toDto(progress));
    }

    @PutMapping("/progress")
    public ResponseEntity<?> updateProgress(@AuthenticationPrincipal User user,
                                            @RequestBody UserProgressDto dto) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        UserProgress progress = userProgressRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Progress not found"));

        // Update fields
        if (dto.getXp() != null) progress.setXp(dto.getXp());
        if (dto.getLevel() != null) progress.setLevel(dto.getLevel());
        if (dto.getTotalWordsLearned() != null) progress.setTotalWordsLearned(dto.getTotalWordsLearned());
        if (dto.getTotalReviews() != null) progress.setTotalReviews(dto.getTotalReviews());
        if (dto.getPerfectReviews() != null) progress.setPerfectReviews(dto.getPerfectReviews());
        if (dto.getStreak() != null) progress.setStreak(dto.getStreak());
        if (dto.getMaxStreak() != null) progress.setMaxStreak(dto.getMaxStreak());
        if (dto.getLastActiveDate() != null) progress.setLastActiveDate(dto.getLastActiveDate());
        if (dto.getSrsData() != null) progress.setSrsData(dto.getSrsData());
        if (dto.getAchievements() != null) progress.setAchievements(dto.getAchievements());
        if (dto.getHistory() != null) progress.setHistory(dto.getHistory());

        progress = userProgressRepository.save(progress);
        return ResponseEntity.ok(toDto(progress));
    }

    @PostMapping("/progress/sync")
    public ResponseEntity<?> syncProgress(@AuthenticationPrincipal User user,
                                          @RequestBody UserProgressDto dto) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        UserProgress progress = userProgressRepository.findByUserId(user.getId())
                .orElse(UserProgress.builder()
                        .user(user)
                        .xp(0)
                        .level(1)
                        .build());

        // Sync: take higher values (merge localStorage with server)
        progress.setXp(Math.max(progress.getXp() != null ? progress.getXp() : 0, 
                                dto.getXp() != null ? dto.getXp() : 0));
        progress.setLevel(Math.max(progress.getLevel() != null ? progress.getLevel() : 1, 
                                   dto.getLevel() != null ? dto.getLevel() : 1));
        progress.setTotalWordsLearned(Math.max(
                progress.getTotalWordsLearned() != null ? progress.getTotalWordsLearned() : 0,
                dto.getTotalWordsLearned() != null ? dto.getTotalWordsLearned() : 0));
        progress.setTotalReviews(Math.max(
                progress.getTotalReviews() != null ? progress.getTotalReviews() : 0,
                dto.getTotalReviews() != null ? dto.getTotalReviews() : 0));
        progress.setPerfectReviews(Math.max(
                progress.getPerfectReviews() != null ? progress.getPerfectReviews() : 0,
                dto.getPerfectReviews() != null ? dto.getPerfectReviews() : 0));
        progress.setStreak(Math.max(
                progress.getStreak() != null ? progress.getStreak() : 0,
                dto.getStreak() != null ? dto.getStreak() : 0));
        progress.setMaxStreak(Math.max(
                progress.getMaxStreak() != null ? progress.getMaxStreak() : 0,
                dto.getMaxStreak() != null ? dto.getMaxStreak() : 0));

        // Take the latest date
        if (dto.getLastActiveDate() != null) {
            if (progress.getLastActiveDate() == null || 
                dto.getLastActiveDate().isAfter(progress.getLastActiveDate())) {
                progress.setLastActiveDate(dto.getLastActiveDate());
            }
        }

        // For JSON data, prefer client data if server is empty
        if (dto.getSrsData() != null && (progress.getSrsData() == null || progress.getSrsData().equals("{}"))) {
            progress.setSrsData(dto.getSrsData());
        }
        if (dto.getAchievements() != null && (progress.getAchievements() == null || progress.getAchievements().equals("[]"))) {
            progress.setAchievements(dto.getAchievements());
        }
        if (dto.getHistory() != null && (progress.getHistory() == null || progress.getHistory().equals("[]"))) {
            progress.setHistory(dto.getHistory());
        }

        progress = userProgressRepository.save(progress);
        return ResponseEntity.ok(toDto(progress));
    }

    private UserProgressDto toDto(UserProgress progress) {
        return UserProgressDto.builder()
                .xp(progress.getXp())
                .level(progress.getLevel())
                .totalWordsLearned(progress.getTotalWordsLearned())
                .totalReviews(progress.getTotalReviews())
                .perfectReviews(progress.getPerfectReviews())
                .streak(progress.getStreak())
                .maxStreak(progress.getMaxStreak())
                .lastActiveDate(progress.getLastActiveDate())
                .srsData(progress.getSrsData())
                .achievements(progress.getAchievements())
                .history(progress.getHistory())
                .build();
    }
}
