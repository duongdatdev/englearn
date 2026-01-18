package com.englearn.backend.repository;

import com.englearn.backend.model.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {
    List<Word> findByTopicId(Long topicId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM words ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    List<Word> findRandomWords(@org.springframework.web.bind.annotation.PathVariable("limit") int limit);
}
