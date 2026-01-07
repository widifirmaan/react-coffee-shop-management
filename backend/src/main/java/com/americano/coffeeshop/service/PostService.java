package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Post;
import java.util.List;

public interface PostService {
    List<Post> getAllPosts();

    List<Post> getPublishedPosts();

    Post createPost(Post post);

    Post updatePost(String id, Post post);

    void deletePost(String id);

    Post getPostById(String id);
}
