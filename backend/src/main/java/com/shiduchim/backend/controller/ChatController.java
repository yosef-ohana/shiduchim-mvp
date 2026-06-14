package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.chat.ChatMessageRequest;
import com.shiduchim.backend.dto.chat.ChatMessageResponse;
import com.shiduchim.backend.dto.chat.ChatMessagesResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.shiduchim.backend.dto.chat.ConversationResponse;
import com.shiduchim.backend.dto.chat.UnreadCountResponse;

@RestController
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/api/matches/{matchId}/messages")
    public ChatMessagesResponse getMessages(@AuthenticationPrincipal User currentUser, @PathVariable Long matchId) {
        return chatService.getMessages(currentUser, matchId);
    }

    @PostMapping("/api/matches/{matchId}/messages")
    public ChatMessageResponse sendMessage(@AuthenticationPrincipal User currentUser, @PathVariable Long matchId, @Valid @RequestBody ChatMessageRequest request) {
        return chatService.sendMessage(currentUser, matchId, request);
    }

    @GetMapping("/api/chats/conversations")
    public List<ConversationResponse> getConversations(@AuthenticationPrincipal User currentUser) {
        return chatService.getConversations(currentUser);
    }

    @GetMapping("/api/chats/unread-count")
    public UnreadCountResponse getUnreadCount(@AuthenticationPrincipal User currentUser) {
        return chatService.getTotalUnreadCount(currentUser);
    }

    @PatchMapping("/api/matches/{matchId}/messages/read")
    public UnreadCountResponse markMessagesAsRead(@AuthenticationPrincipal User currentUser, @PathVariable Long matchId) {
        return chatService.markMessagesAsRead(currentUser, matchId);
    }
}
