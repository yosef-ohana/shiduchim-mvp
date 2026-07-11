package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.action.ActionResponse;
import com.shiduchim.backend.dto.action.RemoveActionResponse;
import com.shiduchim.backend.dto.chat.ChatMessageRequest;
import com.shiduchim.backend.dto.opening.CreateOpeningMessageRequest;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.ChatMessageRepository;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.OpeningConversationRepository;
import com.shiduchim.backend.repository.OpeningMessageRepository;
import com.shiduchim.backend.repository.UserActionRepository;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MatchCancellationAlignmentTest {

    @Mock
    private MatchRepository matchRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserPhotoRepository userPhotoRepository;
    @Mock
    private UserBlockService userBlockService;
    @Mock
    private UserActionRepository userActionRepository;
    @Mock
    private WeddingRepository weddingRepository;
    @Mock
    private WeddingParticipantRepository weddingParticipantRepository;
    @Mock
    private OpeningConversationRepository openingConversationRepository;
    @Mock
    private OpeningMessageRepository openingMessageRepository;
    @Mock
    private ChatMessageRepository chatMessageRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MatchService matchService;

    private ActionService actionService;
    private OpeningMessageService openingMessageService;
    private ChatService chatService;

    private User user1;
    private User user2;
    private User user3;
    private Match match;

    @BeforeEach
    void setUp() {
        actionService = new ActionService(
                userRepository, userPhotoRepository, weddingRepository,
                weddingParticipantRepository, userActionRepository, matchRepository,
                userBlockService, null, notificationService); // OpeningMessageService not needed for these tests

        openingMessageService = new OpeningMessageService(
                openingConversationRepository, openingMessageRepository, userRepository,
                userPhotoRepository, userBlockService, matchRepository,
                chatMessageRepository, weddingRepository, weddingParticipantRepository,
                notificationService);

        chatService = new ChatService(
                chatMessageRepository, matchRepository, userRepository,
                userPhotoRepository, userBlockService);

        user1 = new User();
        user1.setId(1L);
        user1.setRole(UserRole.USER);
        user1.setProfileStatus(ProfileStatus.FULL);
        user1.setGender(com.shiduchim.backend.enums.Gender.MALE);

        user2 = new User();
        user2.setId(2L);
        user2.setRole(UserRole.USER);
        user2.setProfileStatus(ProfileStatus.FULL);
        user2.setGender(com.shiduchim.backend.enums.Gender.FEMALE);

        user3 = new User();
        user3.setId(3L);
        user3.setRole(UserRole.USER);

        match = new Match();
        match.setId(100L);
        match.setUser1Id(1L);
        match.setUser2Id(2L);
        match.setStatus(MatchStatus.ACTIVE);
        match.setPoolType(PoolType.GLOBAL);
    }

    @Test
    void testParticipantCancelsActiveMatch() {
        when(matchRepository.findById(100L)).thenReturn(Optional.of(match));
        when(matchRepository.save(any(Match.class))).thenReturn(match);

        matchService.cancelMatch(user1, 100L);

        assertEquals(MatchStatus.BLOCKED, match.getStatus());
        assertNotNull(match.getBlockedAt());
        verify(matchRepository).save(match);
        // Ensure no UserActions, Notifications, Openings, ChatMessages were manipulated
        verifyNoInteractions(userActionRepository);
        verifyNoInteractions(notificationService);
        verifyNoInteractions(openingConversationRepository);
        verifyNoInteractions(chatMessageRepository);
    }

    @Test
    void testNonParticipantCannotCancelMatch() {
        when(matchRepository.findById(100L)).thenReturn(Optional.of(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            matchService.cancelMatch(user3, 100L);
        });

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(matchRepository, never()).save(any());
    }

    @Test
    void testAlreadyBlockedMatchCannotBeCancelled() {
        match.setStatus(MatchStatus.BLOCKED);
        when(matchRepository.findById(100L)).thenReturn(Optional.of(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            matchService.cancelMatch(user1, 100L);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(matchRepository, never()).save(any());
    }

    @Test
    void testActionEndpointRejectsLikeForBlockedPair() {
        match.setStatus(MatchStatus.BLOCKED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.handleAction(user1, 2L, ActionType.LIKE, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userActionRepository, never()).save(any());
    }

    @Test
    void testActionEndpointRejectsDislikeForBlockedPair() {
        match.setStatus(MatchStatus.BLOCKED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.handleAction(user1, 2L, ActionType.DISLIKE, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userActionRepository, never()).save(any());
    }

    @Test
    void testActionEndpointRejectsFreezeForBlockedPair() {
        match.setStatus(MatchStatus.BLOCKED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.handleAction(user1, 2L, ActionType.FREEZE, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userActionRepository, never()).save(any());
    }

    @Test
    void testActionEndpointRejectsRemoveActionForBlockedPair() {
        match.setStatus(MatchStatus.BLOCKED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.removeAction(user1, 2L, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(userActionRepository, never()).delete(any());
        verify(notificationService, never()).deleteLikeNotificationsForInvalidatedActions(anyLong(), anyLong(), anyList());
    }

    @Test
    void testOpeningCreationRejectsBlockedPair() {
        match.setStatus(MatchStatus.BLOCKED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        CreateOpeningMessageRequest req = new CreateOpeningMessageRequest();
        req.setContent("Hello");
        req.setPoolType(PoolType.GLOBAL);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            openingMessageService.sendFirstMessage(user1, 2L, req);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(openingConversationRepository, never()).save(any());
    }

    @Test
    void testBlockedMatchCannotBeReactivatedByMutualLike() {
        match.setStatus(MatchStatus.BLOCKED);
        match.setBlockedAt(java.time.LocalDateTime.now());
        
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        // Attempting to LIKE should be rejected by the guard before any match logic
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.handleAction(user1, 2L, ActionType.LIKE, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(MatchStatus.BLOCKED, match.getStatus());
        assertNotNull(match.getBlockedAt());
        verify(matchRepository, never()).save(any());
    }

    @Test
    void testChatReadRejectsBlockedMatch() {
        match.setStatus(MatchStatus.BLOCKED);
        when(matchRepository.findById(100L)).thenReturn(Optional.of(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            chatService.getMessages(user1, 100L);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void testChatSendRejectsBlockedMatch() {
        match.setStatus(MatchStatus.BLOCKED);
        when(matchRepository.findById(100L)).thenReturn(Optional.of(match));

        ChatMessageRequest req = new ChatMessageRequest();
        req.setContent("Test");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            chatService.sendMessage(user1, 100L, req);
        });

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    void testActionEndpointRejectsLikeForActiveMatch() {
        match.setStatus(MatchStatus.ACTIVE);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.handleAction(user1, 2L, ActionType.LIKE, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userActionRepository, never()).save(any());
        // Verify no Match cancellation side effect
        assertEquals(MatchStatus.ACTIVE, match.getStatus());
        verify(matchRepository, never()).save(any());
    }

    @Test
    void testActionEndpointRejectsDislikeForActiveMatch() {
        match.setStatus(MatchStatus.ACTIVE);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.handleAction(user1, 2L, ActionType.DISLIKE, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userActionRepository, never()).save(any());
        // Verify no Match cancellation side effect
        assertEquals(MatchStatus.ACTIVE, match.getStatus());
        verify(matchRepository, never()).save(any());
    }

    @Test
    void testActionEndpointRejectsFreezeForActiveMatch() {
        match.setStatus(MatchStatus.ACTIVE);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(any())).thenReturn(true);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(Collections.singletonList(match));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            actionService.handleAction(user1, 2L, ActionType.FREEZE, PoolType.GLOBAL, null);
        });

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(userActionRepository, never()).save(any());
        // Verify no Match cancellation side effect
        assertEquals(MatchStatus.ACTIVE, match.getStatus());
        verify(matchRepository, never()).save(any());
    }
}
