package com.avirapyrotech.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "product_code", nullable = false, unique = true)
    private String productCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "original_price", nullable = false)
    private Double originalPrice;

    @Column(name = "offer_price", nullable = false)
    private Double offerPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 999;

    @Column(nullable = false)
    private String status = "Available"; // Available / Out of Stock

    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured;

    @Column(name = "image_path")
    private String imagePath;

    public Product() {}

    public Product(Long id, String name, String productCode, Category category, String description,
                   Double originalPrice, Double offerPrice, Integer stockQuantity, String status,
                   boolean isFeatured, String imagePath) {
        this.id = id;
        this.name = name;
        this.productCode = productCode;
        this.category = category;
        this.description = description;
        this.originalPrice = originalPrice;
        this.offerPrice = offerPrice;
        this.stockQuantity = stockQuantity;
        this.status = status;
        this.isFeatured = isFeatured;
        this.imagePath = imagePath;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }

    public Double getOfferPrice() { return offerPrice; }
    public void setOfferPrice(Double offerPrice) { this.offerPrice = offerPrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public static ProductBuilder builder() {
        return new ProductBuilder();
    }

    public static class ProductBuilder {
        private Long id;
        private String name;
        private String productCode;
        private Category category;
        private String description;
        private Double originalPrice;
        private Double offerPrice;
        private Integer stockQuantity;
        private String status;
        private boolean isFeatured;
        private String imagePath;

        public ProductBuilder id(Long id) { this.id = id; return this; }
        public ProductBuilder name(String name) { this.name = name; return this; }
        public ProductBuilder productCode(String productCode) { this.productCode = productCode; return this; }
        public ProductBuilder category(Category category) { this.category = category; return this; }
        public ProductBuilder description(String description) { this.description = description; return this; }
        public ProductBuilder originalPrice(Double originalPrice) { this.originalPrice = originalPrice; return this; }
        public ProductBuilder offerPrice(Double offerPrice) { this.offerPrice = offerPrice; return this; }
        public ProductBuilder stockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; return this; }
        public ProductBuilder status(String status) { this.status = status; return this; }
        public ProductBuilder isFeatured(boolean isFeatured) { this.isFeatured = isFeatured; return this; }
        public ProductBuilder imagePath(String imagePath) { this.imagePath = imagePath; return this; }

        public Product build() {
            return new Product(id, name, productCode, category, description, originalPrice, offerPrice, stockQuantity, status, isFeatured, imagePath);
        }
    }
}
