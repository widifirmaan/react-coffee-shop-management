package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.config.DataLoader;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seeder")
@RequiredArgsConstructor
public class SeederController {

    private final DataLoader dataLoader;

    @GetMapping("/run")
    public ResponseEntity<String> runSeeder() {
        try {
            dataLoader.seed();
            return ResponseEntity.ok("Database seeded successfully!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Seeding failed: " + e.getMessage());
        }
    }
}
