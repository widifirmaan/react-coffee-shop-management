package com.americano.coffeeshop.mapper;

import com.americano.coffeeshop.dto.ShopConfigDTO;
import com.americano.coffeeshop.model.ShopConfig;
import org.springframework.stereotype.Component;

@Component
public class ShopConfigMapper {

    public ShopConfigDTO toDTO(ShopConfig entity) {
        if (entity == null)
            return null;
        ShopConfigDTO dto = new ShopConfigDTO();
        dto.setShopName(entity.getShopName());
        dto.setWebsiteTitle(entity.getWebsiteTitle());
        dto.setFaviconUrl(entity.getFaviconUrl());
        dto.setAddress(entity.getAddress());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setInstagramUrl(entity.getInstagramUrl());
        dto.setFacebookUrl(entity.getFacebookUrl());
        dto.setTwitterUrl(entity.getTwitterUrl());

        dto.setTechSpec1(entity.getTechSpec1());
        dto.setTechSpec2(entity.getTechSpec2());
        dto.setTechSpec3(entity.getTechSpec3());

        dto.setHeroImageUrl(entity.getHeroImageUrl());
        dto.setBadgeText1(entity.getBadgeText1());
        dto.setBadgeText2(entity.getBadgeText2());
        return dto;
    }

    public void updateEntityFromDTO(ShopConfigDTO dto, ShopConfig entity) {
        if (dto == null || entity == null)
            return;

        entity.setShopName(dto.getShopName());
        entity.setWebsiteTitle(dto.getWebsiteTitle());
        entity.setAddress(dto.getAddress());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setInstagramUrl(dto.getInstagramUrl());
        entity.setFacebookUrl(dto.getFacebookUrl());
        entity.setTwitterUrl(dto.getTwitterUrl());

        if (dto.getFaviconUrl() != null && !dto.getFaviconUrl().isEmpty()) {
            entity.setFaviconUrl(dto.getFaviconUrl());
        }

        entity.setTechSpec1(dto.getTechSpec1());
        entity.setTechSpec2(dto.getTechSpec2());
        entity.setTechSpec3(dto.getTechSpec3());

        entity.setHeroImageUrl(dto.getHeroImageUrl());
        entity.setBadgeText1(dto.getBadgeText1());
        entity.setBadgeText2(dto.getBadgeText2());
    }
}
