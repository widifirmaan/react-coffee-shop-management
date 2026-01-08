package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.TransactionDTO;
import java.util.List;

public interface TransactionService {
    List<TransactionDTO> getAllTransactions();

    TransactionDTO addTransaction(TransactionDTO transaction);
}
