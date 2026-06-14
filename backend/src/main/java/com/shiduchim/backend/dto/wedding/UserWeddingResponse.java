package com.shiduchim.backend.dto.wedding;

import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.WeddingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserWeddingResponse {
    private Long weddingId;
    private String weddingName;
    private String city;
    private LocalDate weddingDate;
    private WeddingStatus weddingStatus;
    private ParticipantStatus participantStatus;
    private LocalDateTime joinedAt;
    private boolean isWeddingPoolEligible;

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public String getWeddingName() { return weddingName; }
    public void setWeddingName(String weddingName) { this.weddingName = weddingName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public LocalDate getWeddingDate() { return weddingDate; }
    public void setWeddingDate(LocalDate weddingDate) { this.weddingDate = weddingDate; }

    public WeddingStatus getWeddingStatus() { return weddingStatus; }
    public void setWeddingStatus(WeddingStatus weddingStatus) { this.weddingStatus = weddingStatus; }

    public ParticipantStatus getParticipantStatus() { return participantStatus; }
    public void setParticipantStatus(ParticipantStatus participantStatus) { this.participantStatus = participantStatus; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public boolean isWeddingPoolEligible() { return isWeddingPoolEligible; }
    public void setWeddingPoolEligible(boolean weddingPoolEligible) { isWeddingPoolEligible = weddingPoolEligible; }
}
