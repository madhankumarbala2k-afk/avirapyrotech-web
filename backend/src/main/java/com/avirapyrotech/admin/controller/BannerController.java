package com.avirapyrotech.admin.controller;

import com.avirapyrotech.admin.entity.Banner;
import com.avirapyrotech.admin.service.BannerService;
import com.avirapyrotech.admin.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/banners")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAllBanners());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Banner>> getActiveBanners() {
        return ResponseEntity.ok(bannerService.getActiveBanners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        return bannerService.getBannerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBanner(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "orderIndex", required = false) Integer orderIndex,
            @RequestParam(value = "isActive", defaultValue = "true") boolean isActive) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body("Image file is required");
            }
            
            String imagePath = fileStorageService.storeFile(image, "banners");

            Banner banner = Banner.builder()
                    .title(title)
                    .subtitle(subtitle)
                    .imagePath(imagePath)
                    .orderIndex(orderIndex)
                    .isActive(isActive)
                    .build();

            Banner saved = bannerService.createBanner(banner);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> updateBanner(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("orderIndex") Integer orderIndex,
            @RequestParam("isActive") boolean isActive) {
        try {
            String imagePath = null;
            if (image != null && !image.isEmpty()) {
                imagePath = fileStorageService.storeFile(image, "banners");
            }

            Banner updated = Banner.builder()
                    .title(title)
                    .subtitle(subtitle)
                    .imagePath(imagePath)
                    .orderIndex(orderIndex)
                    .isActive(isActive)
                    .build();

            Banner saved = bannerService.updateBanner(id, updated);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        try {
            bannerService.deleteBanner(id);
            return ResponseEntity.ok("Banner deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
