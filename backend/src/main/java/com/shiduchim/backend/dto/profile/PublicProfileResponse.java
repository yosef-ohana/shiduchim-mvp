package com.shiduchim.backend.dto.profile;

public class PublicProfileResponse {

    private Long userId;
    private String primaryPhotoUrl;
    private String additionalPhotoUrl;
    private String fullName;
    private Integer age;
    private Integer heightCm;
    private String areaOfResidence;
    private String religiousLevel;
    private String education;
    private String occupation;
    private String selfDescription;
    private String hobbies;
    private String familyDescription;
    private String lookingFor;
    private String headCovering;
    private Boolean hasDrivingLicense;
    private CandidateRelationshipResponse relationship;

    public PublicProfileResponse() {
    }

    // Getters and setters

    public CandidateRelationshipResponse getRelationship() { return relationship; }
    public void setRelationship(CandidateRelationshipResponse relationship) { this.relationship = relationship; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getPrimaryPhotoUrl() { return primaryPhotoUrl; }
    public void setPrimaryPhotoUrl(String primaryPhotoUrl) { this.primaryPhotoUrl = primaryPhotoUrl; }

    public String getAdditionalPhotoUrl() { return additionalPhotoUrl; }
    public void setAdditionalPhotoUrl(String additionalPhotoUrl) { this.additionalPhotoUrl = additionalPhotoUrl; }

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

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getSelfDescription() { return selfDescription; }
    public void setSelfDescription(String selfDescription) { this.selfDescription = selfDescription; }

    public String getHobbies() { return hobbies; }
    public void setHobbies(String hobbies) { this.hobbies = hobbies; }

    public String getFamilyDescription() { return familyDescription; }
    public void setFamilyDescription(String familyDescription) { this.familyDescription = familyDescription; }

    public String getLookingFor() { return lookingFor; }
    public void setLookingFor(String lookingFor) { this.lookingFor = lookingFor; }

    public String getHeadCovering() { return headCovering; }
    public void setHeadCovering(String headCovering) { this.headCovering = headCovering; }

    public Boolean getHasDrivingLicense() { return hasDrivingLicense; }
    public void setHasDrivingLicense(Boolean hasDrivingLicense) { this.hasDrivingLicense = hasDrivingLicense; }
}
