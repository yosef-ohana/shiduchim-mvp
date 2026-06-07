package com.shiduchim.backend.dto.chat;

import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.PoolType;

import java.time.LocalDateTime;

public class ConversationResponse {

    private Long matchId;
    private Long otherUserId;
    private String otherUserFullName;
    private String otherUserPrimaryPhotoUrl;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private PoolType poolType;
    private Long weddingId;
    private MatchStatus matchStatus;

    public ConversationResponse() {
    }

    public ConversationResponse(Long matchId, Long otherUserId, String otherUserFullName,
                                String otherUserPrimaryPhotoUrl, String lastMessagePreview,
                                LocalDateTime lastMessageAt, PoolType poolType, Long weddingId,
                                MatchStatus matchStatus) {
        this.matchId = matchId;
        this.otherUserId = otherUserId;
        this.otherUserFullName = otherUserFullName;
        this.otherUserPrimaryPhotoUrl = otherUserPrimaryPhotoUrl;
        this.lastMessagePreview = lastMessagePreview;
        this.lastMessageAt = lastMessageAt;
        this.poolType = poolType;
        this.weddingId = weddingId;
        this.matchStatus = matchStatus;
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Long getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(Long otherUserId) {
        this.otherUserId = otherUserId;
    }

    public String getOtherUserFullName() {
        return otherUserFullName;
    }

    public void setOtherUserFullName(String otherUserFullName) {
        this.otherUserFullName = otherUserFullName;
    }

    public String getOtherUserPrimaryPhotoUrl() {
        return otherUserPrimaryPhotoUrl;
    }

    public void setOtherUserPrimaryPhotoUrl(String otherUserPrimaryPhotoUrl) {
        this.otherUserPrimaryPhotoUrl = otherUserPrimaryPhotoUrl;
    }

    public String getLastMessagePreview() {
        return lastMessagePreview;
    }

    public void setLastMessagePreview(String lastMessagePreview) {
        this.lastMessagePreview = lastMessagePreview;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public PoolType getPoolType() {
        return poolType;
    }

    public void setPoolType(PoolType poolType) {
        this.poolType = poolType;
    }

    public Long getWeddingId() {
        return weddingId;
    }

    public void setWeddingId(Long weddingId) {
        this.weddingId = weddingId;
    }

    public MatchStatus getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(MatchStatus matchStatus) {
        this.matchStatus = matchStatus;
    }
}
