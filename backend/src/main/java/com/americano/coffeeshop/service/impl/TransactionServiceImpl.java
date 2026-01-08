package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.TransactionDTO;
import com.americano.coffeeshop.model.Transaction;
import com.americano.coffeeshop.repository.TransactionRepository;
import com.americano.coffeeshop.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(TransactionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionDTO addTransaction(TransactionDTO transactionDto) {
        Transaction transaction = transactionDto.toEntity();
        if (transaction.getDate() == null) {
            transaction.setDate(LocalDateTime.now());
        }
        return TransactionDTO.fromEntity(transactionRepository.save(transaction));
    }
}
