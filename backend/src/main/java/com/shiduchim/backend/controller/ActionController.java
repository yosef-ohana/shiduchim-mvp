package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.action.ActionResponse;
import com.shiduchim.backend.dto.action.RemoveActionResponse;
import com.shiduchim.backend.dto.action.UnfreezeResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.service.ActionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/actions")
public class ActionController {

    private final ActionService actionService;

    public ActionController(ActionService actionService) {
        this.actionService = actionService;
    }

    @PostMapping("/{targetUserId}/like")
    public ResponseEntity<ActionResponse> likeUser(
            @AuthenticationPrincipal User user,
            @PathVariable Long targetUserId,
            @RequestParam("poolType") PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        ActionResponse response = actionService.handleAction(user, targetUserId, ActionType.LIKE, poolType, weddingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{targetUserId}/dislike")
    public ResponseEntity<ActionResponse> dislikeUser(
            @AuthenticationPrincipal User user,
            @PathVariable Long targetUserId,
            @RequestParam("poolType") PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        ActionResponse response = actionService.handleAction(user, targetUserId, ActionType.DISLIKE, poolType, weddingId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{targetUserId}/freeze")
    public ResponseEntity<ActionResponse> freezeUser(
            @AuthenticationPrincipal User user,
            @PathVariable Long targetUserId,
            @RequestParam("poolType") PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        ActionResponse response = actionService.handleAction(user, targetUserId, ActionType.FREEZE, poolType, weddingId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{targetUserId}/freeze")
    public ResponseEntity<UnfreezeResponse> unfreezeUser(
            @AuthenticationPrincipal User user,
            @PathVariable Long targetUserId,
            @RequestParam("poolType") PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        UnfreezeResponse response = actionService.unfreeze(user, targetUserId, poolType, weddingId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<RemoveActionResponse> removeAction(
            @AuthenticationPrincipal User user,
            @PathVariable Long targetUserId,
            @RequestParam("poolType") PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        RemoveActionResponse response = actionService.removeAction(user, targetUserId, poolType, weddingId);
        return ResponseEntity.ok(response);
    }
}
