package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import com.americano.coffeeshop.model.Employee;
import com.americano.coffeeshop.dto.UpdateOrderRequest;
import com.americano.coffeeshop.repository.OrderRepository;
import com.americano.coffeeshop.repository.AttendanceRepository;
import com.americano.coffeeshop.repository.EmployeeRepository;
import com.americano.coffeeshop.service.OrderService;
import com.americano.coffeeshop.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final TransactionService transactionService;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public Order createOrder(Order order) {
        order.setStatus(OrderStatus.PENDING);

        // Auto-populate shift staff based on who's currently working
        Order.ShiftStaff shiftStaff = new Order.ShiftStaff();
        var workingToday = attendanceRepository.findByDateAndStatus(LocalDate.now(), "WORKING");

        for (var att : workingToday) {
            // Get employee to fetch position
            Employee employee = employeeRepository.findById(att.getEmployeeId()).orElse(null);
            if (employee == null || employee.getPosition() == null)
                continue;

            String position = employee.getPosition();
            String staffName = att.getEmployeeName() + " (" + att.getEmployeeId() + ")";

            if (position.equalsIgnoreCase("CASHIER")) {
                shiftStaff.setCashier(staffName);
            } else if (position.equalsIgnoreCase("BARISTA")) {
                shiftStaff.setBarista(staffName);
            } else if (position.equalsIgnoreCase("KITCHEN_STAFF")) {
                shiftStaff.setKitchenStaff(staffName);
            } else if (position.equalsIgnoreCase("WAITER")) {
                shiftStaff.setWaiter(staffName);
            } else if (position.equalsIgnoreCase("CLEANING_SERVICE")) {
                shiftStaff.setCleaningService(staffName);
            }
        }

        order.setShiftStaff(shiftStaff);

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

    @Override
    public Order updateOrder(String id, UpdateOrderRequest request) {
        try {
            System.out.println("=== UPDATE ORDER START ===");
            System.out.println("Order ID: " + id);

            Order existingOrder = orderRepository.findById(id).orElse(null);
            if (existingOrder == null) {
                System.err.println("Order not found: " + id);
                return null;
            }

            System.out.println("Existing items: " + existingOrder.getItems().size());
            System.out.println("New items: " + request.getItems().size());

            // Update items
            existingOrder.setItems(request.getItems());

            // Recalculate total amount using BigDecimal
            java.math.BigDecimal totalAmount = request.getItems().stream()
                    .map(item -> item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            existingOrder.setTotalAmount(totalAmount);

            // Update payment method
            if (request.getPaymentMethod() != null) {
                existingOrder.setPaymentMethod(request.getPaymentMethod());
            }

            System.out.println("New total: " + totalAmount);

            // Update customer info if changed
            if (request.getCustomerName() != null) {
                existingOrder.setCustomerName(request.getCustomerName());
                System.out.println("Updated customer: " + request.getCustomerName());
            }
            if (request.getTableNumber() != null) {
                existingOrder.setTableNumber(request.getTableNumber());
                System.out.println("Updated table: " + request.getTableNumber());
            }
            if (request.getStatus() != null) {
                // If status changes to COMPLETED, record income
                if (request.getStatus() == OrderStatus.COMPLETED
                        && existingOrder.getStatus() != OrderStatus.COMPLETED) {
                    transactionService.recordOrderIncome(existingOrder.getId(), existingOrder.getTotalAmount());
                }
                existingOrder.setStatus(request.getStatus());
                System.out.println("Updated status: " + request.getStatus());
            }

            System.out.println("Saving order...");
            Order saved = orderRepository.save(existingOrder);
            System.out.println("=== UPDATE ORDER SUCCESS ===");
            return saved;
        } catch (Exception e) {
            System.err.println("=== UPDATE ORDER ERROR ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update order: " + e.getMessage(), e);
        }
    }
}
