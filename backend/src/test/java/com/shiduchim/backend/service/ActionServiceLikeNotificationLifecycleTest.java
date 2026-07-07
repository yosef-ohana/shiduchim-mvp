package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.action.ActionResponse;
import com.shiduchim.backend.dto.action.RemoveActionResponse;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;

@SpringBootTest
@ActiveProfiles("test")
public class ActionServiceLikeNotificationLifecycleTest {

    @Autowired private ActionService actionService;
    @Autowired private UserRepository userRepository;
    @Autowired private UserPhotoRepository userPhotoRepository;
    @Autowired private UserActionRepository userActionRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private UserNotificationRepository userNotificationRepository;

    @MockitoSpyBean private NotificationService notificationService;

    private User user1;
    private User user2;
    private User user3;

    @BeforeEach
    void setUp() {
        userNotificationRepository.deleteAll();
        userActionRepository.deleteAll();
        matchRepository.deleteAll();
        userPhotoRepository.deleteAll();
        userRepository.deleteAll();

        user1 = createUser("User One", "user1@example.com", Gender.MALE);
        user2 = createUser("User Two", "user2@example.com", Gender.FEMALE);
        user3 = createUser("User Three", "user3@example.com", Gender.FEMALE);
    }

    private User createUser(String name, String email, Gender gender) {
        User user = new User();
        user.setRole(UserRole.USER);
        user.setProfileStatus(ProfileStatus.FULL);
        user.setGender(gender);
        user.setAdminBlocked(false);
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setFullName(name);
        user = userRepository.save(user);

        UserPhoto p = new UserPhoto();
        p.setUserId(user.getId());
        p.setImageUrl("url");
        p.setIsPrimary(true);
        p.setOrderIndex(0);
        p.setStoragePath("path");
        userPhotoRepository.save(p);

        return user;
    }

    @Test
    void test1_NewLikeCreatesExactlyOneNotification() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);

        List<UserNotification> notifications = userNotificationRepository.findAll();
        assertEquals(1, notifications.size());
        assertEquals(NotificationType.LIKE_RECEIVED, notifications.get(0).getType());
        assertEquals(user2.getId(), notifications.get(0).getRecipientUserId());
        assertEquals(user1.getId(), notifications.get(0).getActorUserId());
    }

    @Test
    void test2_LikeToDislikeDeletesExactNotification() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        assertEquals(1, userNotificationRepository.count());

        actionService.handleAction(user1, user2.getId(), ActionType.DISLIKE, PoolType.GLOBAL, null);
        assertEquals(0, userNotificationRepository.count());
    }

    @Test
    void test3_LikeToFreezeDeletesExactNotification() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        assertEquals(1, userNotificationRepository.count());

        actionService.handleAction(user1, user2.getId(), ActionType.FREEZE, PoolType.GLOBAL, null);
        assertEquals(0, userNotificationRepository.count());
    }

    @Test
    void test4_RemoveActionDeletesExactNotification() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        assertEquals(1, userNotificationRepository.count());

        actionService.removeAction(user1, user2.getId(), PoolType.GLOBAL, null);
        assertEquals(0, userNotificationRepository.count());
    }

    @Test
    void test5_PreviouslyReadNotificationIsStillDeleted() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        
        UserNotification notif = userNotificationRepository.findAll().get(0);
        notif.setReadAt(LocalDateTime.now());
        userNotificationRepository.save(notif);

        actionService.handleAction(user1, user2.getId(), ActionType.DISLIKE, PoolType.GLOBAL, null);
        assertEquals(0, userNotificationRepository.count());
    }

    @Test
    void test6_UnreadNotificationDeletionReducesCount() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        assertEquals(1, userNotificationRepository.countByRecipientUserIdAndReadAtIsNull(user2.getId()));

        actionService.handleAction(user1, user2.getId(), ActionType.FREEZE, PoolType.GLOBAL, null);
        assertEquals(0, userNotificationRepository.countByRecipientUserIdAndReadAtIsNull(user2.getId()));
    }

    @Test
    void test7_RemovingReadNotificationDoesNotAffectUnreadNotification() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null); // Unread
        
        // Setup another notification
        UserNotification other = new UserNotification();
        other.setRecipientUserId(user2.getId());
        other.setType(NotificationType.MATCH_CREATED);
        other.setActorUserId(user3.getId());
        other.setReferenceId(999L);
        other.setEventKey("other");
        other.setReadAt(LocalDateTime.now()); // Make this read
        userNotificationRepository.save(other);
        
        // Read the Like notification
        UserNotification likeNotif = userNotificationRepository.findAll().stream().filter(n -> n.getType() == NotificationType.LIKE_RECEIVED).findFirst().get();
        likeNotif.setReadAt(LocalDateTime.now());
        userNotificationRepository.save(likeNotif);

        // Add a new unread notification
        UserNotification unreadOther = new UserNotification();
        unreadOther.setRecipientUserId(user2.getId());
        unreadOther.setType(NotificationType.OPENING_RECEIVED);
        unreadOther.setActorUserId(user3.getId());
        unreadOther.setReferenceId(888L);
        unreadOther.setEventKey("unread_other");
        userNotificationRepository.save(unreadOther);

        assertEquals(1, userNotificationRepository.countByRecipientUserIdAndReadAtIsNull(user2.getId())); // Only unreadOther is unread

        actionService.removeAction(user1, user2.getId(), PoolType.GLOBAL, null);
        
        assertEquals(1, userNotificationRepository.countByRecipientUserIdAndReadAtIsNull(user2.getId())); // Still 1 unread
        assertEquals(2, userNotificationRepository.count()); // other and unreadOther remain
    }

    @Test
    void test8_MissingLikeNotificationIsIdempotentSuccess() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        userNotificationRepository.deleteAll(); // Delete it manually

        assertDoesNotThrow(() -> actionService.removeAction(user1, user2.getId(), PoolType.GLOBAL, null));
    }

    @Test
    void test9_NewLikeAfterCancellationCreatesOneNewNotification() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        actionService.removeAction(user1, user2.getId(), PoolType.GLOBAL, null);
        assertEquals(0, userNotificationRepository.count());

        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        assertEquals(1, userNotificationRepository.count());
    }

    @Test
    void test10_OtherNotificationTypesAreNotDeleted() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        
        UserNotification other = new UserNotification();
        other.setRecipientUserId(user2.getId());
        other.setType(NotificationType.MATCH_CREATED);
        other.setActorUserId(user1.getId());
        other.setReferenceId(userActionRepository.findAll().get(0).getId()); // Same reference ID
        other.setEventKey("match");
        userNotificationRepository.save(other);

        actionService.removeAction(user1, user2.getId(), PoolType.GLOBAL, null);
        
        List<UserNotification> remaining = userNotificationRepository.findAll();
        assertEquals(1, remaining.size());
        assertEquals(NotificationType.MATCH_CREATED, remaining.get(0).getType());
    }

    @Test
    void test11_DuplicateLikeRowsAllRemoved() {
        // Create duplicate LIKE actions manually
        UserAction like1 = new UserAction();
        like1.setActorUserId(user1.getId());
        like1.setTargetUserId(user2.getId());
        like1.setActionType(ActionType.LIKE);
        like1.setPoolType(PoolType.GLOBAL);
        like1 = userActionRepository.save(like1);

        UserNotification n1 = new UserNotification();
        n1.setRecipientUserId(user2.getId());
        n1.setType(NotificationType.LIKE_RECEIVED);
        n1.setActorUserId(user1.getId());
        n1.setReferenceId(like1.getId());
        n1.setEventKey("1");
        userNotificationRepository.save(n1);

        UserAction like2 = new UserAction();
        like2.setActorUserId(user1.getId());
        like2.setTargetUserId(user2.getId());
        like2.setActionType(ActionType.LIKE);
        like2.setPoolType(PoolType.GLOBAL);
        like2 = userActionRepository.save(like2);

        UserNotification n2 = new UserNotification();
        n2.setRecipientUserId(user2.getId());
        n2.setType(NotificationType.LIKE_RECEIVED);
        n2.setActorUserId(user1.getId());
        n2.setReferenceId(like2.getId());
        n2.setEventKey("2");
        userNotificationRepository.save(n2);

        actionService.handleAction(user1, user2.getId(), ActionType.DISLIKE, PoolType.GLOBAL, null);
        
        assertEquals(0, userNotificationRepository.count());
        List<UserAction> actions = userActionRepository.findAll();
        assertEquals(1, actions.size());
        assertEquals(ActionType.DISLIKE, actions.get(0).getActionType());
    }

    @Test
    void test12_ActiveMatchBlocksRemoveAction() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);

        Match match = new Match();
        match.setUser1Id(Math.min(user1.getId(), user2.getId()));
        match.setUser2Id(Math.max(user1.getId(), user2.getId()));
        match.setPoolType(PoolType.WEDDING); // Different pool
        match.setWeddingId(999L);
        match.setStatus(MatchStatus.ACTIVE);
        matchRepository.save(match);

        assertThrows(ResponseStatusException.class, () -> 
            actionService.removeAction(user1, user2.getId(), PoolType.GLOBAL, null)
        );

        assertEquals(1, userNotificationRepository.count());
        assertEquals(1, userActionRepository.count());
    }

    @Test
    void test13_FailureRollsBackActionMutation() {
        actionService.handleAction(user1, user2.getId(), ActionType.LIKE, PoolType.GLOBAL, null);
        assertEquals(1, userNotificationRepository.count());

        doThrow(new DataIntegrityViolationException("Simulated failure"))
            .when(notificationService).deleteLikeNotificationsForInvalidatedActions(any(), any(), any());

        assertThrows(Exception.class, () -> 
            actionService.handleAction(user1, user2.getId(), ActionType.DISLIKE, PoolType.GLOBAL, null)
        );

        assertEquals(1, userActionRepository.count());
        assertEquals(ActionType.LIKE, userActionRepository.findAll().get(0).getActionType());
        assertEquals(1, userNotificationRepository.count());
    }
}
