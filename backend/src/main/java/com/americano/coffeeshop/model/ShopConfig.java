package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.ArrayList;

@Data
@Document(collection = "shop_config")
public class ShopConfig {
    @Id
    private String id;

    // General
    private String shopName;
    private String websiteTitle;
    private String faviconUrl; // URL or Base64
    private String logoUrl; // Added for OrderPage

    // Footer / Contact
    private String address;
    private String phoneNumber;

    // Social Media (Legacy)
    private String instagramUrl;
    private String facebookUrl;
    private String twitterUrl;

    // Dynamic Social Media Links
    private List<SocialLink> socialLinks = new ArrayList<>();

    @Data
    public static class SocialLink {
        private String platform; // e.g., "Instagram"
        private String url;
        private String icon; // Icon name (e.g., "Instagram", "Facebook")
    }

    // Latest Drop CMS Content
    private String latestDropPromoTitle;
    private String latestDropPromoDesc;
    private String latestDropPromoDate;

    private String latestDropNewsTitle;
    private String latestDropNewsDesc;

    private String latestDropEventTitle;
    private String latestDropEventDesc;

    // Tech Specs Header (for Dashboard/CMS)
    private String techSpec1;
    private String techSpec2;
    private String techSpec3;

    // Hero Section
    private String heroImageUrl;
    private String badgeText1;
    private String badgeText2;

    // Marquee Text
    private String marqueeText;

    // Gallery Images (Sidebar Scroll)
    private List<String> galleryImages = new ArrayList<>();

    // Info Section
    private String infoTitle;
    private String infoContent;
    private String infoFooter1;
    private String infoFooter2;
}
