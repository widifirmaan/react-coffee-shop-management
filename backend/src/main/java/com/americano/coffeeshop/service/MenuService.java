package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Menu;
import java.util.List;

public interface MenuService {
    List<Menu> getAllMenus();

    List<Menu> getAvailableMenus();

    Menu addMenu(Menu menu);

    Menu updateMenu(String id, Menu menu);

    void deleteMenu(String id);
}
