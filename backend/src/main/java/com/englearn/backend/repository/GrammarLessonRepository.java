package com.englearn.backend.repository;

import com.englearn.backend.model.GrammarLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GrammarLessonRepository extends JpaRepository<GrammarLesson, Long> {
    Optional<GrammarLesson> findByTenseName(String tenseName);
}
