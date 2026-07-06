package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.opening.CreateOpeningMessageRequest;
import com.shiduchim.backend.dto.opening.CreateOpeningReplyRequest;
import com.shiduchim.backend.dto.opening.OpeningReplyResponse;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.entity.OpeningConversation;
import com.shiduchim.backend.entity.OpeningMessage;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.NotificationType;
import com.shiduchim.backend.enums.OpeningConversationStatus;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.ChatMessageRepository;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.OpeningConversationRepository;
import com.shiduchim.backend.repository.OpeningMessageRepository;
import com.shiduchim.backend.service.UserBlockService;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OpeningMessageServiceProducerTest {

    @Mock private OpeningConversationRepository openingConversationRepository;
    @Mock private OpeningMessageRepository openingMessageRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserPhotoRepository userPhotoRepository;
    @Mock private UserBlockService userBlockService;
    @Mock private MatchRepository matchRepository;
    @Mock private ChatMessageRepository chatMessageRepository;
    @Mock private WeddingRepository weddingRepository;
    @Mock private WeddingParticipantRepository weddingParticipantRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private OpeningMessageService openingMessageService;

    private User opener;
    private User recipient;

    @BeforeEach
    void setUp() {
        opener = new User();
        opener.setId(10L);
        opener.setRole(UserRole.USER);
        opener.setGender(com.shiduchim.backend.enums.Gender.MALE);
        opener.setProfileStatus(ProfileStatus.FULL);

        recipient = new User();
        recipient.setId(20L);
        recipient.setRole(UserRole.USER);
        recipient.setGender(com.shiduchim.backend.enums.Gender.FEMALE);
        recipient.setProfileStatus(ProfileStatus.FULL);
    }

    @Test
    void testSendFirstMessage_CreatesOpeningNotification() {
        when(userRepository.findById(20L)).thenReturn(Optional.of(recipient));
        when(userBlockService.existsActiveBlockBetween(10L, 20L)).thenReturn(false);
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(10L)).thenReturn(true);
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(20L)).thenReturn(true);
        when(matchRepository.existsActiveMatchBetweenUsers(10L, 20L)).thenReturn(false);
        when(matchRepository.findByUser1IdOrUser2Id(10L, 10L)).thenReturn(new ArrayList<>());
        when(openingConversationRepository.findExistingConversationBetweenUsersInContext(10L, 20L, PoolType.GLOBAL, null, OpeningConversationStatus.OPEN)).thenReturn(Optional.empty());

        OpeningConversation savedConversation = new OpeningConversation();
        savedConversation.setId(100L);
        when(openingConversationRepository.save(any(OpeningConversation.class))).thenReturn(savedConversation);

        CreateOpeningMessageRequest request = new CreateOpeningMessageRequest();
        request.setContent("Hello");
        request.setPoolType(PoolType.GLOBAL);

        openingMessageService.sendFirstMessage(opener, 20L, request);

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.OPENING_RECEIVED), eq(10L), eq(100L), isNull(), eq("CREATE")
        );
    }

    @Test
    void testReplyToConversation_NoNotificationOnFirstReply() {
        OpeningConversation conversation = new OpeningConversation();
        conversation.setId(100L);
        conversation.setOpenerUserId(10L);
        conversation.setRecipientUserId(20L);
        conversation.setStatus(OpeningConversationStatus.OPEN);

        when(openingConversationRepository.findById(100L)).thenReturn(Optional.of(conversation));
        when(userRepository.findById(10L)).thenReturn(Optional.of(opener));
        when(userBlockService.existsActiveBlockBetween(20L, 10L)).thenReturn(false);

        when(openingMessageRepository.findByConversationIdOrderByCreatedAtAsc(100L)).thenReturn(new ArrayList<>());

        CreateOpeningReplyRequest request = new CreateOpeningReplyRequest();
        request.setContent("Reply");

        OpeningReplyResponse response = openingMessageService.replyToConversation(recipient, 100L, request);

        assertFalse(response.isMatchCreated());
        assertTrue(response.isRequiresMatchConfirmation());

        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
        verify(notificationService, never()).createMatchActivationPair(any(), any(), any());
    }

    @Test
    void testReplyToConversation_ConfirmedMatch_CreatesMatchPairNotification() {
        OpeningConversation conversation = new OpeningConversation();
        conversation.setId(100L);
        conversation.setOpenerUserId(10L);
        conversation.setRecipientUserId(20L);
        conversation.setStatus(OpeningConversationStatus.OPEN);
        conversation.setPoolType(PoolType.GLOBAL);

        when(openingConversationRepository.findById(100L)).thenReturn(Optional.of(conversation));
        when(userRepository.findById(10L)).thenReturn(Optional.of(opener));
        when(userBlockService.existsActiveBlockBetween(20L, 10L)).thenReturn(false);

        OpeningMessage firstReply = new OpeningMessage();
        firstReply.setSenderUserId(20L);
        when(openingMessageRepository.findByConversationIdOrderByCreatedAtAsc(100L)).thenReturn(List.of(firstReply));

        when(matchRepository.findByCanonicalUsersAndContextAndStatus(10L, 20L, PoolType.GLOBAL, null, MatchStatus.ACTIVE)).thenReturn(Optional.empty());
        when(matchRepository.findByCanonicalUsersAndContextAndStatus(10L, 20L, PoolType.GLOBAL, null, MatchStatus.BLOCKED)).thenReturn(Optional.empty());

        Match savedMatch = new Match();
        savedMatch.setId(500L);
        when(matchRepository.save(any(Match.class))).thenReturn(savedMatch);

        CreateOpeningReplyRequest request = new CreateOpeningReplyRequest();
        request.setContent("Yes, confirm");
        request.setConfirmCreateMatch(true);

        OpeningReplyResponse response = openingMessageService.replyToConversation(recipient, 100L, request);

        assertTrue(response.isMatchCreated());
        assertEquals(500L, response.getMatchId());

        verify(notificationService).createMatchActivationPair(500L, 10L, 20L);
        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
    }
}
