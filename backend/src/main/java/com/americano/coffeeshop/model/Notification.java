package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String type; // CALL_WAITER, ORDER_READY, etc.
    private String message;
    private String tableNumber;
    private boolean isRead = false;
    private LocalDateTime timestamp = LocalDateTime.now();
}
