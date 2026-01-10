package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.CategoryDTO;
import com.americano.coffeeshop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryDTO> getAll() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public CategoryDTO create(@RequestBody CategoryDTO category) {
        return categoryService.createCategory(category);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        categoryService.deleteCategory(id);
    }
}
