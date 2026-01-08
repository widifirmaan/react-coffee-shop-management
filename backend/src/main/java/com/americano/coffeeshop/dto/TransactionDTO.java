package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Transaction;
import com.americano.coffeeshop.model.TransactionType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private String id;
    private TransactionType type;
    private Double amount;
    private String description;
    private LocalDateTime date;
    private String relatedOrderId;

    public static TransactionDTO fromEntity(Transaction transaction) {
        if (transaction == null)
            return null;
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setDate(transaction.getDate());
        dto.setRelatedOrderId(transaction.getRelatedOrderId());
        return dto;
    }

    public Transaction toEntity() {
        Transaction transaction = new Transaction();
        transaction.setId(this.id);
        transaction.setType(this.type);
        transaction.setAmount(this.amount);
        transaction.setDescription(this.description);
        transaction.setDate(this.date);
        transaction.setRelatedOrderId(this.relatedOrderId);
        return transaction;
    }
}
