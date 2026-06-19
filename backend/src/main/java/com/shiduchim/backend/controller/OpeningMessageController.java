package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.opening.CreateOpeningMessageRequest;
import com.shiduchim.backend.dto.opening.CreateOpeningReplyRequest;
import com.shiduchim.backend.dto.opening.OpeningConversationDetailsResponse;
import com.shiduchim.backend.dto.opening.OpeningConversationSummaryResponse;
import com.shiduchim.backend.dto.opening.OpeningReplyResponse;
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

    /**
     * Batch 5: Opener sends the initial opening message to a target user.
     * POST /api/opening-messages/{targetUserId}
     */
    @PostMapping("/{targetUserId}")
    public ResponseEntity<Void> sendFirstMessage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long targetUserId,
            @RequestBody CreateOpeningMessageRequest request) {
        openingMessageService.sendFirstMessage(currentUser, targetUserId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Batch 6: Recipient replies to an open conversation.
     * First reply: creates an OpeningMessage only (no Match).
     * Second reply with confirmCreateMatch=true: converts to a normal Match.
     * POST /api/opening-messages/{conversationId}/messages
     */
    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<OpeningReplyResponse> replyToConversation(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long conversationId,
            @RequestBody CreateOpeningReplyRequest request) {
        OpeningReplyResponse response = openingMessageService.replyToConversation(currentUser, conversationId, request);
        return ResponseEntity.ok(response);
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
