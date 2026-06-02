package com.shiduchim.backend.dto.chat;

import java.util.List;

public class ChatMessagesResponse {

    private Long matchId;
    private List<ChatMessageResponse> messages;

    public ChatMessagesResponse() {}

    public ChatMessagesResponse(Long matchId, List<ChatMessageResponse> messages) {
        this.matchId = matchId;
        this.messages = messages;
    }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public List<ChatMessageResponse> getMessages() { return messages; }
    public void setMessages(List<ChatMessageResponse> messages) { this.messages = messages; }
}
