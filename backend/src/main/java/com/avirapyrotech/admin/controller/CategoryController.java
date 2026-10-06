package com.avirapyrotech.admin.controller;

import com.avirapyrotech.admin.entity.Category;
import com.avirapyrotech.admin.service.CategoryService;
import com.avirapyrotech.admin.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            String imagePath = null;
            if (image != null && !image.isEmpty()) {
                imagePath = fileStorageService.storeFile(image, "categories");
            }

            Category category = Category.builder()
                    .name(name)
                    .imagePath(imagePath)
                    .build();

            Category saved = categoryService.createCategory(category);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            String imagePath = null;
            if (image != null && !image.isEmpty()) {
                imagePath = fileStorageService.storeFile(image, "categories");
            }

            Category updated = Category.builder()
                    .name(name)
                    .imagePath(imagePath)
                    .build();

            Category saved = categoryService.updateCategory(id, updated);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok("Category deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
