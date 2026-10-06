package com.avirapyrotech.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "banners")
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String subtitle;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "order_index")
    private Integer orderIndex;

    public Banner() {}

    public Banner(Long id, String title, String subtitle, String imagePath, boolean isActive, Integer orderIndex) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.imagePath = imagePath;
        this.isActive = isActive;
        this.orderIndex = orderIndex;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public static BannerBuilder builder() {
        return new BannerBuilder();
    }

    public static class BannerBuilder {
        private Long id;
        private String title;
        private String subtitle;
        private String imagePath;
        private boolean isActive = true;
        private Integer orderIndex;

        public BannerBuilder id(Long id) { this.id = id; return this; }
        public BannerBuilder title(String title) { this.title = title; return this; }
        public BannerBuilder subtitle(String subtitle) { this.subtitle = subtitle; return this; }
        public BannerBuilder imagePath(String imagePath) { this.imagePath = imagePath; return this; }
        public BannerBuilder isActive(boolean isActive) { this.isActive = isActive; return this; }
        public BannerBuilder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }

        public Banner build() {
            return new Banner(id, title, subtitle, imagePath, isActive, orderIndex);
        }
    }
}
