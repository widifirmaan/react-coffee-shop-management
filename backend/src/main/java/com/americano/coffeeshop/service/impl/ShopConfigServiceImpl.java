package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.ShopConfigDTO;
import com.americano.coffeeshop.mapper.ShopConfigMapper;
import com.americano.coffeeshop.model.ShopConfig;
import com.americano.coffeeshop.repository.ShopConfigRepository;
import com.americano.coffeeshop.service.ShopConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShopConfigServiceImpl implements ShopConfigService {

    @Autowired
    private ShopConfigRepository shopConfigRepository;

    @Autowired
    private ShopConfigMapper shopConfigMapper;

    @Override
    @Cacheable("shopConfig")
    public ShopConfigDTO getShopConfig() {
        List<ShopConfig> configs = shopConfigRepository.findAll();
        ShopConfig entity;
        if (configs.isEmpty()) {
            // Create Default
            entity = new ShopConfig();
            entity.setShopName("SIAP NYAFE");
            entity.setWebsiteTitle("Siap Nyafe Dashboard");
            entity.setAddress("Jl. Kopi No. 123, Jakarta");
            entity.setPhoneNumber("0812-3456-7890");
            entity = shopConfigRepository.save(entity);
        } else {
            entity = configs.get(0);
        }
        return shopConfigMapper.toDTO(entity);
    }

    @Override
    @CacheEvict(value = "shopConfig", allEntries = true)
    public ShopConfigDTO updateShopConfig(ShopConfigDTO configDTO) {
        // Get existing entity (bypass cache to be safe, but findAll is cheap for 1
        // record)
        List<ShopConfig> configs = shopConfigRepository.findAll();
        ShopConfig current;
        if (configs.isEmpty()) {
            current = new ShopConfig();
        } else {
            current = configs.get(0);
        }

        // Map DTO to Entity
        shopConfigMapper.updateEntityFromDTO(configDTO, current);

        // Save Entity
        ShopConfig saved = shopConfigRepository.save(current);

        // Return DTO
        return shopConfigMapper.toDTO(saved);
    }
}
