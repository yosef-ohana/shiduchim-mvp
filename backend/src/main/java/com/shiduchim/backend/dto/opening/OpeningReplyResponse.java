package com.shiduchim.backend.dto.opening;

public class OpeningReplyResponse {

    private boolean matchCreated;
    private Long matchId;
    private boolean requiresMatchConfirmation;
    private String message;

    public boolean isMatchCreated() { return matchCreated; }
    public void setMatchCreated(boolean matchCreated) { this.matchCreated = matchCreated; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public boolean isRequiresMatchConfirmation() { return requiresMatchConfirmation; }
    public void setRequiresMatchConfirmation(boolean requiresMatchConfirmation) {
        this.requiresMatchConfirmation = requiresMatchConfirmation;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
