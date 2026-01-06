package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.util.List;

@Data
@Document(collection = "menus")
public class Menu {
    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category; // e.g., Coffee, Non-Coffee, Snack
    private String imageUrl;
    private boolean available;
}
