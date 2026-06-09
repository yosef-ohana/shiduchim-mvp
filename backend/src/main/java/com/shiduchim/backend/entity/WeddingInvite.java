package com.shiduchim.backend.entity;

import com.shiduchim.backend.enums.WeddingInviteStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wedding_invites")
public class WeddingInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long weddingId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeddingInviteStatus status = WeddingInviteStatus.PENDING;

    @Column(nullable = false)
    private Long invitedByUserId;

    @Column(nullable = true)
    private Long acceptedUserId;

    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime acceptedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public WeddingInviteStatus getStatus() { return status; }
    public void setStatus(WeddingInviteStatus status) { this.status = status; }

    public Long getInvitedByUserId() { return invitedByUserId; }
    public void setInvitedByUserId(Long invitedByUserId) { this.invitedByUserId = invitedByUserId; }

    public Long getAcceptedUserId() { return acceptedUserId; }
    public void setAcceptedUserId(Long acceptedUserId) { this.acceptedUserId = acceptedUserId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
}
