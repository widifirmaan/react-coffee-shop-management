package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByStatusOrderByCreatedAtDesc(String status);
}
