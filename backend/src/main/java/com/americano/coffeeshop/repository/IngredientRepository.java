package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Ingredient;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface IngredientRepository extends MongoRepository<Ingredient, String> {
}
