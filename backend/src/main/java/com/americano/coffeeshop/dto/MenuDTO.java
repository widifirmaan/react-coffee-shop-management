package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Menu;
import lombok.Data;
import java.util.List;

@Data
public class MenuDTO {
    private String id;
    private String name;
    private String category;
    private double price;
    private String description;
    private String imageUrl;
    private boolean available;
    private List<String> gallery;

    public static MenuDTO fromEntity(Menu menu) {
        if (menu == null)
            return null;
        MenuDTO dto = new MenuDTO();
        dto.setId(menu.getId());
        dto.setName(menu.getName());
        dto.setCategory(menu.getCategory());
        dto.setPrice(menu.getPrice());
        dto.setDescription(menu.getDescription());
        dto.setImageUrl(menu.getImageUrl());
        dto.setAvailable(menu.isAvailable());
        dto.setGallery(menu.getGallery());
        return dto;
    }

    public Menu toEntity() {
        Menu menu = new Menu();
        menu.setId(this.id);
        menu.setName(this.name);
        menu.setCategory(this.category);
        menu.setPrice(this.price);
        menu.setDescription(this.description);
        menu.setImageUrl(this.imageUrl);
        menu.setAvailable(this.available);
        menu.setGallery(this.gallery);
        return menu;
    }
}
