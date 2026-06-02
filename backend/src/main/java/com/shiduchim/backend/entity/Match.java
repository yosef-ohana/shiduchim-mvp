package com.shiduchim.backend.entity;

import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.PoolType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "matches",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_matches_users_pool_wedding",
            columnNames = {"user1_id", "user2_id", "pool_type", "wedding_id"}
        )
    }
)
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user1_id", nullable = false)
    private Long user1Id;

    @Column(name = "user2_id", nullable = false)
    private Long user2Id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PoolType poolType;

    /**
     * Nullable. Logically required only when poolType=WEDDING.
     * Note: MySQL allows multiple NULL values within a unique constraint,
     * so GLOBAL matches (where wedding_id IS NULL) are uniquely constrained only by
     * (user1_id, user2_id, pool_type). This is acceptable behavior for the MVP.
     * Service logic should store user1Id < user2Id (smaller ID first) to ensure canonical ordering.
     * See final report note on nullable wedding_id uniqueness.
     */
    @Column(name = "wedding_id", nullable = true)
    private Long weddingId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status = MatchStatus.ACTIVE;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = true)
    private LocalDateTime blockedAt;

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

    public Long getUser1Id() { return user1Id; }
    public void setUser1Id(Long user1Id) { this.user1Id = user1Id; }

    public Long getUser2Id() { return user2Id; }
    public void setUser2Id(Long user2Id) { this.user2Id = user2Id; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getBlockedAt() { return blockedAt; }
    public void setBlockedAt(LocalDateTime blockedAt) { this.blockedAt = blockedAt; }
}
