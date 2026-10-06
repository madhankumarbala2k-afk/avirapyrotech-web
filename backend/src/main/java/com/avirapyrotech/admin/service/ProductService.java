package com.avirapyrotech.admin.service;

import com.avirapyrotech.admin.entity.Category;
import com.avirapyrotech.admin.entity.Product;
import com.avirapyrotech.admin.repository.CategoryRepository;
import com.avirapyrotech.admin.repository.ProductRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Page<Product> getFilteredProducts(String search, Long categoryId, String status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate codeLike = cb.like(cb.lower(root.get("productCode")), searchPattern);
                predicates.add(cb.or(nameLike, codeLike));
            }

            if (categoryId != null) {
                Join<Product, Category> categoryJoin = root.join("category");
                predicates.add(cb.equal(categoryJoin.get("id"), categoryId));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(Objects.requireNonNull(id));
    }

    @Transactional
    public Product createProduct(Product product) {
        if (productRepository.existsByProductCode(product.getProductCode())) {
            throw new IllegalArgumentException("Product code already exists: " + product.getProductCode());
        }
        
        // Ensure category is attached correctly
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category category = categoryRepository.findById(Objects.requireNonNull(product.getCategory().getId()))
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            product.setCategory(category);
        }
        
        // Ensure default stock quantity if not provided
        if (product.getStockQuantity() == null) {
            product.setStockQuantity(999);
        }

        // Set stock status automatically if out of stock
        if (product.getStatus() == null || product.getStatus().isBlank()) {
            updateStatusBasedOnStock(product);
        }
        
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product product = productRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (productRepository.existsByProductCodeAndIdNot(updatedProduct.getProductCode(), id)) {
            throw new IllegalArgumentException("Product code already exists: " + updatedProduct.getProductCode());
        }

        product.setName(updatedProduct.getName());
        product.setProductCode(updatedProduct.getProductCode());
        product.setDescription(updatedProduct.getDescription());
        product.setOriginalPrice(updatedProduct.getOriginalPrice());
        product.setOfferPrice(updatedProduct.getOfferPrice());
        if (updatedProduct.getStockQuantity() != null) {
            product.setStockQuantity(updatedProduct.getStockQuantity());
        }
        product.setFeatured(updatedProduct.isFeatured());
        
        if (updatedProduct.getCategory() != null && updatedProduct.getCategory().getId() != null) {
            Category category = categoryRepository.findById(Objects.requireNonNull(updatedProduct.getCategory().getId()))
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            product.setCategory(category);
        }

        // Delete old image file if being replaced
        if (updatedProduct.getImagePath() != null && 
                product.getImagePath() != null && 
                !product.getImagePath().equals(updatedProduct.getImagePath())) {
            fileStorageService.deleteFile(product.getImagePath());
        }
        
        if (updatedProduct.getImagePath() != null) {
            product.setImagePath(updatedProduct.getImagePath());
        }

        if (updatedProduct.getStatus() != null && !updatedProduct.getStatus().isBlank()) {
            product.setStatus(updatedProduct.getStatus());
        } else {
            updateStatusBasedOnStock(product);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product duplicateProduct(Long id) {
        Product original = productRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Original product not found"));

        // Generate unique code
        String newCode = original.getProductCode() + "-copy";
        int counter = 1;
        while (productRepository.existsByProductCode(newCode)) {
            newCode = original.getProductCode() + "-copy" + counter;
            counter++;
        }

        Product duplicate = Product.builder()
                .name(original.getName() + " (Copy)")
                .productCode(newCode)
                .category(original.getCategory())
                .description(original.getDescription())
                .originalPrice(original.getOriginalPrice())
                .offerPrice(original.getOfferPrice())
                .stockQuantity(original.getStockQuantity())
                .status(original.getStatus())
                .isFeatured(original.isFeatured())
                .imagePath(original.getImagePath()) // Copy the image URL/path (sharing image URL in DB is safe)
                .build();

        return productRepository.save(Objects.requireNonNull(duplicate));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Delete associated image file
        if (product.getImagePath() != null) {
            fileStorageService.deleteFile(product.getImagePath());
        }

        productRepository.delete(product);
    }

    private void updateStatusBasedOnStock(Product product) {
        if (product.getStatus() != null && !product.getStatus().isBlank()) {
            return;
        }
        if (product.getStockQuantity() != null && product.getStockQuantity() <= 0) {
            product.setStatus("Out of Stock");
        } else {
            product.setStatus("Available");
        }
    }
}
