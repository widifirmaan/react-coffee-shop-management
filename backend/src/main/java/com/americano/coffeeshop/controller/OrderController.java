package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import com.americano.coffeeshop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable String id, @RequestParam OrderStatus status) {
        return orderService.updateOrderStatus(id, status);
    }
}
