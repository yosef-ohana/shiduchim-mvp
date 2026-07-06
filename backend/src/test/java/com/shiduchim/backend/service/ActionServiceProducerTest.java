package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.action.ActionResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserAction;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.enums.NotificationType;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.repository.UserActionRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.MatchRepository;
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

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class ActionServiceProducerTest {

    @Mock private UserRepository userRepository;
    @Mock private UserPhotoRepository userPhotoRepository;
    @Mock private UserActionRepository userActionRepository;
    @Mock private MatchRepository matchRepository;
    @Mock private UserBlockService userBlockService;
    @Mock private OpeningMessageService openingMessageService;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private ActionService actionService;

    private User actor;
    private User target;

    @BeforeEach
    void setUp() {
        actor = new User();
        actor.setId(10L);
        actor.setRole(UserRole.USER);
        actor.setProfileStatus(ProfileStatus.FULL);
        actor.setGender(com.shiduchim.backend.enums.Gender.MALE);
        actor.setAdminBlocked(false);

        target = new User();
        target.setId(20L);
        target.setRole(UserRole.USER);
        target.setProfileStatus(ProfileStatus.FULL);
        target.setGender(com.shiduchim.backend.enums.Gender.FEMALE);
        target.setAdminBlocked(false);
    }

    private void mockValidation() {
        when(userRepository.findById(20L)).thenReturn(Optional.of(target));
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(10L)).thenReturn(true);
        when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(20L)).thenReturn(true);
        when(userBlockService.existsActiveBlockBetween(10L, 20L)).thenReturn(false);
        when(matchRepository.existsActiveMatchBetweenUsers(10L, 20L)).thenReturn(false);
    }

    @Test
    void testFirstGenuineLike_CreatesNotification() {
        mockValidation();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(10L, 20L)).thenReturn(new ArrayList<>());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(20L, 10L)).thenReturn(new ArrayList<>());
        when(matchRepository.findByUser1IdAndUser2Id(10L, 20L)).thenReturn(new ArrayList<>());

        UserAction savedAction = new UserAction();
        savedAction.setId(100L);
        savedAction.setActionType(ActionType.LIKE);
        when(userActionRepository.save(any(UserAction.class))).thenReturn(savedAction);

        ActionResponse response = actionService.handleAction(actor, 20L, ActionType.LIKE, PoolType.GLOBAL, null);

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.LIKE_RECEIVED), eq(10L), eq(100L), isNull(), eq("TO_LIKE")
        );
        verify(notificationService, never()).createMatchActivationPair(any(), any(), any());
    }

    @Test
    void testRepeatedNoOpLike_CreatesNoNotification() {
        mockValidation();
        UserAction existing = new UserAction();
        existing.setId(100L);
        existing.setActionType(ActionType.LIKE);

        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(10L, 20L)).thenReturn(List.of(existing));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(20L, 10L)).thenReturn(new ArrayList<>());
        when(matchRepository.findByUser1IdAndUser2Id(10L, 20L)).thenReturn(new ArrayList<>());
        when(userActionRepository.save(any(UserAction.class))).thenReturn(existing);

        ActionResponse response = actionService.handleAction(actor, 20L, ActionType.LIKE, PoolType.GLOBAL, null);

        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
    }

    @Test
    void testDislikeToLike_CreatesNotification() {
        mockValidation();
        UserAction existing = new UserAction();
        existing.setId(100L);
        existing.setActionType(ActionType.DISLIKE);

        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(10L, 20L)).thenReturn(List.of(existing));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(20L, 10L)).thenReturn(new ArrayList<>());
        when(matchRepository.findByUser1IdAndUser2Id(10L, 20L)).thenReturn(new ArrayList<>());

        UserAction updatedAction = new UserAction();
        updatedAction.setId(100L);
        updatedAction.setActionType(ActionType.LIKE);
        when(userActionRepository.save(any(UserAction.class))).thenReturn(updatedAction);

        ActionResponse response = actionService.handleAction(actor, 20L, ActionType.LIKE, PoolType.GLOBAL, null);

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.LIKE_RECEIVED), eq(10L), eq(100L), isNull(), eq("TO_LIKE")
        );
    }

    @Test
    void testFreezeItself_CreatesNoNotification() {
        mockValidation();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(10L, 20L)).thenReturn(new ArrayList<>());
        when(matchRepository.findByUser1IdAndUser2Id(10L, 20L)).thenReturn(new ArrayList<>());
        when(userActionRepository.save(any(UserAction.class))).thenReturn(new UserAction());

        ActionResponse response = actionService.handleAction(actor, 20L, ActionType.FREEZE, PoolType.GLOBAL, null);

        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
    }

    @Test
    void testFreezeToLike_CreatesNotification() {
        mockValidation();
        UserAction existing = new UserAction();
        existing.setId(100L);
        existing.setActionType(ActionType.FREEZE);

        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(10L, 20L)).thenReturn(List.of(existing));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(20L, 10L)).thenReturn(new ArrayList<>());
        when(matchRepository.findByUser1IdAndUser2Id(10L, 20L)).thenReturn(new ArrayList<>());

        UserAction updatedAction = new UserAction();
        updatedAction.setId(100L);
        updatedAction.setActionType(ActionType.LIKE);
        when(userActionRepository.save(any(UserAction.class))).thenReturn(updatedAction);

        ActionResponse response = actionService.handleAction(actor, 20L, ActionType.LIKE, PoolType.GLOBAL, null);

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.LIKE_RECEIVED), eq(10L), eq(100L), isNull(), eq("TO_LIKE")
        );
    }

    @Test
    void testMutualLikeMatch_CreatesMatchNotificationPairAndLikeNotification() {
        mockValidation();

        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(10L, 20L)).thenReturn(new ArrayList<>());

        UserAction oppositeLike = new UserAction();
        oppositeLike.setActionType(ActionType.LIKE);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(20L, 10L)).thenReturn(List.of(oppositeLike));

        when(matchRepository.findByUser1IdAndUser2Id(10L, 20L)).thenReturn(new ArrayList<>());

        UserAction savedAction = new UserAction();
        savedAction.setId(100L);
        when(userActionRepository.save(any(UserAction.class))).thenReturn(savedAction);

        Match savedMatch = new Match();
        savedMatch.setId(500L);
        savedMatch.setStatus(MatchStatus.ACTIVE);
        when(matchRepository.save(any(Match.class))).thenReturn(savedMatch);

        ActionResponse response = actionService.handleAction(actor, 20L, ActionType.LIKE, PoolType.GLOBAL, null);

        assertTrue(response.isMatchCreated());

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.LIKE_RECEIVED), eq(10L), eq(100L), isNull(), eq("TO_LIKE")
        );
        verify(notificationService).createMatchActivationPair(500L, 10L, 20L);
    }

    @Test
    void testNotificationFailureRollsBackBusinessMutation() {
        mockValidation();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(10L, 20L)).thenReturn(new ArrayList<>());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(20L, 10L)).thenReturn(new ArrayList<>());
        when(matchRepository.findByUser1IdAndUser2Id(10L, 20L)).thenReturn(new ArrayList<>());

        UserAction savedAction = new UserAction();
        savedAction.setId(100L);
        when(userActionRepository.save(any(UserAction.class))).thenReturn(savedAction);

        doThrow(new RuntimeException("Constraint Violation")).when(notificationService)
            .createSingleRecipientTransition(any(), any(), any(), any(), any(), any());

        assertThrows(RuntimeException.class, () -> {
            actionService.handleAction(actor, 20L, ActionType.LIKE, PoolType.GLOBAL, null);
        });

        // Verifying that exception propagates up unhandled, triggering Spring @Transactional rollback.
    }
}
