package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.PostDTO;
import com.americano.coffeeshop.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    @GetMapping
    public List<PostDTO> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/published")
    public List<PostDTO> getPublishedPosts() {
        return postService.getPublishedPosts();
    }

    @GetMapping("/{id}")
    public PostDTO getPostById(@PathVariable String id) {
        return postService.getPostById(id);
    }

    @PostMapping
    public PostDTO createPost(@RequestBody PostDTO post) {
        return postService.createPost(post);
    }

    @PutMapping("/{id}")
    public PostDTO updatePost(@PathVariable String id, @RequestBody PostDTO post) {
        return postService.updatePost(id, post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }
}
