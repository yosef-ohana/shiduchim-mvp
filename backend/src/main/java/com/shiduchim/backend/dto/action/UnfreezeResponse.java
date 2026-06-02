package com.shiduchim.backend.dto.action;

public class UnfreezeResponse {

    private Long targetUserId;
    private boolean removed;
    private boolean canAppearInDiscoverAgain;

    public UnfreezeResponse() {}

    public UnfreezeResponse(Long targetUserId, boolean removed, boolean canAppearInDiscoverAgain) {
        this.targetUserId = targetUserId;
        this.removed = removed;
        this.canAppearInDiscoverAgain = canAppearInDiscoverAgain;
    }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public boolean isRemoved() { return removed; }
    public void setRemoved(boolean removed) { this.removed = removed; }

    public boolean isCanAppearInDiscoverAgain() { return canAppearInDiscoverAgain; }
    public void setCanAppearInDiscoverAgain(boolean canAppearInDiscoverAgain) { this.canAppearInDiscoverAgain = canAppearInDiscoverAgain; }
}
