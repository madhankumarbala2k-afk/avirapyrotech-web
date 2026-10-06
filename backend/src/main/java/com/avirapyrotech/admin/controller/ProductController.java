package com.avirapyrotech.admin.controller;

import com.avirapyrotech.admin.entity.Category;
import com.avirapyrotech.admin.entity.Product;
import com.avirapyrotech.admin.service.FileStorageService;
import com.avirapyrotech.admin.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Page<Product>> getFilteredProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        
        Page<Product> products = productService.getFilteredProducts(search, categoryId, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestParam("name") String name,
            @RequestParam("productCode") String productCode,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("originalPrice") Double originalPrice,
            @RequestParam("offerPrice") Double offerPrice,
            @RequestParam(value = "stockQuantity", required = false, defaultValue = "999") Integer stockQuantity,
            @RequestParam(value = "status", required = false, defaultValue = "Available") String status,
            @RequestParam(value = "isFeatured", defaultValue = "false") boolean isFeatured,
            @RequestParam(value = "imagePath", required = false) String existingImagePath,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            String imagePath = existingImagePath;
            if (image != null && !image.isEmpty()) {
                imagePath = fileStorageService.storeFile(image, "products");
            }

            Product product = Product.builder()
                    .name(name != null ? name.trim() : "")
                    .productCode(productCode != null ? productCode.trim() : "")
                    .category(Category.builder().id(categoryId).build())
                    .description(description)
                    .originalPrice(originalPrice)
                    .offerPrice(offerPrice)
                    .stockQuantity(stockQuantity != null ? stockQuantity : 999)
                    .status(status != null && !status.isBlank() ? status : "Available")
                    .isFeatured(isFeatured)
                    .imagePath(imagePath)
                    .build();

            Product saved = productService.createProduct(product);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("productCode") String productCode,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("originalPrice") Double originalPrice,
            @RequestParam("offerPrice") Double offerPrice,
            @RequestParam(value = "stockQuantity", required = false, defaultValue = "999") Integer stockQuantity,
            @RequestParam(value = "status", required = false, defaultValue = "Available") String status,
            @RequestParam(value = "isFeatured", required = false, defaultValue = "false") boolean isFeatured,
            @RequestParam(value = "imagePath", required = false) String existingImagePath,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            String imagePath = existingImagePath;
            if (image != null && !image.isEmpty()) {
                imagePath = fileStorageService.storeFile(image, "products");
            }

            Product updated = Product.builder()
                    .name(name != null ? name.trim() : "")
                    .productCode(productCode != null ? productCode.trim() : "")
                    .category(Category.builder().id(categoryId).build())
                    .description(description)
                    .originalPrice(originalPrice)
                    .offerPrice(offerPrice)
                    .stockQuantity(stockQuantity != null ? stockQuantity : 999)
                    .status(status != null && !status.isBlank() ? status : "Available")
                    .isFeatured(isFeatured)
                    .imagePath(imagePath)
                    .build();

            Product saved = productService.updateProduct(id, updated);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicateProduct(@PathVariable Long id) {
        try {
            Product duplicate = productService.duplicateProduct(id);
            return ResponseEntity.ok(duplicate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
