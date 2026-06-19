package com.shiduchim.backend.dto.opening;

import com.shiduchim.backend.enums.PoolType;

public class CreateOpeningMessageRequest {
    private String content;
    private PoolType poolType;
    private Long weddingId;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public PoolType getPoolType() { return poolType; }
    public void setPoolType(PoolType poolType) { this.poolType = poolType; }

    public Long getWeddingId() { return weddingId; }
    public void setWeddingId(Long weddingId) { this.weddingId = weddingId; }
}
