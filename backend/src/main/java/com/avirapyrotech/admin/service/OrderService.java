package com.avirapyrotech.admin.service;

import com.avirapyrotech.admin.entity.Order;
import com.avirapyrotech.admin.entity.OrderItem;
import com.avirapyrotech.admin.entity.Product;
import com.avirapyrotech.admin.repository.OrderRepository;
import com.avirapyrotech.admin.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public Page<Order> getFilteredOrders(String search, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("customerName")), searchPattern);
                Predicate phoneLike = cb.like(cb.lower(root.get("mobileNumber")), searchPattern);
                Predicate idLike = cb.like(cb.lower(root.get("id").as(String.class)), searchPattern);
                predicates.add(cb.or(nameLike, phoneLike, idLike));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return orderRepository.findAll(spec, pageable);
    }

    public List<Order> getRecentOrders() {
        return orderRepository.findTop10ByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order createOrder(Order order) {
        // Calculate total and deduct stock
        double total = 0;
        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(Objects.requireNonNull(item.getProduct().getId()))
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProduct().getId()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            if (product.getStockQuantity() <= 0) {
                product.setStatus("Out of Stock");
            }
            productRepository.save(product);

            // Configure details
            double priceToUse = product.getOfferPrice() != null && product.getOfferPrice() > 0 
                    ? product.getOfferPrice() 
                    : product.getOriginalPrice();
            item.setPrice(priceToUse);
            item.setOrder(order);
            total += priceToUse * item.getQuantity();
        }
        
        order.setTotalAmount(total);
        order.setStatus("New");
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        String oldStatus = order.getStatus();
        
        // If transitioning to Cancelled from any non-cancelled status, restore stock
        if (status.equalsIgnoreCase("Cancelled") && !oldStatus.equalsIgnoreCase("Cancelled")) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                if (product.getStockQuantity() > 0) {
                    product.setStatus("Available");
                }
                productRepository.save(product);
            }
        }
        // If transitioning OUT of Cancelled to active status, re-deduct stock
        else if (oldStatus.equalsIgnoreCase("Cancelled") && !status.equalsIgnoreCase("Cancelled")) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException("Insufficient stock to reinstate order for product: " + product.getName());
                }
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                if (product.getStockQuantity() <= 0) {
                    product.setStatus("Out of Stock");
                }
                productRepository.save(product);
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        // If order was active (not cancelled), we might want to restore stock, 
        // but typically database delete is destructive. Let's just delete the order.
        orderRepository.delete(Objects.requireNonNull(order));
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        // Today's orders count
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        long todayOrders = orderRepository.countByCreatedAtAfter(todayStart);

        // Pending orders (New, Confirmed, Processing)
        long pendingOrders = orderRepository.countByStatus("New") 
                + orderRepository.countByStatus("Confirmed") 
                + orderRepository.countByStatus("Processing");
        
        long completedOrders = orderRepository.countByStatus("Delivered");
        
        // Out of Stock Products (Stock quantity <= 0)
        long outOfStockProducts = productRepository.countByStockQuantityLessThanEqual(0);

        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("todayOrders", todayOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("outOfStockProducts", outOfStockProducts);

        return stats;
    }
}
