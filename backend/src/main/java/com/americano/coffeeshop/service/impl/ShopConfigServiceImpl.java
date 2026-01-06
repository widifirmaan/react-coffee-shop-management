package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.ShopConfig;
import com.americano.coffeeshop.repository.ShopConfigRepository;
import com.americano.coffeeshop.service.ShopConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopConfigServiceImpl implements ShopConfigService {

    @Autowired
    private ShopConfigRepository shopConfigRepository;

    @Override
    public ShopConfig getShopConfig() {
        List<ShopConfig> configs = shopConfigRepository.findAll();
        if (configs.isEmpty()) {
            // Create Default
            ShopConfig defaultBytes = new ShopConfig();
            defaultBytes.setShopName("SIAP NYAFE");
            defaultBytes.setWebsiteTitle("Siap Nyafe Dashboard");
            defaultBytes.setAddress("Jl. Kopi No. 123, Jakarta");
            defaultBytes.setPhoneNumber("0812-3456-7890");
            return shopConfigRepository.save(defaultBytes);
        }
        return configs.get(0);
    }

    @Override
    public ShopConfig updateShopConfig(ShopConfig config) {
        ShopConfig current = getShopConfig();
        current.setShopName(config.getShopName());
        current.setWebsiteTitle(config.getWebsiteTitle());
        current.setAddress(config.getAddress());
        current.setPhoneNumber(config.getPhoneNumber());
        current.setInstagramUrl(config.getInstagramUrl());
        current.setFacebookUrl(config.getFacebookUrl());
        current.setTwitterUrl(config.getTwitterUrl());

        if (config.getFaviconUrl() != null && !config.getFaviconUrl().isEmpty()) {
            current.setFaviconUrl(config.getFaviconUrl());
        }

        return shopConfigRepository.save(current);
    }
}
