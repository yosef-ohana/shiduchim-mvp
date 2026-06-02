package com.shiduchim.backend.dto.wedding;

import com.shiduchim.backend.enums.ParticipantStatus;
import java.time.LocalDateTime;

public class JoinWeddingResponse {
    private Long weddingId;
    private String weddingName;
    private ParticipantStatus participantStatus;
    private LocalDateTime joinedAt;

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public String getWeddingName() { return weddingName; }
    public void setWeddingName(String weddingName) { this.weddingName = weddingName; }

    public ParticipantStatus getParticipantStatus() { return participantStatus; }
    public void setParticipantStatus(ParticipantStatus participantStatus) { this.participantStatus = participantStatus; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
