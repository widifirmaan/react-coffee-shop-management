package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.CreateOrderRequest;
import com.americano.coffeeshop.dto.OrderDTO;
import com.americano.coffeeshop.dto.UpdateOrderRequest;
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
    public List<OrderDTO> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PostMapping
    public OrderDTO createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @PatchMapping("/{id}/status")
    public OrderDTO updateStatus(@PathVariable String id, @RequestParam OrderStatus status) {
        return orderService.updateOrderStatus(id, status);
    }

    @PutMapping("/{id}")
    public OrderDTO updateOrder(@PathVariable String id, @RequestBody UpdateOrderRequest request) {
        return orderService.updateOrder(id, request);
    }
}
