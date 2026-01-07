package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.ShopConfigDTO;

public interface ShopConfigService {
    ShopConfigDTO getShopConfig();

    ShopConfigDTO updateShopConfig(ShopConfigDTO configDTO);
}
