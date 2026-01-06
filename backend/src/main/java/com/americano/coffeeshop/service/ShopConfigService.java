package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.ShopConfig;

public interface ShopConfigService {
    ShopConfig getShopConfig();

    ShopConfig updateShopConfig(ShopConfig config);
}
