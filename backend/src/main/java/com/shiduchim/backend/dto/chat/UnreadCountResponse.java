package com.shiduchim.backend.dto.chat;

public class UnreadCountResponse {
    private int unreadCount;

    public UnreadCountResponse() {
    }

    public UnreadCountResponse(int unreadCount) {
        this.unreadCount = unreadCount;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }
}
