package com.shiduchim.backend.dto.match;

import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.PoolType;

import java.time.LocalDateTime;

public class MatchDetailsResponse {
    private Long matchId;
    private MatchUserProfile otherUserProfile;
    private PoolType poolType;
    private Long weddingId;
    private MatchStatus status;
    private LocalDateTime createdAt;

    public MatchDetailsResponse() {}

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public MatchUserProfile getOtherUserProfile() { return otherUserProfile; }
    public void setOtherUserProfile(MatchUserProfile otherUserProfile) { this.otherUserProfile = otherUserProfile; }
    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }
    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }
    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
