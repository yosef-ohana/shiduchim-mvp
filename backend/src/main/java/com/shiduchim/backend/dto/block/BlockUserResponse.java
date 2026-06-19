package com.shiduchim.backend.dto.block;

import com.shiduchim.backend.enums.UserBlockStatus;

import java.time.LocalDateTime;

public class BlockUserResponse {
    private Long id;
    private Long blockerUserId;
    private Long blockedUserId;
    private UserBlockStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime unblockedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBlockerUserId() { return blockerUserId; }
    public void setBlockerUserId(Long blockerUserId) { this.blockerUserId = blockerUserId; }

    public Long getBlockedUserId() { return blockedUserId; }
    public void setBlockedUserId(Long blockedUserId) { this.blockedUserId = blockedUserId; }

    public UserBlockStatus getStatus() { return status; }
    public void setStatus(UserBlockStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getUnblockedAt() { return unblockedAt; }
    public void setUnblockedAt(LocalDateTime unblockedAt) { this.unblockedAt = unblockedAt; }
}
