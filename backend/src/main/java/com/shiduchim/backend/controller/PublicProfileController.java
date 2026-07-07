package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.profile.PublicProfileResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profiles")
public class PublicProfileController {

    private final ProfileService profileService;

    public PublicProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(
            @AuthenticationPrincipal User user,
            @PathVariable Long userId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) com.shiduchim.backend.enums.CandidateProfileSourceType sourceType,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long sourceId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) com.shiduchim.backend.enums.PoolType poolType,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long weddingId) {
        PublicProfileResponse response = profileService.getPublicProfile(user, userId, sourceType, sourceId, poolType, weddingId);
        return ResponseEntity.ok(response);
    }
}
