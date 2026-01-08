package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Post;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostDTO {
    private String id;
    private String title;
    private String excerpt;
    private String content;
    private String imageUrl;
    private String category;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;

    public static PostDTO fromEntity(Post post) {
        if (post == null)
            return null;
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setExcerpt(post.getExcerpt());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setCategory(post.getCategory());
        dto.setStatus(post.getStatus());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setPublishedAt(post.getPublishedAt());
        return dto;
    }

    public Post toEntity() {
        Post post = new Post();
        post.setId(this.id);
        post.setTitle(this.title);
        post.setExcerpt(this.excerpt);
        post.setContent(this.content);
        post.setImageUrl(this.imageUrl);
        post.setCategory(this.category);
        post.setStatus(this.status);
        post.setCreatedAt(this.createdAt);
        post.setPublishedAt(this.publishedAt);
        return post;
    }
}
