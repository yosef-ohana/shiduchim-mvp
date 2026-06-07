package com.shiduchim.backend.dto.action;

import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;

public class RemoveActionResponse {
    private boolean success;
    private String message;
    private Long targetUserId;
    private PoolType poolType;
    private Long weddingId;
    private ActionType removedActionType;

    public RemoveActionResponse() {}

    public RemoveActionResponse(boolean success, String message, Long targetUserId, PoolType poolType, Long weddingId, ActionType removedActionType) {
        this.success = success;
        this.message = message;
        this.targetUserId = targetUserId;
        this.poolType = poolType;
        this.weddingId = weddingId;
        this.removedActionType = removedActionType;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(Long targetUserId) {
        this.targetUserId = targetUserId;
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

    public ActionType getRemovedActionType() {
        return removedActionType;
    }

    public void setRemovedActionType(ActionType removedActionType) {
        this.removedActionType = removedActionType;
    }
}
