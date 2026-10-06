package com.avirapyrotech.admin.service;

import com.avirapyrotech.admin.entity.Banner;
import com.avirapyrotech.admin.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderByOrderIndexAsc();
    }

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveOrderByOrderIndexAsc(true);
    }

    public Optional<Banner> getBannerById(Long id) {
        return bannerRepository.findById(Objects.requireNonNull(id));
    }

    @Transactional
    public Banner createBanner(Banner banner) {
        if (banner.getOrderIndex() == null) {
            banner.setOrderIndex(bannerRepository.findAll().size() + 1);
        }
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(Long id, Banner updatedBanner) {
        Banner banner = bannerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Banner not found"));

        banner.setTitle(updatedBanner.getTitle());
        banner.setSubtitle(updatedBanner.getSubtitle());
        banner.setActive(updatedBanner.isActive());
        banner.setOrderIndex(updatedBanner.getOrderIndex());

        // Delete old image if path changed
        if (updatedBanner.getImagePath() != null && 
                banner.getImagePath() != null && 
                !banner.getImagePath().equals(updatedBanner.getImagePath())) {
            fileStorageService.deleteFile(banner.getImagePath());
        }
        
        if (updatedBanner.getImagePath() != null) {
            banner.setImagePath(updatedBanner.getImagePath());
        }

        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Banner not found"));

        // Delete local image file
        if (banner.getImagePath() != null) {
            fileStorageService.deleteFile(banner.getImagePath());
        }

        bannerRepository.delete(banner);
    }
}
