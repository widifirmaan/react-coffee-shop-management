package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.CreateOrderRequest;
import com.americano.coffeeshop.dto.OrderDTO;
import com.americano.coffeeshop.dto.UpdateOrderRequest;
import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import com.americano.coffeeshop.model.Transaction;
import com.americano.coffeeshop.model.TransactionType;
import com.americano.coffeeshop.repository.OrderRepository;
import com.americano.coffeeshop.repository.TransactionRepository;
import com.americano.coffeeshop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public OrderDTO createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setOrderNumber(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCustomerName(request.getCustomerName());
        order.setTableNumber(request.getTableNumber());
        order.setItems(request.getItems());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setNote(request.getNote());

        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        double total = request.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        order.setTotalPrice(total);
        order.setTax(total * 0.11);
        order.setGrandTotal(total * 1.11);

        return OrderDTO.fromEntity(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(String id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id).orElseThrow();
        OrderStatus previousStatus = order.getStatus();

        // If changing from COMPLETED to any other status (requeue), delete transaction
        if (previousStatus == OrderStatus.COMPLETED && newStatus != OrderStatus.COMPLETED) {
            transactionRepository.deleteByRelatedOrderId(id);
        }

        // If changing to COMPLETED, create transaction
        if (newStatus == OrderStatus.COMPLETED && previousStatus != OrderStatus.COMPLETED) {
            // Check if transaction already exists (safety check)
            if (transactionRepository.findByRelatedOrderId(id).isEmpty()) {
                Transaction transaction = new Transaction();
                transaction.setType(TransactionType.INCOME);
                transaction.setAmount(order.getGrandTotal());
                transaction.setDescription("Order #" + order.getOrderNumber() + " - " + order.getCustomerName());
                transaction.setDate(LocalDateTime.now());
                transaction.setRelatedOrderId(id);
                transactionRepository.save(transaction);
            }
        }

        order.setStatus(newStatus);
        return OrderDTO.fromEntity(orderRepository.save(order));
    }

    @Override
    public OrderDTO updateOrder(String id, UpdateOrderRequest request) {
        Order order = orderRepository.findById(id).orElseThrow();
        if (request.getAssignedStaffId() != null) {
            order.setAssignedStaffId(request.getAssignedStaffId());
        }
        if (request.getAssignedStaffName() != null) {
            order.setAssignedStaffName(request.getAssignedStaffName());
        }
        return OrderDTO.fromEntity(orderRepository.save(order));
    }
}
