package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private LocalDateTime date = LocalDateTime.now();
    private String referenceId; // e.g. Order ID if linked
}
