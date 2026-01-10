package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
}
