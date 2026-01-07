package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "shop_config")
public class ShopConfig {
    @Id
    private String id;

    // General
    private String shopName;
    private String websiteTitle;
    private String faviconUrl; // URL or Base64

    // Footer / Contact
    private String address;
    private String phoneNumber;

    // Social Media
    private String instagramUrl;
    private String facebookUrl;
    private String twitterUrl;

    // Latest Drop CMS Content
    // Promo Card
    private String latestDropPromoTitle;
    private String latestDropPromoDesc;
    private String latestDropPromoDate;

    // News Card
    private String latestDropNewsTitle;
    private String latestDropNewsDesc;

    // Event Card
    private String latestDropEventTitle;
    private String latestDropEventDesc;
    // Tech Specs Header
    private String techSpec1;
    private String techSpec2;
    private String techSpec3;

    // Hero Section
    private String heroImageUrl;
    private String badgeText1; // e.g. EST 2024
    private String badgeText2; // e.g. JAKARTA
}
