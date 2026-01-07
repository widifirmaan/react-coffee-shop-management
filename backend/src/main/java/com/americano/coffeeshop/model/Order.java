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
    private String notes; // Customer notes (e.g. less sugar)
    private String paymentMethod; // e.g., CASH, QRIS, DEBIT
    private LocalDateTime createdAt = LocalDateTime.now();

    // Shift Staff Information (employees working during this order)
    private ShiftStaff shiftStaff;

    @Data
    public static class ShiftStaff {
        private String cashier;
        private String barista;
        private String kitchenStaff;
        private String waiter;
        private String cleaningService;
    }

    @Data
    public static class OrderItem {
        private String menuId;
        private String menuName;
        private int quantity;
        private BigDecimal price;
    }
}
