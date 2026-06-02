package com.shiduchim.backend.dto.profile;

import com.shiduchim.backend.enums.Gender;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;

public class ProfileMeResponse {

    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
    private Gender gender;
    private ProfileStatus profileStatus;
    private Boolean adminBlocked;
    private Boolean hasPrimaryPhoto;
    private Long photoCount;
    private Integer age;
    private Integer heightCm;
    private String areaOfResidence;
    private String religiousLevel;
    private String phone;
    private String education;
    private String occupation;
    private String selfDescription;
    private String hobbies;
    private String lookingFor;
    private String familyDescription;
    private String headCovering;
    private Boolean hasDrivingLicense;

    public ProfileMeResponse() {}

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

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Integer getHeightCm() { return heightCm; }
    public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }

    public String getAreaOfResidence() { return areaOfResidence; }
    public void setAreaOfResidence(String areaOfResidence) { this.areaOfResidence = areaOfResidence; }

    public String getReligiousLevel() { return religiousLevel; }
    public void setReligiousLevel(String religiousLevel) { this.religiousLevel = religiousLevel; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getSelfDescription() { return selfDescription; }
    public void setSelfDescription(String selfDescription) { this.selfDescription = selfDescription; }

    public String getHobbies() { return hobbies; }
    public void setHobbies(String hobbies) { this.hobbies = hobbies; }

    public String getLookingFor() { return lookingFor; }
    public void setLookingFor(String lookingFor) { this.lookingFor = lookingFor; }

    public String getFamilyDescription() { return familyDescription; }
    public void setFamilyDescription(String familyDescription) { this.familyDescription = familyDescription; }

    public String getHeadCovering() { return headCovering; }
    public void setHeadCovering(String headCovering) { this.headCovering = headCovering; }

    public Boolean getHasDrivingLicense() { return hasDrivingLicense; }
    public void setHasDrivingLicense(Boolean hasDrivingLicense) { this.hasDrivingLicense = hasDrivingLicense; }
}
