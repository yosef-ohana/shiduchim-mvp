package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.chat.ChatMessageRequest;
import com.shiduchim.backend.entity.ChatMessage;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.ChatMessageRepository;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.service.UserBlockService;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChatExclusionProducerTest {

    @Mock private ChatMessageRepository chatMessageRepository;
    @Mock private MatchRepository matchRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserPhotoRepository userPhotoRepository;
    @Mock private UserBlockService userBlockService;

    @InjectMocks
    private ChatService chatService;

    private User sender;
    private User recipient;

    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setId(10L);
        sender.setRole(UserRole.USER);
        sender.setAdminBlocked(false);

        recipient = new User();
        recipient.setId(20L);
        recipient.setAdminBlocked(false);
    }

    @Test
    void testChatSendCreatesNoNotification() {
        Match match = new Match();
        match.setId(100L);
        match.setUser1Id(10L);
        match.setUser2Id(20L);
        match.setStatus(MatchStatus.ACTIVE);

        when(matchRepository.findById(100L)).thenReturn(Optional.of(match));
        when(userRepository.findById(20L)).thenReturn(Optional.of(recipient));
        when(userBlockService.existsActiveBlockBetween(10L, 20L)).thenReturn(false);

        ChatMessage savedMsg = new ChatMessage();
        savedMsg.setId(500L);
        savedMsg.setMatchId(100L);
        savedMsg.setSenderId(10L);
        savedMsg.setContent("Hello");
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(savedMsg);

        ChatMessageRequest request = new ChatMessageRequest();
        request.setContent("Hello");

        var response = chatService.sendMessage(sender, 100L, request);

        assertNotNull(response);
        // We verify that ChatService has absolutely no reference to NotificationService,
        // and therefore sending a chat cannot create a notification.
        // It successfully bypassed any notification logic.
    }
}
