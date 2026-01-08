package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.IngredientDTO;
import com.americano.coffeeshop.repository.IngredientRepository;
import com.americano.coffeeshop.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;

    @Override
    public List<IngredientDTO> getAllIngredients() {
        return ingredientRepository.findAll().stream()
                .map(IngredientDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public IngredientDTO addIngredient(IngredientDTO ingredient) {
        return IngredientDTO.fromEntity(ingredientRepository.save(ingredient.toEntity()));
    }

    @Override
    public IngredientDTO updateIngredient(String id, IngredientDTO ingredient) {
        com.americano.coffeeshop.model.Ingredient existing = ingredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));

        existing.setName(ingredient.getName());
        existing.setQuantity(ingredient.getQuantity());
        existing.setUnit(ingredient.getUnit());
        existing.setMinThreshold(ingredient.getMinThreshold());

        return IngredientDTO.fromEntity(ingredientRepository.save(existing));
    }

    @Override
    public void deleteIngredient(String id) {
        ingredientRepository.deleteById(id);
    }
}
