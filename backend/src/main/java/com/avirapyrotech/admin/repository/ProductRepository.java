package com.avirapyrotech.admin.repository;

import com.avirapyrotech.admin.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findByProductCode(String productCode);
    boolean existsByProductCode(String productCode);
    boolean existsByProductCodeAndIdNot(String productCode, Long id);
    
    // Out of Stock products count
    long countByStockQuantityLessThanEqual(int stockLimit);
    
    // Filtered counts
    long countByStatus(String status);
}
