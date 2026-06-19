package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.opening.CreateOpeningMessageRequest;
import com.shiduchim.backend.dto.opening.OpeningConversationDetailsResponse;
import com.shiduchim.backend.dto.opening.OpeningConversationSummaryResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.OpeningMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opening-messages")
public class OpeningMessageController {

    private final OpeningMessageService openingMessageService;

    public OpeningMessageController(OpeningMessageService openingMessageService) {
        this.openingMessageService = openingMessageService;
    }

    @PostMapping("/{targetUserId}")
    public ResponseEntity<Void> sendFirstMessage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId,
            @RequestBody CreateOpeningMessageRequest request) {
        openingMessageService.sendFirstMessage(currentUser, targetUserId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<OpeningConversationSummaryResponse>> getInbox(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(openingMessageService.getInbox(currentUser));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<OpeningConversationSummaryResponse>> getSent(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(openingMessageService.getSent(currentUser));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<OpeningConversationDetailsResponse> getConversationDetails(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long conversationId) {
        return ResponseEntity.ok(openingMessageService.getConversationDetails(currentUser, conversationId));
    }
}
