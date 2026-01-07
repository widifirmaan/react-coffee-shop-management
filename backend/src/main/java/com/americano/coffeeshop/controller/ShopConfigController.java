package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.ShopConfigDTO;
import com.americano.coffeeshop.service.ShopConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ShopConfigController {

    @Autowired
    private ShopConfigService shopConfigService;

    @GetMapping
    public ResponseEntity<ShopConfigDTO> getConfig() {
        return ResponseEntity.ok(shopConfigService.getShopConfig());
    }

    @PutMapping
    public ResponseEntity<ShopConfigDTO> updateConfig(@RequestBody ShopConfigDTO config) {
        return ResponseEntity.ok(shopConfigService.updateShopConfig(config));
    }
}
