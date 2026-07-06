package com.shiduchim.backend.entity;

import com.shiduchim.backend.enums.NotificationType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_notifications",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_user_notifications_event_key", columnNames = {"event_key"})
    },
    indexes = {
        @Index(name = "idx_user_notifications_recipient_created", columnList = "recipient_user_id, created_at"),
        @Index(name = "idx_user_notifications_recipient_read", columnList = "recipient_user_id, read_at")
    }
)
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_user_id", nullable = false)
    private Long recipientUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "actor_user_id", nullable = true)
    private Long actorUserId;

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Column(name = "status_value", nullable = true)
    private String statusValue;

    @Column(name = "event_key", nullable = false, unique = true)
    private String eventKey;

    @Column(name = "read_at", nullable = true)
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getStatusValue() { return statusValue; }
    public void setStatusValue(String statusValue) { this.statusValue = statusValue; }

    public String getEventKey() { return eventKey; }
    public void setEventKey(String eventKey) { this.eventKey = eventKey; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
