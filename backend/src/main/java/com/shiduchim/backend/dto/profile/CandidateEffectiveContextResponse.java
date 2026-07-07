package com.shiduchim.backend.dto.profile;

import com.shiduchim.backend.enums.CandidateProfileSourceType;
import com.shiduchim.backend.enums.PoolType;

public class CandidateEffectiveContextResponse {
    private PoolType poolType;
    private Long weddingId;
    private Boolean validForActions;
    private CandidateProfileSourceType sourceType;

    public CandidateEffectiveContextResponse() {}

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }

    public Boolean getValidForActions() { return validForActions; }
    public void setValidForActions(Boolean validForActions) { this.validForActions = validForActions; }

    public CandidateProfileSourceType getSourceType() { return sourceType; }
    public void setSourceType(CandidateProfileSourceType sourceType) { this.sourceType = sourceType; }
}
