package com.shiduchim.backend.dto.wedding;

import com.shiduchim.backend.enums.WeddingInviteStatus;
import java.time.LocalDateTime;

public class WeddingInviteResponse {
    private Long id;
    private Long weddingId;
    private String fullName;
    private String email;
    private WeddingInviteStatus status;
    private Long invitedByUserId;
    private Long acceptedUserId;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWeddingId() {
        return weddingId;
    }

    public void setWeddingId(Long weddingId) {
        this.weddingId = weddingId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public WeddingInviteStatus getStatus() {
        return status;
    }

    public void setStatus(WeddingInviteStatus status) {
        this.status = status;
    }

    public Long getInvitedByUserId() {
        return invitedByUserId;
    }

    public void setInvitedByUserId(Long invitedByUserId) {
        this.invitedByUserId = invitedByUserId;
    }

    public Long getAcceptedUserId() {
        return acceptedUserId;
    }

    public void setAcceptedUserId(Long acceptedUserId) {
        this.acceptedUserId = acceptedUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
    }
}
