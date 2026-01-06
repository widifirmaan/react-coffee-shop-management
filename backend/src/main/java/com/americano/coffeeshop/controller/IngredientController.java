package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.model.Ingredient;
import com.americano.coffeeshop.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IngredientController {
    private final IngredientService ingredientService;

    @GetMapping
    public List<Ingredient> getAllIngredients() {
        return ingredientService.getAllIngredients();
    }

    @PostMapping
    public Ingredient addIngredient(@RequestBody Ingredient ingredient) {
        return ingredientService.addIngredient(ingredient);
    }
}
