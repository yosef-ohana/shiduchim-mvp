package com.shiduchim.backend.dto.action;

import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;

public class ActionResponse {

    private Long targetUserId;
    private ActionType actionType;
    private PoolType poolType;
    private Long weddingId;
    private boolean matchCreated;
    private boolean matchBlocked;
    private Long matchId;

    public ActionResponse() {}

    public ActionResponse(Long targetUserId, ActionType actionType, PoolType poolType, Long weddingId, boolean matchCreated, boolean matchBlocked, Long matchId) {
        this.targetUserId = targetUserId;
        this.actionType = actionType;
        this.poolType = poolType;
        this.weddingId = weddingId;
        this.matchCreated = matchCreated;
        this.matchBlocked = matchBlocked;
        this.matchId = matchId;
    }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public ActionType getActionType() { return actionType; }
    public void setActionType(ActionType actionType) { this.actionType = actionType; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public boolean isMatchCreated() { return matchCreated; }
    public void setMatchCreated(boolean matchCreated) { this.matchCreated = matchCreated; }

    public boolean isMatchBlocked() { return matchBlocked; }
    public void setMatchBlocked(boolean matchBlocked) { this.matchBlocked = matchBlocked; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
}
