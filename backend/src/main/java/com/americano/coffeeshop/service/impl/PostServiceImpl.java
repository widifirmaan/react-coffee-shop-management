package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.PostDTO;
import com.americano.coffeeshop.model.Post;
import com.americano.coffeeshop.repository.PostRepository;
import com.americano.coffeeshop.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    @Override
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
                .map(PostDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<PostDTO> getPublishedPosts() {
        return postRepository.findByStatus("PUBLISHED").stream()
                .map(PostDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PostDTO getPostById(String id) {
        return postRepository.findById(id).map(PostDTO::fromEntity).orElse(null);
    }

    @Override
    public PostDTO createPost(PostDTO postDto) {
        Post post = postDto.toEntity();
        if (post.getPublishedAt() == null && "PUBLISHED".equalsIgnoreCase(post.getStatus())) {
            post.setPublishedAt(LocalDateTime.now());
        }
        return PostDTO.fromEntity(postRepository.save(post));
    }

    @Override
    public PostDTO updatePost(String id, PostDTO postDto) {
        Post existing = postRepository.findById(id).orElseThrow();
        Post update = postDto.toEntity();

        existing.setTitle(update.getTitle());
        existing.setExcerpt(update.getExcerpt());
        existing.setContent(update.getContent());
        existing.setImageUrl(update.getImageUrl());
        existing.setCategory(update.getCategory());
        existing.setStatus(update.getStatus());

        if ("PUBLISHED".equalsIgnoreCase(existing.getStatus()) && existing.getPublishedAt() == null) {
            existing.setPublishedAt(LocalDateTime.now());
        }

        return PostDTO.fromEntity(postRepository.save(existing));
    }

    @Override
    public void deletePost(String id) {
        postRepository.deleteById(id);
    }
}
