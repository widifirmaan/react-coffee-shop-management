package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Transaction;
import java.util.List;

public interface TransactionService {
    List<Transaction> getAllTransactions();

    Transaction addTransaction(Transaction transaction);

    Transaction recordOrderIncome(String orderId, java.math.BigDecimal amount);
}
