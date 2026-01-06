package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.Transaction;
import com.americano.coffeeshop.model.TransactionType;
import com.americano.coffeeshop.repository.TransactionRepository;
import com.americano.coffeeshop.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByDateDesc();
    }

    @Override
    public Transaction addTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction recordOrderIncome(String orderId, BigDecimal amount) {
        Transaction t = new Transaction();
        t.setType(TransactionType.INCOME);
        t.setAmount(amount);
        t.setDescription("Order Revenue #" + orderId);
        t.setReferenceId(orderId);
        return transactionRepository.save(t);
    }
}
