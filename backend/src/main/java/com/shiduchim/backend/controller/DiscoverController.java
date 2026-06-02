package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.discover.DiscoverResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.service.DiscoverService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/discover")
public class DiscoverController {

    private final DiscoverService discoverService;

    public DiscoverController(DiscoverService discoverService) {
        this.discoverService = discoverService;
    }

    @GetMapping
    public ResponseEntity<DiscoverResponse> getDiscover(
            @AuthenticationPrincipal User user,
            @RequestParam("pool") PoolType pool,
            @RequestParam(value = "weddingId", required = false) Long weddingId,
            @RequestParam(value = "limit", required = false) Integer limit) {

        DiscoverResponse response = discoverService.getDiscover(user, pool, weddingId, limit);
        return ResponseEntity.ok(response);
    }
}
