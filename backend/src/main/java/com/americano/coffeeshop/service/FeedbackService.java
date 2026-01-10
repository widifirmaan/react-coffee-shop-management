package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Feedback;
import java.util.List;

public interface FeedbackService {
    List<Feedback> getAllFeedbacks();
    Feedback createFeedback(Feedback feedback);
    void deleteFeedback(String id);
}
