package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findAllByOrderByDateDesc();
}
