package com.shiduchim.backend.dto.photo;

import java.time.LocalDateTime;

public class PhotoResponse {

    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer orderIndex;
    private LocalDateTime createdAt;

    public PhotoResponse() {}

    public PhotoResponse(Long id, String imageUrl, Boolean isPrimary, Integer orderIndex, LocalDateTime createdAt) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
        this.orderIndex = orderIndex;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
