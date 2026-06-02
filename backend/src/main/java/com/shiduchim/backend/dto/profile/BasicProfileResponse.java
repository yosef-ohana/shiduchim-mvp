package com.shiduchim.backend.dto.profile;

import com.shiduchim.backend.enums.ProfileStatus;

import java.util.List;

public class BasicProfileResponse {

    private ProfileStatus profileStatus;
    private List<String> missingFields;
    private Boolean hasPrimaryPhoto;

    public BasicProfileResponse() {}

    public BasicProfileResponse(ProfileStatus profileStatus, List<String> missingFields, Boolean hasPrimaryPhoto) {
        this.profileStatus = profileStatus;
        this.missingFields = missingFields;
        this.hasPrimaryPhoto = hasPrimaryPhoto;
    }

    public ProfileStatus getProfileStatus() { return profileStatus; }
    public void setProfileStatus(ProfileStatus profileStatus) { this.profileStatus = profileStatus; }

    public List<String> getMissingFields() { return missingFields; }
    public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields; }

    public Boolean getHasPrimaryPhoto() { return hasPrimaryPhoto; }
    public void setHasPrimaryPhoto(Boolean hasPrimaryPhoto) { this.hasPrimaryPhoto = hasPrimaryPhoto; }
}
