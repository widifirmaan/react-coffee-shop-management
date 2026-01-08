package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "menus")
public class Menu {
    @Id
    private String id;
    private String name;
    private String category;
    private Double price; // Changed to Double
    private String description;
    private String imageUrl;
    private boolean available = true;
    private List<String> gallery;
}
