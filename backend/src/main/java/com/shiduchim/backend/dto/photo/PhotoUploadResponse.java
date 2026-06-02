package com.shiduchim.backend.dto.photo;

public class PhotoUploadResponse {

    private Long photoId;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer orderIndex;
    private Long photoCount;
    private Boolean hasPrimaryPhoto;

    public PhotoUploadResponse() {}

    public PhotoUploadResponse(Long photoId, String imageUrl, Boolean isPrimary, Integer orderIndex,
                               Long photoCount, Boolean hasPrimaryPhoto) {
        this.photoId = photoId;
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
        this.orderIndex = orderIndex;
        this.photoCount = photoCount;
        this.hasPrimaryPhoto = hasPrimaryPhoto;
    }

    public Long getPhotoId() { return photoId; }
    public void setPhotoId(Long photoId) { this.photoId = photoId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

    public Long getPhotoCount() { return photoCount; }
    public void setPhotoCount(Long photoCount) { this.photoCount = photoCount; }

    public Boolean getHasPrimaryPhoto() { return hasPrimaryPhoto; }
    public void setHasPrimaryPhoto(Boolean hasPrimaryPhoto) { this.hasPrimaryPhoto = hasPrimaryPhoto; }
}
