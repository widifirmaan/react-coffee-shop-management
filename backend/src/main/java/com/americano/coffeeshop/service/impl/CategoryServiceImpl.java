package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.CategoryDTO;
import com.americano.coffeeshop.repository.CategoryRepository;
import com.americano.coffeeshop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDto) {
        return CategoryDTO.fromEntity(categoryRepository.save(categoryDto.toEntity()));
    }

    @Override
    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
}
