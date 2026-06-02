package com.shiduchim.backend.dto.user;

import com.shiduchim.backend.enums.Gender;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;

public class MeResponse {

    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private Gender gender;
    private ProfileStatus profileStatus;
    private Boolean adminBlocked;
    private Boolean hasPrimaryPhoto;
    private Long photoCount;

    public MeResponse() {}

    public MeResponse(Long id, String fullName, String email, UserRole role, Gender gender,
                      ProfileStatus profileStatus, Boolean adminBlocked,
                      Boolean hasPrimaryPhoto, Long photoCount) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.gender = gender;
        this.profileStatus = profileStatus;
        this.adminBlocked = adminBlocked;
        this.hasPrimaryPhoto = hasPrimaryPhoto;
        this.photoCount = photoCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public ProfileStatus getProfileStatus() { return profileStatus; }
    public void setProfileStatus(ProfileStatus profileStatus) { this.profileStatus = profileStatus; }

    public Boolean getAdminBlocked() { return adminBlocked; }
    public void setAdminBlocked(Boolean adminBlocked) { this.adminBlocked = adminBlocked; }

    public Boolean getHasPrimaryPhoto() { return hasPrimaryPhoto; }
    public void setHasPrimaryPhoto(Boolean hasPrimaryPhoto) { this.hasPrimaryPhoto = hasPrimaryPhoto; }

    public Long getPhotoCount() { return photoCount; }
    public void setPhotoCount(Long photoCount) { this.photoCount = photoCount; }
}
