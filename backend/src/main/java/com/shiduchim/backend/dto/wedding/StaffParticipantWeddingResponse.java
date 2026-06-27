package com.shiduchim.backend.dto.wedding;

import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.WeddingStatus;

import java.time.LocalDateTime;

public class StaffParticipantWeddingResponse {

    private Long weddingId;
    private String weddingName;
    private WeddingStatus weddingStatus;
    private ParticipantStatus participantStatus;
    private LocalDateTime joinedAt;
    private LocalDateTime removedAt;
    private Boolean canRemove;
    private Boolean canRestore;

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public String getWeddingName() { return weddingName; }
    public void setWeddingName(String weddingName) { this.weddingName = weddingName; }

    public WeddingStatus getWeddingStatus() { return weddingStatus; }
    public void setWeddingStatus(WeddingStatus weddingStatus) { this.weddingStatus = weddingStatus; }

    public ParticipantStatus getParticipantStatus() { return participantStatus; }
    public void setParticipantStatus(ParticipantStatus participantStatus) { this.participantStatus = participantStatus; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getRemovedAt() { return removedAt; }
    public void setRemovedAt(LocalDateTime removedAt) { this.removedAt = removedAt; }

    public Boolean getCanRemove() { return canRemove; }
    public void setCanRemove(Boolean canRemove) { this.canRemove = canRemove; }

    public Boolean getCanRestore() { return canRestore; }
    public void setCanRestore(Boolean canRestore) { this.canRestore = canRestore; }
}
