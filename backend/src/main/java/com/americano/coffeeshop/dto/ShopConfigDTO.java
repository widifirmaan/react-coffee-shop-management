package com.americano.coffeeshop.dto;

import lombok.Data;
import java.util.List;

@Data
public class ShopConfigDTO {
    // General
    private String shopName;
    private String websiteTitle;
    private String faviconUrl;
    private String logoUrl;

    // Footer / Contact
    private String address;
    private String phoneNumber;

    // Social Media (Legacy)
    private String instagramUrl;
    private String facebookUrl;
    private String twitterUrl;

    // Dynamic Social Media Links
    private List<SocialLinkDTO> socialLinks;

    @Data
    public static class SocialLinkDTO {
        private String platform;
        private String url;
        private String icon;
    }

    // Tech Specs Header
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
    private List<String> galleryImages;

    // Info Section
    private String infoTitle;
    private String infoContent;
    private String infoFooter1;
    private String infoFooter2;
}
