package com.americano.coffeeshop.repository;

import com.americano.coffeeshop.model.Menu;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MenuRepository extends MongoRepository<Menu, String> {
    List<Menu> findByCategory(String category);

    List<Menu> findByAvailableTrue();
}
