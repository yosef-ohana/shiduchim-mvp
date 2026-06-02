package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.chat.ChatMessageRequest;
import com.shiduchim.backend.dto.chat.ChatMessageResponse;
import com.shiduchim.backend.dto.chat.ChatMessagesResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches/{matchId}/messages")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public ChatMessagesResponse getMessages(@AuthenticationPrincipal User currentUser, @PathVariable Long matchId) {
        return chatService.getMessages(currentUser, matchId);
    }

    @PostMapping
    public ChatMessageResponse sendMessage(@AuthenticationPrincipal User currentUser, @PathVariable Long matchId, @Valid @RequestBody ChatMessageRequest request) {
        return chatService.sendMessage(currentUser, matchId, request);
    }
}
