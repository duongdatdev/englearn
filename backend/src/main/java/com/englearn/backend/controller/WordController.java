package com.englearn.backend.controller;

import com.englearn.backend.model.Word;
import com.englearn.backend.repository.WordRepository;
import com.englearn.backend.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/words")
@CrossOrigin(origins = "http://localhost:3000")
public class WordController {

    @Autowired
    private WordRepository wordRepository;
    
    @Autowired
    private TopicRepository topicRepository;

    @GetMapping
    public List<Word> getAllWords() {
        return wordRepository.findAll();
    }
    
    @GetMapping("/topic/{topicId}")
    public List<Word> getWordsByTopicId(@PathVariable Long topicId) {
        return wordRepository.findByTopicId(topicId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Word> getWordById(@PathVariable Long id) {
        return wordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/random")
    public List<Word> getRandomWords(@RequestParam(defaultValue = "10") int limit) {
        return wordRepository.findRandomWords(limit);
    }

    @PostMapping
    public ResponseEntity<Word> createWord(@RequestBody Word word) {
        if (word.getTopic() != null && word.getTopic().getId() != null) {
            return topicRepository.findById(word.getTopic().getId())
                .map(topic -> {
                    word.setTopic(topic);
                    return ResponseEntity.ok(wordRepository.save(word));
                })
                .orElse(ResponseEntity.badRequest().build());
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Word> updateWord(@PathVariable Long id, @RequestBody Word wordDetails) {
        return wordRepository.findById(id)
                .map(word -> {
                    word.setEnglish(wordDetails.getEnglish());
                    word.setVietnamese(wordDetails.getVietnamese());
                    word.setMeaning(wordDetails.getMeaning());
                    word.setPronunciation(wordDetails.getPronunciation());
                    word.setSynonyms(wordDetails.getSynonyms());
                    word.setAntonyms(wordDetails.getAntonyms());
                    word.setExample(wordDetails.getExample());
                    word.setGrammar(wordDetails.getGrammar());
                    word.setWordForms(wordDetails.getWordForms());
                    
                    if (wordDetails.getTopic() != null && wordDetails.getTopic().getId() != null) {
                        topicRepository.findById(wordDetails.getTopic().getId()).ifPresent(word::setTopic);
                    }
                    return ResponseEntity.ok(wordRepository.save(word));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWord(@PathVariable Long id) {
        return wordRepository.findById(id)
                .map(word -> {
                    wordRepository.delete(word);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
