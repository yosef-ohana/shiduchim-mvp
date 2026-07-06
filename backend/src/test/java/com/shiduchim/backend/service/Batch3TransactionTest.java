package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.action.ActionResponse;
import com.shiduchim.backend.dto.chat.ChatMessageRequest;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserAction;
import com.shiduchim.backend.entity.UserNotification;
import com.shiduchim.backend.entity.UserPhoto;
import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.Gender;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.NotificationType;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.UserActionRepository;
import com.shiduchim.backend.repository.UserNotificationRepository;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@SpringBootTest
@ActiveProfiles("test")
public class Batch3TransactionTest {

    @Autowired private ActionService actionService;
    @Autowired private ChatService chatService;
    @Autowired private UserRepository userRepository;
    @Autowired private UserPhotoRepository userPhotoRepository;
    @Autowired private UserActionRepository userActionRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private UserNotificationRepository userNotificationRepository;

    @MockitoSpyBean private NotificationService notificationService;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        userNotificationRepository.deleteAll();
        userActionRepository.deleteAll();
        matchRepository.deleteAll();
        userPhotoRepository.deleteAll();
        userRepository.deleteAll();

        user1 = new User();
        user1.setRole(UserRole.USER);
        user1.setProfileStatus(ProfileStatus.FULL);
        user1.setGender(Gender.MALE);
        user1.setAdminBlocked(false);
        user1.setEmail("user1@example.com");
        user1.setPasswordHash("hash1");
        user1.setFullName("User One");
        user1 = userRepository.save(user1);

        user2 = new User();
        user2.setRole(UserRole.USER);
        user2.setProfileStatus(ProfileStatus.FULL);
        user2.setGender(Gender.FEMALE);
        user2.setAdminBlocked(false);
        user2.setEmail("user2@example.com");
        user2.setPasswordHash("hash2");
        user2.setFullName("User Two");
        user2 = userRepository.save(user2);

        UserPhoto p1 = new UserPhoto();
        p1.setUserId(user1.getId());
        p1.setImageUrl("url1");
        p1.setIsPrimary(true);
        p1.setOrderIndex(0);
        p1.setStoragePath("path1");
        userPhotoRepository.save(p1);

        UserPhoto p2 = new UserPhoto();
        p2.setUserId(user2.getId());
        p2.setImageUrl("url2");
        p2.setIsPrimary(true);
        p2.setOrderIndex(0);
        p2.setStoragePath("path2");
        userPhotoRepository.save(p2);
    }

    @Test
    void testChatSendFlowCreatesZeroNotifications() {
        // Prepare active match
        Match match = new Match();
        match.setUser1Id(user1.getId());
        match.setUser2Id(user2.getId());
        match.setPoolType(PoolType.GLOBAL);
        match.setStatus(MatchStatus.ACTIVE);
        match = matchRepository.save(match);

        long initialNotifications = userNotificationRepository.count();
        assertEquals(0, initialNotifications);

        // Execute real chat send flow
        ChatMessageRequest request = new ChatMessageRequest();
        request.setContent("Real integration test message");
        var response = chatService.sendMessage(user1, match.getId(), request);

        assertNotNull(response);
        assertEquals("Real integration test message", response.getContent());

        // Verify absolutely no notifications added
        long finalNotifications = userNotificationRepository.count();
        assertEquals(0, finalNotifications, "Zero UserNotification rows should be added by ChatService");
    }

    @Test
    void testTransactionRollbackOnNotificationFailure() {
        // Original business state: user1 FREEZEs user2
        UserAction freeze = new UserAction();
        freeze.setActorUserId(user1.getId());
        freeze.setTargetUserId(user2.getId());
        freeze.setActionType(ActionType.FREEZE);
        freeze.setPoolType(PoolType.GLOBAL);
        userActionRepository.save(freeze);

        assertEquals(1, userActionRepository.count());
        assertEquals(ActionType.FREEZE, userActionRepository.findAll().get(0).getActionType());

        // We force NotificationService to throw after business mutation is flushed
        doThrow(new DataIntegrityViolationException("Forced unique constraint failure"))
            .when(notificationService).createSingleRecipientTransition(
                eq(user2.getId()), eq(NotificationType.LIKE_RECEIVED), eq(user1.getId()), any(), any(), any()
            );

        // Perform mutation (FREEZE -> LIKE) which triggers notification
        Exception exception = assertThrows(Exception.class, () -> {
            actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        });

        // After the transaction rolls back, verify database state
        assertEquals(1, userActionRepository.count());
        UserAction reloaded = userActionRepository.findAll().get(0);

        // The business mutation is rolled back, restoring original state
        assertEquals(ActionType.FREEZE, reloaded.getActionType());

        // No notification row remains
        assertEquals(0, userNotificationRepository.count());
    }

    @Test
    void testMatchPairAtomicityFailure() {
        // Original business state: user2 LIKEs user1
        UserAction like = new UserAction();
        like.setActorUserId(user2.getId());
        like.setTargetUserId(user1.getId());
        like.setActionType(ActionType.LIKE);
        like.setPoolType(PoolType.GLOBAL);
        userActionRepository.save(like);

        assertEquals(0, matchRepository.count());

        // Force the SECOND match notification (which is for user2) to fail
        // We do this by intercepting createMatchActivationPair, manually saving the first notification, then throwing.
        doAnswer(invocation -> {
            Long matchId = invocation.getArgument(0);
            Long mUser1Id = invocation.getArgument(1);
            Long mUser2Id = invocation.getArgument(2);

            // Simulate the first notification saving successfully
            UserNotification n1 = new UserNotification();
            n1.setRecipientUserId(mUser1Id);
            n1.setType(NotificationType.MATCH_CREATED);
            n1.setReferenceId(matchId);
            n1.setActorUserId(mUser2Id);
            n1.setEventKey("MATCH_CREATED:RECIPIENT:" + mUser1Id + ":REFERENCE:" + matchId + ":EVENT:ACTIVATION:OCCURRENCE:1");
            userNotificationRepository.save(n1);

            // Simulate the second notification failing
            throw new DataIntegrityViolationException("Forced failure on second match notification");
        }).when(notificationService).createMatchActivationPair(any(), any(), any());

        // Execute mutual like (user1 LIKEs user2)
        assertThrows(Exception.class, () -> {
            actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        });

        // Verify neither match notification exists
        assertEquals(0, userNotificationRepository.count());

        // Verify the Match business state did not commit
        assertEquals(0, matchRepository.count());

        // Verify the second Like did not commit partially
        assertEquals(1, userActionRepository.count());
        assertEquals(user2.getId(), userActionRepository.findAll().get(0).getActorUserId());
    }
}
