package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.CreateOrderRequest;
import com.americano.coffeeshop.dto.OrderDTO;
import com.americano.coffeeshop.dto.UpdateOrderRequest;
import com.americano.coffeeshop.model.OrderStatus;
import java.util.List;

public interface OrderService {
    List<OrderDTO> getAllOrders();

    OrderDTO createOrder(CreateOrderRequest request);

    OrderDTO updateOrderStatus(String id, OrderStatus status);

    OrderDTO updateOrder(String id, UpdateOrderRequest request);
}
