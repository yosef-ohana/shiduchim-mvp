package com.shiduchim.backend.dto.notification;

import com.shiduchim.backend.enums.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private Long actorUserId;
    private Long referenceId;
    private String statusValue;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public NotificationResponse() {}

    public NotificationResponse(Long id, NotificationType type, Long actorUserId, Long referenceId, String statusValue, LocalDateTime readAt, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.actorUserId = actorUserId;
        this.referenceId = referenceId;
        this.statusValue = statusValue;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getStatusValue() { return statusValue; }
    public void setStatusValue(String statusValue) { this.statusValue = statusValue; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
