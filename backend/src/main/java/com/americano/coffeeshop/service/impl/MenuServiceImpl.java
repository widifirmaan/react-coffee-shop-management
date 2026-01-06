package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.Menu;
import com.americano.coffeeshop.repository.MenuRepository;
import com.americano.coffeeshop.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;

    @Override
    public List<Menu> getAllMenus() {
        return menuRepository.findAll();
    }

    @Override
    public List<Menu> getAvailableMenus() {
        return menuRepository.findByAvailableTrue();
    }

    @Override
    public Menu addMenu(Menu menu) {
        return menuRepository.save(menu);
    }

    @Override
    public Menu updateMenu(String id, Menu menu) {
        System.out.println("DEBUG: Updating Menu: " + menu.getName());
        System.out
                .println("DEBUG: Gallery received: " + (menu.getGallery() != null ? menu.getGallery().size() : "null"));
        return menuRepository.findById(id).map(existing -> {
            existing.setName(menu.getName());
            existing.setDescription(menu.getDescription());
            existing.setPrice(menu.getPrice());
            existing.setCategory(menu.getCategory());
            existing.setImageUrl(menu.getImageUrl());
            existing.setGallery(menu.getGallery());
            existing.setAvailable(menu.isAvailable());
            return menuRepository.save(existing);
        }).orElse(null);
    }

    @Override
    public void deleteMenu(String id) {
        menuRepository.deleteById(id);
    }
}
