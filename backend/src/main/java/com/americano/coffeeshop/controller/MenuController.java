package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.model.Menu;
import com.americano.coffeeshop.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow for development
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public List<Menu> getAllMenus() {
        return menuService.getAllMenus();
    }

    @PostMapping
    public Menu addMenu(@RequestBody Menu menu) {
        return menuService.addMenu(menu);
    }
}
