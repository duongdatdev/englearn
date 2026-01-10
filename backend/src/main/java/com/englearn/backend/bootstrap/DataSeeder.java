package com.englearn.backend.bootstrap;

import com.englearn.backend.model.Book;
import com.englearn.backend.model.Topic;
import com.englearn.backend.model.Word;
import com.englearn.backend.repository.BookRepository;
import com.englearn.backend.repository.TopicRepository;
import com.englearn.backend.repository.WordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final TopicRepository topicRepository;
    private final WordRepository wordRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting data seeding...");

        // Clear existing data
        log.info("Clearing existing data...");
        wordRepository.deleteAll();
        topicRepository.deleteAll();
        bookRepository.deleteAll();
        log.info("Existing data cleared.");
        
        try {
            InputStream inputStream = getClass().getResourceAsStream("/vocab.json");
            if (inputStream == null) {
                log.error("vocab.json not found in resources!");
                return;
            }

            List<TopicDTO> topicDTOs = objectMapper.readValue(inputStream, new TypeReference<List<TopicDTO>>() {});
            
            for (TopicDTO topicDTO : topicDTOs) {
                // Find or create Book
                String bookName = topicDTO.book;
                Book book = bookRepository.findByName(bookName)
                        .orElseGet(() -> {
                            Book newBook = new Book();
                            newBook.setName(bookName);
                            newBook.setDescription("Official vocabulary list for " + bookName);
                            return bookRepository.save(newBook);
                        });

                // Create Topic
                Topic topic = new Topic();
                topic.setName(topicDTO.name);
                topic.setBook(book);
                topic = topicRepository.save(topic);
                
                // Create Words
                for (WordDTO wordDTO : topicDTO.words) {
                    Word word = new Word();
                    word.setEnglish(wordDTO.english);
                    word.setVietnamese(wordDTO.vietnamese);
                    word.setMeaning(wordDTO.meaning);
                    word.setWordForms(wordDTO.wordForms);
                    word.setPronunciation(wordDTO.pronunciation);
                    word.setTopic(topic);
                    wordRepository.save(word);
                }
            }
            
            log.info("Data seeding completed successfully!");
            
        } catch (Exception e) {
            log.error("Error during data seeding: ", e);
        }
    }

    // DTO Helper classes for JSON deserialization
    // Since they are only used for seeding, static inner classes are fine.
    
    @lombok.Data
    static class TopicDTO {
        private String name;
        private String book;
        private List<WordDTO> words;
    }
    
    @lombok.Data
    static class WordDTO {
        private String english;
        private String vietnamese;
        private String meaning;
        private String wordForms;
        private String pronunciation;
    }
}
