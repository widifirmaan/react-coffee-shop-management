package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByIsReadFalseOrderByTimestampDesc();
}
