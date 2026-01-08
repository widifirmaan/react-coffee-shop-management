package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private String orderNumber;
    private String tableNumber; // String to support "Takeaway"
    private String customerName;
    private List<OrderItem> items;

    // Financials
    private Double totalPrice;
    private Double tax;
    private Double grandTotal;

    // Status & Notes
    private OrderStatus status;
    private String note;
    private String paymentMethod;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Staff Assignment
    private String assignedStaffId;
    private String assignedStaffName;

    @Data
    public static class OrderItem {
        private String menuId;
        private String menuName;
        private int quantity;
        private Double price;
    }
}
