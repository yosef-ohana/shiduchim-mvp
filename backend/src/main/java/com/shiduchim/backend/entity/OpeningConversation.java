package com.shiduchim.backend.entity;

import com.shiduchim.backend.enums.OpeningConversationStatus;
import com.shiduchim.backend.enums.PoolType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "opening_conversations")
public class OpeningConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long openerUserId;

    @Column(nullable = false)
    private Long recipientUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PoolType poolType;

    @Column(nullable = true)
    private Long weddingId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OpeningConversationStatus status;

    @Column(nullable = true)
    private Long matchId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOpenerUserId() { return openerUserId; }
    public void setOpenerUserId(Long openerUserId) { this.openerUserId = openerUserId; }

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public OpeningConversationStatus getStatus() { return status; }
    public void setStatus(OpeningConversationStatus status) { this.status = status; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
