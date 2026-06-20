package com.shiduchim.backend.entity;

import com.shiduchim.backend.enums.WeddingStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "weddings")
public class Wedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private LocalDate weddingDate;

    @Column(nullable = false, unique = true)
    private String accessCode;

    @Column(nullable = false)
    private Long ownerUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeddingStatus status = WeddingStatus.ACTIVE;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String backgroundImageUrl;

    private String backgroundStoragePath;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public LocalDate getWeddingDate() { return weddingDate; }
    public void setWeddingDate(LocalDate weddingDate) { this.weddingDate = weddingDate; }

    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }

    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }

    public WeddingStatus getStatus() { return status; }
    public void setStatus(WeddingStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getBackgroundImageUrl() { return backgroundImageUrl; }
    public void setBackgroundImageUrl(String backgroundImageUrl) { this.backgroundImageUrl = backgroundImageUrl; }

    public String getBackgroundStoragePath() { return backgroundStoragePath; }
    public void setBackgroundStoragePath(String backgroundStoragePath) { this.backgroundStoragePath = backgroundStoragePath; }
}
