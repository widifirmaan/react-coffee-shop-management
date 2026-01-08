package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findAllByOrderByDateDesc();

    Optional<Transaction> findByRelatedOrderId(String relatedOrderId);

    void deleteByRelatedOrderId(String relatedOrderId);
}
