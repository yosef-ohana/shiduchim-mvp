package com.shiduchim.backend.dto.match;

import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.PoolType;

import java.time.LocalDateTime;

public class MatchResponse {
    private Long matchId;
    private Long otherUserId;
    private String otherUserFullName;
    private String otherUserPrimaryPhotoUrl;
    private PoolType poolType;
    private Long weddingId;
    private MatchStatus status;
    private LocalDateTime createdAt;

    public MatchResponse(Long matchId, Long otherUserId, String otherUserFullName, String otherUserPrimaryPhotoUrl, PoolType poolType, Long weddingId, MatchStatus status, LocalDateTime createdAt) {
        this.matchId = matchId;
        this.otherUserId = otherUserId;
        this.otherUserFullName = otherUserFullName;
        this.otherUserPrimaryPhotoUrl = otherUserPrimaryPhotoUrl;
        this.poolType = poolType;
        this.weddingId = weddingId;
        this.status = status;
        this.createdAt = createdAt;
    }

    public MatchResponse() {}

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public Long getOtherUserId() { return otherUserId; }
    public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }
    public String getOtherUserFullName() { return otherUserFullName; }
    public void setOtherUserFullName(String otherUserFullName) { this.otherUserFullName = otherUserFullName; }
    public String getOtherUserPrimaryPhotoUrl() { return otherUserPrimaryPhotoUrl; }
    public void setOtherUserPrimaryPhotoUrl(String otherUserPrimaryPhotoUrl) { this.otherUserPrimaryPhotoUrl = otherUserPrimaryPhotoUrl; }
    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }
    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }
    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
