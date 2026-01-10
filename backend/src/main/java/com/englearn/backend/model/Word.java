package com.englearn.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "words")
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String english;

    @Column(nullable = false)
    private String vietnamese;

    @Column(columnDefinition = "TEXT")
    private String meaning;
    
    private String pronunciation;
    
    @Column(columnDefinition = "TEXT")
    private String synonyms;
    
    @Column(columnDefinition = "TEXT")
    private String antonyms;
    
    @Column(columnDefinition = "TEXT")
    private String example;

    @Column(columnDefinition = "TEXT")
    private String grammar;

    @Column(name = "word_forms", columnDefinition = "TEXT")
    private String wordForms;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Topic topic;
}
