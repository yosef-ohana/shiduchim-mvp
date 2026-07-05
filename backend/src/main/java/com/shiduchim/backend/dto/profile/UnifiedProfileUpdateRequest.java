package com.shiduchim.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UnifiedProfileUpdateRequest {

    @NotNull(message = "targetLevel is required")
    private ProfileUpdateTarget targetLevel;

    @NotBlank(message = "fullName is required")
    private String fullName;

    @NotNull(message = "age is required")
    private Integer age;

    @NotNull(message = "heightCm is required")
    private Integer heightCm;

    @NotBlank(message = "areaOfResidence is required")
    private String areaOfResidence;

    @NotBlank(message = "religiousLevel is required")
    private String religiousLevel;

    @NotBlank(message = "phone is required")
    private String phone;

    private String education;
    private String occupation;
    private String selfDescription;
    private String hobbies;
    private String lookingFor;
    private String familyDescription;
    private String headCovering;
    private Boolean hasDrivingLicense;

    public UnifiedProfileUpdateRequest() {}

    public ProfileUpdateTarget getTargetLevel() { return targetLevel; }
    public void setTargetLevel(ProfileUpdateTarget targetLevel) { this.targetLevel = targetLevel; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

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
