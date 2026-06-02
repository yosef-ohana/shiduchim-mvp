package com.shiduchim.backend.dto.discover;

import java.util.List;

public class DiscoverResponse {

    private List<PublicUserCardResponse> items;

    public DiscoverResponse() {
    }

    public DiscoverResponse(List<PublicUserCardResponse> items) {
        this.items = items;
    }

    public List<PublicUserCardResponse> getItems() {
        return items;
    }

    public void setItems(List<PublicUserCardResponse> items) {
        this.items = items;
    }
}
