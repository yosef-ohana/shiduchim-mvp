package com.shiduchim.backend.dto.wedding;

import com.shiduchim.backend.enums.WeddingStatus;
import java.time.LocalDate;

public class WeddingResponse {
    private Long id;
    private String name;
    private String city;
    private LocalDate weddingDate;
    private String accessCode;
    private Long ownerUserId;
    private WeddingStatus status;
    private long participantsCount;
    private long matchesCount;
    private String backgroundImageUrl;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public LocalDate getWeddingDate() { return weddingDate; }
    public void setWeddingDate(LocalDate weddingDate) { this.weddingDate = weddingDate; }

    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }

    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }

    public WeddingStatus getStatus() { return status; }
    public void setStatus(WeddingStatus status) { this.status = status; }

    public long getParticipantsCount() { return participantsCount; }
    public void setParticipantsCount(long participantsCount) { this.participantsCount = participantsCount; }

    public long getMatchesCount() { return matchesCount; }
    public void setMatchesCount(long matchesCount) { this.matchesCount = matchesCount; }

    public String getBackgroundImageUrl() { return backgroundImageUrl; }
    public void setBackgroundImageUrl(String backgroundImageUrl) { this.backgroundImageUrl = backgroundImageUrl; }
}
