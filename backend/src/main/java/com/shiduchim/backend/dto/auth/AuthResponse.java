package com.shiduchim.backend.dto.auth;

import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;

public class AuthResponse {

    private Long userId;
    private String email;
    private String fullName;
    private UserRole role;
    private ProfileStatus profileStatus;
    private Boolean adminBlocked;
    private String accessToken;

    public AuthResponse() {}

    public AuthResponse(Long userId, String email, String fullName, UserRole role,
                        ProfileStatus profileStatus, Boolean adminBlocked, String accessToken) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.profileStatus = profileStatus;
        this.adminBlocked = adminBlocked;
        this.accessToken = accessToken;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public ProfileStatus getProfileStatus() { return profileStatus; }
    public void setProfileStatus(ProfileStatus profileStatus) { this.profileStatus = profileStatus; }

    public Boolean getAdminBlocked() { return adminBlocked; }
    public void setAdminBlocked(Boolean adminBlocked) { this.adminBlocked = adminBlocked; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
}
