package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import com.americano.coffeeshop.repository.OrderRepository;
import com.americano.coffeeshop.service.OrderService;
import com.americano.coffeeshop.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final TransactionService transactionService;

    @Override
    public Order createOrder(Order order) {
        order.setStatus(OrderStatus.PENDING);
        // Logic to deduct inventory could go here
        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    public Order updateOrderStatus(String id, OrderStatus status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            if (status == OrderStatus.COMPLETED && order.getStatus() != OrderStatus.COMPLETED) {
                transactionService.recordOrderIncome(order.getId(), order.getTotalAmount());
            }
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }
}
