package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;

    private String title;
    private String content; // HTML or Markdown
    private String excerpt; // Short summary
    private String imageUrl; // Featured image
    private String category; // e.g. PROMO, NEWS, EVENT

    private String status; // PUBLISHED, DRAFT

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
