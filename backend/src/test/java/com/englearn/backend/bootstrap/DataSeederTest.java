package com.englearn.backend.bootstrap;

import com.englearn.backend.BackendApplication;
import com.englearn.backend.repository.WordRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = BackendApplication.class)
public class DataSeederTest {

    @Autowired
    private WordRepository wordRepository;

    @Test
    public void testSeeding() {
        System.out.println("Checking vocabulary count...");
        try {
            // Wait for potential async seeding if any (though CommandLineRunner is sync)
            Thread.sleep(1000); 
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        
        long count = wordRepository.count();
        System.out.println("Vocabulary count: " + count);
        Assertions.assertTrue(count > 0, "Vocabulary should be seeded and count > 0");
    }
}
