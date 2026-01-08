package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.MenuDTO;
import java.util.List;

public interface MenuService {
    List<MenuDTO> getAllMenus();

    MenuDTO addMenu(MenuDTO menu);

    MenuDTO updateMenu(String id, MenuDTO menu);

    void deleteMenu(String id);
}
