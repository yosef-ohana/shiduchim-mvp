package com.shiduchim.backend.dto.chat;

import java.time.LocalDateTime;

public class ChatMessageResponse {

    private Long id;
    private Long matchId;
    private Long senderId;
    private String content;
    private LocalDateTime sentAt;

    public ChatMessageResponse() {}

    public ChatMessageResponse(Long id, Long matchId, Long senderId, String content, LocalDateTime sentAt) {
        this.id = id;
        this.matchId = matchId;
        this.senderId = senderId;
        this.content = content;
        this.sentAt = sentAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
