package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String tableNumber; // "Takeaway" or Table Number
    private String customerName;
    private List<OrderItem> items;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt = LocalDateTime.now();

    @Data
    public static class OrderItem {
        private String menuId;
        private String menuName;
        private int quantity;
        private BigDecimal price;
    }
}
