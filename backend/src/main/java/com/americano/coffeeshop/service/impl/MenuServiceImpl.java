package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.MenuDTO;
import com.americano.coffeeshop.model.Menu;
import com.americano.coffeeshop.repository.MenuRepository;
import com.americano.coffeeshop.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;

    @Override
    public List<MenuDTO> getAllMenus() {
        return menuRepository.findAll().stream()
                .map(MenuDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public MenuDTO addMenu(MenuDTO menuDto) {
        return MenuDTO.fromEntity(menuRepository.save(menuDto.toEntity()));
    }

    @Override
    public MenuDTO updateMenu(String id, MenuDTO menuDto) {
        Menu menu = menuDto.toEntity();
        menu.setId(id); // Ensure ID is preserved
        return MenuDTO.fromEntity(menuRepository.save(menu));
    }

    @Override
    public void deleteMenu(String id) {
        menuRepository.deleteById(id);
    }
}
