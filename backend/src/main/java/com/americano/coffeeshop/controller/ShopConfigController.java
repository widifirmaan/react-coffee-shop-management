package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.model.ShopConfig;
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
    public ResponseEntity<ShopConfig> getConfig() {
        return ResponseEntity.ok(shopConfigService.getShopConfig());
    }

    @PutMapping
    public ResponseEntity<ShopConfig> updateConfig(@RequestBody ShopConfig config) {
        return ResponseEntity.ok(shopConfigService.updateShopConfig(config));
    }
}
