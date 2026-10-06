package com.avirapyrotech.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    private String landmark;
    private String district;
    private String pincode;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String status; // New, Confirmed, Processing, Delivered, Cancelled

    @Column(name = "customer_notes", columnDefinition = "TEXT")
    private String customerNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> orderItems = new ArrayList<>();

    public Order() {}

    public Order(Long id, String customerName, String mobileNumber, String address, String landmark,
                 String district, String pincode, Double totalAmount, String status, String customerNotes,
                 LocalDateTime createdAt, List<OrderItem> orderItems) {
        this.id = id;
        this.customerName = customerName;
        this.mobileNumber = mobileNumber;
        this.address = address;
        this.landmark = landmark;
        this.district = district;
        this.pincode = pincode;
        this.totalAmount = totalAmount;
        this.status = status;
        this.customerNotes = customerNotes;
        this.createdAt = createdAt;
        if (orderItems != null) {
            this.orderItems = orderItems;
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "New";
        }
    }

    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCustomerNotes() { return customerNotes; }
    public void setCustomerNotes(String customerNotes) { this.customerNotes = customerNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }

    public static OrderBuilder builder() {
        return new OrderBuilder();
    }

    public static class OrderBuilder {
        private Long id;
        private String customerName;
        private String mobileNumber;
        private String address;
        private String landmark;
        private String district;
        private String pincode;
        private Double totalAmount;
        private String status;
        private String customerNotes;
        private LocalDateTime createdAt;
        private List<OrderItem> orderItems = new ArrayList<>();

        public OrderBuilder id(Long id) { this.id = id; return this; }
        public OrderBuilder customerName(String customerName) { this.customerName = customerName; return this; }
        public OrderBuilder mobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; return this; }
        public OrderBuilder address(String address) { this.address = address; return this; }
        public OrderBuilder landmark(String landmark) { this.landmark = landmark; return this; }
        public OrderBuilder district(String district) { this.district = district; return this; }
        public OrderBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public OrderBuilder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderBuilder status(String status) { this.status = status; return this; }
        public OrderBuilder customerNotes(String customerNotes) { this.customerNotes = customerNotes; return this; }
        public OrderBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public OrderBuilder orderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; return this; }

        public Order build() {
            return new Order(id, customerName, mobileNumber, address, landmark, district, pincode, totalAmount, status, customerNotes, createdAt, orderItems);
        }
    }
}
