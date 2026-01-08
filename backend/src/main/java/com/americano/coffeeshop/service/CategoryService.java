package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.CategoryDTO;
import java.util.List;

public interface CategoryService {
    List<CategoryDTO> getAllCategories();

    CategoryDTO createCategory(CategoryDTO category);

    void deleteCategory(String id);
}
