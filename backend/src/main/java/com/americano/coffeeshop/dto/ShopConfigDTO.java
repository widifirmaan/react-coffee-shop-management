package com.americano.coffeeshop.dto;

import lombok.Data;

@Data
public class ShopConfigDTO {
    // General
    private String shopName;
    private String websiteTitle;
    private String faviconUrl;

    // Footer / Contact
    private String address;
    private String phoneNumber;

    // Social Media
    private String instagramUrl;
    private String facebookUrl;
    private String twitterUrl;

    // Tech Specs Header
    private String techSpec1;
    private String techSpec2;
    private String techSpec3;

    // Hero Section
    private String heroImageUrl;
    private String badgeText1;
    private String badgeText2;
}
