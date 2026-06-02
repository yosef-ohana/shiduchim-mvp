package com.shiduchim.backend.dto.profile;

import com.shiduchim.backend.enums.ProfileStatus;

import java.util.List;

public class FullProfileResponse {

    private ProfileStatus profileStatus;
    private Boolean globalPoolEnabled;
    private List<String> missingFields;

    public FullProfileResponse() {}

    public FullProfileResponse(ProfileStatus profileStatus, Boolean globalPoolEnabled, List<String> missingFields) {
        this.profileStatus = profileStatus;
        this.globalPoolEnabled = globalPoolEnabled;
        this.missingFields = missingFields;
    }

    public ProfileStatus getProfileStatus() { return profileStatus; }
    public void setProfileStatus(ProfileStatus profileStatus) { this.profileStatus = profileStatus; }

    public Boolean getGlobalPoolEnabled() { return globalPoolEnabled; }
    public void setGlobalPoolEnabled(Boolean globalPoolEnabled) { this.globalPoolEnabled = globalPoolEnabled; }

    public List<String> getMissingFields() { return missingFields; }
    public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields; }
}
