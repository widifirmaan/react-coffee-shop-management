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
        if (menuRepository.existsById(id)) {
            menu.setId(id);
            return menuRepository.save(menu);
        }
        return null; // Or throw exception
    }

    @Override
    public void deleteMenu(String id) {
        menuRepository.deleteById(id);
    }
}
