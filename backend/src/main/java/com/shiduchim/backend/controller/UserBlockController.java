package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.block.BlockUserResponse;
import com.shiduchim.backend.dto.block.BlockedUserResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.UserBlockService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blocks")
public class UserBlockController {

    private final UserBlockService userBlockService;

    public UserBlockController(UserBlockService userBlockService) {
        this.userBlockService = userBlockService;
    }

    @PostMapping("/{targetUserId}")
    public ResponseEntity<BlockUserResponse> blockUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId) {
        BlockUserResponse response = userBlockService.blockUser(currentUser, targetUserId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{targetUserId}/unblock")
    public ResponseEntity<BlockUserResponse> unblockUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId) {
        BlockUserResponse response = userBlockService.unblockUser(currentUser, targetUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<BlockedUserResponse>> getBlockedUsers(
            @AuthenticationPrincipal User currentUser) {
        List<BlockedUserResponse> response = userBlockService.getBlockedUsers(currentUser);
        return ResponseEntity.ok(response);
    }
}
