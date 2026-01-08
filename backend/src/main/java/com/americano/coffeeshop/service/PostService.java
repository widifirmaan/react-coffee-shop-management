package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.PostDTO;
import java.util.List;

public interface PostService {
    List<PostDTO> getAllPosts();

    List<PostDTO> getPublishedPosts();

    PostDTO getPostById(String id);

    PostDTO createPost(PostDTO post);

    PostDTO updatePost(String id, PostDTO post);

    void deletePost(String id);
}
