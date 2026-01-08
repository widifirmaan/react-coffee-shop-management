package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Ingredient;
import lombok.Data;

@Data
public class IngredientDTO {
    private String id;
    private String name;
    private double quantity; // Changed to double
    private String unit;
    private double minThreshold; // Changed to double

    public static IngredientDTO fromEntity(Ingredient ingredient) {
        if (ingredient == null)
            return null;
        IngredientDTO dto = new IngredientDTO();
        dto.setId(ingredient.getId());
        dto.setName(ingredient.getName());
        dto.setQuantity(ingredient.getQuantity());
        dto.setUnit(ingredient.getUnit());
        dto.setMinThreshold(ingredient.getMinThreshold());
        return dto;
    }

    public Ingredient toEntity() {
        Ingredient ingredient = new Ingredient();
        ingredient.setId(this.id);
        ingredient.setName(this.name);
        ingredient.setQuantity(this.quantity);
        ingredient.setUnit(this.unit);
        ingredient.setMinThreshold(this.minThreshold);
        return ingredient;
    }
}
