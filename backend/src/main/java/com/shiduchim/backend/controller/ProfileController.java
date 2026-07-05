package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.profile.*;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileMeResponse> getMyProfile(@AuthenticationPrincipal User user) {
        ProfileMeResponse response = profileService.getMyProfile(user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileMeResponse> updateUnifiedProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UnifiedProfileUpdateRequest request) {
        ProfileMeResponse response = profileService.updateUnifiedProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/basic")
    public ResponseEntity<BasicProfileResponse> updateBasicProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BasicProfileRequest request) {
        BasicProfileResponse response = profileService.updateBasicProfile(user, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/full")
    public ResponseEntity<FullProfileResponse> updateFullProfile(
            @AuthenticationPrincipal User user,
            @RequestBody FullProfileRequest request) {
        FullProfileResponse response = profileService.updateFullProfile(user, request);
        return ResponseEntity.ok(response);
    }
}
