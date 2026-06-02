package com.shiduchim.backend.dto.admin;

import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.enums.WeddingStatus;

import java.time.LocalDate;

public class AdminWeddingResponse {
    private Long id;
    private String name;
    private String city;
    private LocalDate weddingDate;
    private WeddingStatus status;
    private Long ownerUserId;
    private Long participantsCount;
    private Long matchesCount;

    public AdminWeddingResponse() {}

    public AdminWeddingResponse(Wedding wedding, Long participantsCount, Long matchesCount) {
        this.id = wedding.getId();
        this.name = wedding.getName();
        this.city = wedding.getCity();
        this.weddingDate = wedding.getWeddingDate();
        this.status = wedding.getStatus();
        this.ownerUserId = wedding.getOwnerUserId();
        this.participantsCount = participantsCount;
        this.matchesCount = matchesCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public LocalDate getWeddingDate() { return weddingDate; }
    public void setWeddingDate(LocalDate weddingDate) { this.weddingDate = weddingDate; }

    public WeddingStatus getStatus() { return status; }
    public void setStatus(WeddingStatus status) { this.status = status; }

    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }

    public Long getParticipantsCount() { return participantsCount; }
    public void setParticipantsCount(Long participantsCount) { this.participantsCount = participantsCount; }

    public Long getMatchesCount() { return matchesCount; }
    public void setMatchesCount(Long matchesCount) { this.matchesCount = matchesCount; }
}
