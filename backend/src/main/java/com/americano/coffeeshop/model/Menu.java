package com.americano.coffeeshop.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@Document(collection = "menus")
public class Menu {
    @Id
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category; // e.g., Coffee, Non-Coffee, Snack
    private String imageUrl;
    private List<String> gallery = new ArrayList<>();
    private boolean available;

    public List<String> getGallery() {
        return gallery;
    }

    public void setGallery(List<String> gallery) {
        this.gallery = gallery;
    }
}
