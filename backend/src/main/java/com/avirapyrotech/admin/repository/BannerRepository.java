package com.avirapyrotech.admin.repository;

import com.avirapyrotech.admin.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findAllByOrderByOrderIndexAsc();
    List<Banner> findByIsActiveOrderByOrderIndexAsc(boolean isActive);
}
