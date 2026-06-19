package com.shiduchim.backend.dto.opening;

import com.shiduchim.backend.enums.OpeningConversationStatus;
import com.shiduchim.backend.enums.PoolType;

import java.time.LocalDateTime;

public class OpeningConversationSummaryResponse {
    private Long conversationId;
    private Long otherUserId;
    private String otherUserName;
    private PoolType poolType;
    private Long weddingId;
    private OpeningConversationStatus status;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getOtherUserId() { return otherUserId; }
    public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }

    public String getOtherUserName() { return otherUserName; }
    public void setOtherUserName(String otherUserName) { this.otherUserName = otherUserName; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public OpeningConversationStatus getStatus() { return status; }
    public void setStatus(OpeningConversationStatus status) { this.status = status; }

    public String getLastMessagePreview() { return lastMessagePreview; }
    public void setLastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
