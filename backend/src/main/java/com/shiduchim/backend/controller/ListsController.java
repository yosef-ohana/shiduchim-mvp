package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.list.ActionListItemResponse;
import com.shiduchim.backend.dto.list.LikedMeItemResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.service.ListsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
public class ListsController {

    private final ListsService listsService;

    public ListsController(ListsService listsService) {
        this.listsService = listsService;
    }

    @GetMapping("/likes")
    public ResponseEntity<List<ActionListItemResponse>> getLikes(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(value = "poolType", required = false) PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        List<ActionListItemResponse> response = listsService.getOutgoingActionsList(currentUser, ActionType.LIKE, poolType, weddingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dislikes")
    public ResponseEntity<List<ActionListItemResponse>> getDislikes(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(value = "poolType", required = false) PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        List<ActionListItemResponse> response = listsService.getOutgoingActionsList(currentUser, ActionType.DISLIKE, poolType, weddingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/freezes")
    public ResponseEntity<List<ActionListItemResponse>> getFreezes(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(value = "poolType", required = false) PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        List<ActionListItemResponse> response = listsService.getOutgoingActionsList(currentUser, ActionType.FREEZE, poolType, weddingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/liked-me")
    public ResponseEntity<List<LikedMeItemResponse>> getLikedMe(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(value = "poolType", required = false) PoolType poolType,
            @RequestParam(value = "weddingId", required = false) Long weddingId) {

        List<LikedMeItemResponse> response = listsService.getLikedMeList(currentUser, poolType, weddingId);
        return ResponseEntity.ok(response);
    }
}
