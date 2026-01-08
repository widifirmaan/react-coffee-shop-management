package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private String id;
    private String orderNumber;
    private String customerName;
    private String tableNumber; // String now
    private List<Order.OrderItem> items;
    private Double totalPrice;
    private Double tax;
    private Double grandTotal;
    private OrderStatus status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private String note;
    private String assignedStaffId;
    private String assignedStaffName;

    public static OrderDTO fromEntity(Order order) {
        if (order == null)
            return null;
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setCustomerName(order.getCustomerName());
        dto.setTableNumber(order.getTableNumber());
        dto.setItems(order.getItems());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setTax(order.getTax());
        dto.setGrandTotal(order.getGrandTotal());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setNote(order.getNote());
        dto.setAssignedStaffId(order.getAssignedStaffId());
        dto.setAssignedStaffName(order.getAssignedStaffName());
        return dto;
    }
}
