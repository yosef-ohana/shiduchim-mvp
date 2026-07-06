package com.shiduchim.backend.dto.admin;

import java.util.List;

public class ReassignManagedWeddingsRequest {
    private List<Long> weddingIds;

    public ReassignManagedWeddingsRequest() {
    }

    public List<Long> getWeddingIds() { return weddingIds; }
    public void setWeddingIds(List<Long> weddingIds) { this.weddingIds = weddingIds; }
}
