package com.shiduchim.backend.dto.admin;

public class AdminDashboardResponse {
    private long usersCount;
    private long eventManagersCount;
    private long weddingsCount;
    private long activeWeddingsCount;

    public AdminDashboardResponse() {}

    public AdminDashboardResponse(long usersCount, long eventManagersCount, long weddingsCount, long activeWeddingsCount) {
        this.usersCount = usersCount;
        this.eventManagersCount = eventManagersCount;
        this.weddingsCount = weddingsCount;
        this.activeWeddingsCount = activeWeddingsCount;
    }

    public long getUsersCount() {
        return usersCount;
    }

    public void setUsersCount(long usersCount) {
        this.usersCount = usersCount;
    }

    public long getEventManagersCount() {
        return eventManagersCount;
    }

    public void setEventManagersCount(long eventManagersCount) {
        this.eventManagersCount = eventManagersCount;
    }

    public long getWeddingsCount() {
        return weddingsCount;
    }

    public void setWeddingsCount(long weddingsCount) {
        this.weddingsCount = weddingsCount;
    }

    public long getActiveWeddingsCount() {
        return activeWeddingsCount;
    }

    public void setActiveWeddingsCount(long activeWeddingsCount) {
        this.activeWeddingsCount = activeWeddingsCount;
    }
}
