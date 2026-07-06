package com.shiduchim.backend.dto.admin;

import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.enums.WeddingStatus;

import java.time.LocalDate;

public class ManagedWeddingSummaryResponse {
    private Long id;
    private String name;
    private String city;
    private LocalDate weddingDate;
    private WeddingStatus status;
    private String accessCode;
    private long participantsCount;
    private long matchesCount;

    public ManagedWeddingSummaryResponse() {
    }

    public ManagedWeddingSummaryResponse(Wedding wedding, long participantsCount, long matchesCount) {
        this.id = wedding.getId();
        this.name = wedding.getName();
        this.city = wedding.getCity();
        this.weddingDate = wedding.getWeddingDate();
        this.status = wedding.getStatus();
        this.accessCode = wedding.getAccessCode();
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

    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }

    public long getParticipantsCount() { return participantsCount; }
    public void setParticipantsCount(long participantsCount) { this.participantsCount = participantsCount; }

    public long getMatchesCount() { return matchesCount; }
    public void setMatchesCount(long matchesCount) { this.matchesCount = matchesCount; }
}
