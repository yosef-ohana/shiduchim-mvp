package com.shiduchim.backend.dto.opening;

public class CreateOpeningReplyRequest {

    private String content;

    /**
     * Recipient must set this to true on their second reply to explicitly confirm Match creation.
     * If null or false on a second reply, the request is rejected.
     */
    private Boolean confirmCreateMatch;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getConfirmCreateMatch() { return confirmCreateMatch; }
    public void setConfirmCreateMatch(Boolean confirmCreateMatch) { this.confirmCreateMatch = confirmCreateMatch; }
}
