package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Order;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String customerName;
    private String tableNumber; // Changed to String
    private List<Order.OrderItem> items;
    private String paymentMethod;
    private String note;
}
