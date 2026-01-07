package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import lombok.Data;
import java.util.List;

@Data
public class UpdateOrderRequest {
    private List<Order.OrderItem> items;
    private String customerName;
    private String tableNumber;
    private OrderStatus status;
    private String paymentMethod;
}
