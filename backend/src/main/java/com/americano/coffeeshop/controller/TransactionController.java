package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.TransactionDTO;
import com.americano.coffeeshop.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public List<TransactionDTO> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @PostMapping
    public TransactionDTO addTransaction(@RequestBody TransactionDTO transaction) {
        return transactionService.addTransaction(transaction);
    }
}
