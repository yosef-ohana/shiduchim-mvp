package com.shiduchim.backend.dto.admin;

import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.UserRole;

import java.time.LocalDateTime;
import java.util.List;

public class AdminEventManagerDetailsResponse {
    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private LocalDateTime createdAt;
    private Boolean adminBlocked;
    private Boolean eventManagerActive;
    private List<ManagedWeddingSummaryResponse> weddings;

    public AdminEventManagerDetailsResponse() {
    }

    public AdminEventManagerDetailsResponse(User user, List<ManagedWeddingSummaryResponse> weddings) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
        this.adminBlocked = user.getAdminBlocked();
        this.eventManagerActive = user.isEffectiveEventManagerActive();
        this.weddings = weddings;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getAdminBlocked() { return adminBlocked; }
    public void setAdminBlocked(Boolean adminBlocked) { this.adminBlocked = adminBlocked; }

    public Boolean getEventManagerActive() { return eventManagerActive; }
    public void setEventManagerActive(Boolean eventManagerActive) { this.eventManagerActive = eventManagerActive; }

    public List<ManagedWeddingSummaryResponse> getWeddings() { return weddings; }
    public void setWeddings(List<ManagedWeddingSummaryResponse> weddings) { this.weddings = weddings; }
}
