package com.avirapyrotech.admin.service;

import com.avirapyrotech.admin.entity.Category;
import com.avirapyrotech.admin.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(Objects.requireNonNull(id));
    }

    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new IllegalArgumentException("Category with this name already exists");
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, Category updatedCategory) {
        Category category = categoryRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (!category.getName().equalsIgnoreCase(updatedCategory.getName()) &&
                categoryRepository.existsByName(updatedCategory.getName())) {
            throw new IllegalArgumentException("Category with this name already exists");
        }

        category.setName(updatedCategory.getName());
        
        // If image is being replaced, delete the old one
        if (updatedCategory.getImagePath() != null && 
                category.getImagePath() != null && 
                !category.getImagePath().equals(updatedCategory.getImagePath())) {
            fileStorageService.deleteFile(category.getImagePath());
        }
        
        if (updatedCategory.getImagePath() != null) {
            category.setImagePath(updatedCategory.getImagePath());
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        
        // Delete image file if exists
        if (category.getImagePath() != null) {
            fileStorageService.deleteFile(category.getImagePath());
        }
        
        categoryRepository.delete(category);
    }
}
