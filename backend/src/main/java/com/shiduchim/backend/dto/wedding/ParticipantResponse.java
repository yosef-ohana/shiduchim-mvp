package com.shiduchim.backend.dto.wedding;

import com.shiduchim.backend.enums.Gender;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.ProfileStatus;
import java.time.LocalDateTime;

public class ParticipantResponse {
    private Long userId;
    private String fullName;
    private String email;
    private Gender gender;
    private ProfileStatus profileStatus;
    private boolean hasPrimaryPhoto;
    private ParticipantStatus participantStatus;
    private LocalDateTime joinedAt;
    private LocalDateTime removedAt;

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public ProfileStatus getProfileStatus() { return profileStatus; }
    public void setProfileStatus(ProfileStatus profileStatus) { this.profileStatus = profileStatus; }

    public boolean isHasPrimaryPhoto() { return hasPrimaryPhoto; }
    public void setHasPrimaryPhoto(boolean hasPrimaryPhoto) { this.hasPrimaryPhoto = hasPrimaryPhoto; }

    public ParticipantStatus getParticipantStatus() { return participantStatus; }
    public void setParticipantStatus(ParticipantStatus participantStatus) { this.participantStatus = participantStatus; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getRemovedAt() { return removedAt; }
    public void setRemovedAt(LocalDateTime removedAt) { this.removedAt = removedAt; }
}
