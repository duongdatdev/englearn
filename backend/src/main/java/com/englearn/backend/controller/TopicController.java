package com.englearn.backend.controller;

import com.englearn.backend.model.Topic;
import com.englearn.backend.repository.TopicRepository;
import com.englearn.backend.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
@CrossOrigin(origins = "http://localhost:3000")
public class TopicController {

    @Autowired
    private TopicRepository topicRepository;
    
    @Autowired
    private BookRepository bookRepository;

    @GetMapping
    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }
    
    @GetMapping("/book/{bookId}")
    public List<Topic> getTopicsByBookId(@PathVariable Long bookId) {
        return topicRepository.findByBookId(bookId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long id) {
        return topicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Topic> createTopic(@RequestBody Topic topic) {
        if (topic.getBook() != null && topic.getBook().getId() != null) {
            return bookRepository.findById(topic.getBook().getId())
                .map(book -> {
                    topic.setBook(book);
                    return ResponseEntity.ok(topicRepository.save(topic));
                })
                .orElse(ResponseEntity.badRequest().build());
        }
        return ResponseEntity.badRequest().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable Long id, @RequestBody Topic topicDetails) {
        return topicRepository.findById(id)
                .map(topic -> {
                    topic.setName(topicDetails.getName());
                    if (topicDetails.getBook() != null && topicDetails.getBook().getId() != null) {
                         // Optional: update book reference if provided
                         bookRepository.findById(topicDetails.getBook().getId()).ifPresent(topic::setBook);
                    }
                    return ResponseEntity.ok(topicRepository.save(topic));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        return topicRepository.findById(id)
                .map(topic -> {
                    topicRepository.delete(topic);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
