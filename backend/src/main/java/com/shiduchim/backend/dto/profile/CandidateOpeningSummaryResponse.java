package com.shiduchim.backend.dto.profile;

import com.shiduchim.backend.enums.CandidateOpeningDirection;

public class CandidateOpeningSummaryResponse {
    private Long conversationId;
    private CandidateOpeningDirection direction;
    private String status;

    public CandidateOpeningSummaryResponse() {}

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public CandidateOpeningDirection getDirection() { return direction; }
    public void setDirection(CandidateOpeningDirection direction) { this.direction = direction; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
