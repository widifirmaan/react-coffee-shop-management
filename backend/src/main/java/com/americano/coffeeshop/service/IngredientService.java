package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.IngredientDTO;
import java.util.List;

public interface IngredientService {
    List<IngredientDTO> getAllIngredients();

    IngredientDTO addIngredient(IngredientDTO ingredient);

    IngredientDTO updateIngredient(String id, IngredientDTO ingredient);

    void deleteIngredient(String id);
}
