package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Category;
import lombok.Data;

@Data
public class CategoryDTO {
    private String id;
    private String name;

    public static CategoryDTO fromEntity(Category category) {
        if (category == null)
            return null;
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        return dto;
    }

    public Category toEntity() {
        Category category = new Category();
        category.setId(this.id);
        category.setName(this.name);
        return category;
    }
}
