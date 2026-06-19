package com.shiduchim.backend.dto.opening;

import com.shiduchim.backend.enums.OpeningConversationStatus;
import com.shiduchim.backend.enums.PoolType;

import java.util.List;

public class OpeningConversationDetailsResponse {
    private Long conversationId;
    private Long openerUserId;
    private Long recipientUserId;
    private Long otherUserId;
    private PoolType poolType;
    private Long weddingId;
    private OpeningConversationStatus status;
    private List<OpeningMessageResponse> messages;

    /** True when status == MATCH_CREATED */
    private boolean matchCreated;

    /** Set when matchCreated is true */
    private Long matchId;

    /**
     * True when the conversation is OPEN and the recipient has already replied once,
     * meaning their next reply will require confirmCreateMatch=true.
     */
    private boolean requiresMatchConfirmation;

    // Getters and Setters
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getOpenerUserId() { return openerUserId; }
    public void setOpenerUserId(Long openerUserId) { this.openerUserId = openerUserId; }

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }

    public Long getOtherUserId() { return otherUserId; }
    public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public OpeningConversationStatus getStatus() { return status; }
    public void setStatus(OpeningConversationStatus status) { this.status = status; }

    public List<OpeningMessageResponse> getMessages() { return messages; }
    public void setMessages(List<OpeningMessageResponse> messages) { this.messages = messages; }

    public boolean isMatchCreated() { return matchCreated; }
    public void setMatchCreated(boolean matchCreated) { this.matchCreated = matchCreated; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public boolean isRequiresMatchConfirmation() { return requiresMatchConfirmation; }
    public void setRequiresMatchConfirmation(boolean requiresMatchConfirmation) {
        this.requiresMatchConfirmation = requiresMatchConfirmation;
    }
}
