package com.shiduchim.backend.entity;

import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_actions",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_user_actions_actor_target_pool_wedding",
            columnNames = {"actor_user_id", "target_user_id", "pool_type", "wedding_id"}
        )
    }
)
public class UserAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType actionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PoolType poolType;

    /**
     * Nullable. Logically required only when poolType=WEDDING.
     * Note: MySQL allows multiple NULL values within a unique constraint,
     * so GLOBAL actions (where wedding_id IS NULL) are uniquely constrained only by
     * (actor_user_id, target_user_id, pool_type). This is acceptable behavior for the MVP.
     * See final report note on nullable wedding_id uniqueness.
     */
    @Column(name = "wedding_id", nullable = true)
    private Long weddingId;

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

    public Long getActorUserId() { return actorUserId; }
    public void setActorUserId(Long actorUserId) { this.actorUserId = actorUserId; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public ActionType getActionType() { return actionType; }
    public void setActionType(ActionType actionType) { this.actionType = actionType; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
