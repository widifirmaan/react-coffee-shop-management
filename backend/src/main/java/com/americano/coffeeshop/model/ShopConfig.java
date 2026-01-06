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
}
