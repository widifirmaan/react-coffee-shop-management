package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Ingredient;
import java.util.List;

public interface IngredientService {
    List<Ingredient> getAllIngredients();

    Ingredient addIngredient(Ingredient ingredient);
}
