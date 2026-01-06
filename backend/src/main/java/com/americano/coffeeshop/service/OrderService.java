package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import java.util.List;

public interface OrderService {
    Order createOrder(Order order);

    List<Order> getAllOrders();

    List<Order> getOrdersByStatus(OrderStatus status);

    Order updateOrderStatus(String id, OrderStatus status);
}
