package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.Post;
import com.americano.coffeeshop.repository.PostRepository;
import com.americano.coffeeshop.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @Override
    public List<Post> getPublishedPosts() {
        return postRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED");
    }

    @Override
    public Post createPost(Post post) {
        post.setCreatedAt(LocalDateTime.now());
        if (post.getStatus() == null)
            post.setStatus("DRAFT");
        return postRepository.save(post);
    }

    @Override
    public Post updatePost(String id, Post postDetails) {
        Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setTitle(postDetails.getTitle());
        post.setContent(postDetails.getContent());
        post.setExcerpt(postDetails.getExcerpt());
        post.setImageUrl(postDetails.getImageUrl());
        post.setCategory(postDetails.getCategory());
        post.setStatus(postDetails.getStatus());
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    @Override
    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    @Override
    public Post getPostById(String id) {
        return postRepository.findById(id).orElse(null);
    }
}
