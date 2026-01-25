package com.englearn.backend.repository;

import com.englearn.backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByBookId(Long bookId);
    List<Topic> findByUserId(Long userId);
    List<Topic> findByBookIdIsNullAndUserId(Long userId); // Custom decks
}
