package com.shiduchim.backend.dto.profile;

public class FullProfileRequest {

    private String education;
    private String occupation;
    private String selfDescription;
    private String hobbies;
    private String lookingFor;
    private String familyDescription;
    private String headCovering;
    private Boolean hasDrivingLicense;

    public FullProfileRequest() {}

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
