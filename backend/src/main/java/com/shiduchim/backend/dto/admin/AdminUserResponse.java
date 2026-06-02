package com.shiduchim.backend.dto.admin;

import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.Gender;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;

import java.time.LocalDateTime;

public class AdminUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private Gender gender;
    private UserRole role;
    private ProfileStatus profileStatus;
    private Boolean adminBlocked;
    private LocalDateTime createdAt;

    public AdminUserResponse() {}

    public AdminUserResponse(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.gender = user.getGender();
        this.role = user.getRole();
        this.profileStatus = user.getProfileStatus();
        this.adminBlocked = user.getAdminBlocked();
        this.createdAt = user.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public ProfileStatus getProfileStatus() { return profileStatus; }
    public void setProfileStatus(ProfileStatus profileStatus) { this.profileStatus = profileStatus; }

    public Boolean getAdminBlocked() { return adminBlocked; }
    public void setAdminBlocked(Boolean adminBlocked) { this.adminBlocked = adminBlocked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
