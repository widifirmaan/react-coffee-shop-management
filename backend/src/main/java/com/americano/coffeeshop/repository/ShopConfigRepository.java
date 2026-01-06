package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.ShopConfig;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ShopConfigRepository extends MongoRepository<ShopConfig, String> {
}
