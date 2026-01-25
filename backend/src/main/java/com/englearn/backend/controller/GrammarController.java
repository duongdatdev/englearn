package com.englearn.backend.controller;

import com.englearn.backend.model.GrammarLesson;
import com.englearn.backend.service.GrammarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grammar")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class GrammarController {

    @Autowired
    private GrammarService grammarService;

    private static final List<String> TENSES = Arrays.asList(
        "Present Simple", "Present Continuous", "Present Perfect", "Present Perfect Continuous",
        "Past Simple", "Past Continuous", "Past Perfect", "Past Perfect Continuous",
        "Future Simple", "Future Continuous", "Future Perfect", "Future Perfect Continuous"
    );

    @GetMapping
    public ResponseEntity<List<String>> getAllTenses() {
        return ResponseEntity.ok(TENSES);
    }

    @GetMapping("/{tenseName}")
    public ResponseEntity<?> getLesson(@PathVariable String tenseName) {
        try {
            // Decode URL if needed or handle cleaner strings (frontend should send proper tense name)
            // But let's assume raw string first
            GrammarLesson lesson = grammarService.getLesson(tenseName);
            return ResponseEntity.ok(lesson);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
