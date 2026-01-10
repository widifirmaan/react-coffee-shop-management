package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "feedbacks")
public class Feedback {
    @Id
    private String id;
    private String customerName;
    private String message;
    private int rating; // 1-5
    private java.util.List<String> shiftEmployees;
    private Date timestamp = new Date();
}
