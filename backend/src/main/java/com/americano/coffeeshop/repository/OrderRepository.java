package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Order;
import com.americano.coffeeshop.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByStatus(OrderStatus status);

    List<Order> findByTableNumber(String tableNumber);
}
