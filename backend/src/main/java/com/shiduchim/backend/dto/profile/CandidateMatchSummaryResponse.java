package com.shiduchim.backend.dto.profile;

public class CandidateMatchSummaryResponse {
    private Long matchId;
    private String status;

    public CandidateMatchSummaryResponse() {}

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
