package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.MenuDTO;
import com.americano.coffeeshop.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public List<MenuDTO> getAllMenus() {
        return menuService.getAllMenus();
    }

    @PostMapping
    public MenuDTO addMenu(@RequestBody MenuDTO menu) {
        return menuService.addMenu(menu);
    }

    @PutMapping("/{id}")
    public MenuDTO updateMenu(@PathVariable String id, @RequestBody MenuDTO menu) {
        return menuService.updateMenu(id, menu);
    }

    @DeleteMapping("/{id}")
    public void deleteMenu(@PathVariable String id) {
        menuService.deleteMenu(id);
    }
}
