package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.notification.NotificationPageResponse;
import com.shiduchim.backend.dto.notification.NotificationResponse;
import com.shiduchim.backend.dto.notification.NotificationUnreadCountResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserNotification;
import com.shiduchim.backend.enums.NotificationType;
import com.shiduchim.backend.repository.UserNotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private UserNotificationRepository repository;

    @InjectMocks
    private NotificationService service;

    private User user;
    private UserNotification unreadNotif;
    private UserNotification readNotif;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);

        unreadNotif = new UserNotification();
        unreadNotif.setId(100L);
        unreadNotif.setRecipientUserId(10L);
        unreadNotif.setType(NotificationType.LIKE_RECEIVED);
        unreadNotif.setReferenceId(50L);
        unreadNotif.setCreatedAt(LocalDateTime.now());
        // readAt is null

        readNotif = new UserNotification();
        readNotif.setId(101L);
        readNotif.setRecipientUserId(10L);
        readNotif.setType(NotificationType.MATCH_CREATED);
        readNotif.setReferenceId(51L);
        readNotif.setCreatedAt(LocalDateTime.now().minusDays(1));
        readNotif.setReadAt(LocalDateTime.now().minusHours(1));
    }

    @Test
    void testListNotifications_Success() {
        when(repository.findByRecipientUserIdOrderByCreatedAtDescIdDesc(eq(10L), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(unreadNotif, readNotif)));

        NotificationPageResponse response = service.listNotifications(user, 0, 30);

        assertEquals(2, response.getItems().size());
        assertEquals(100L, response.getItems().get(0).getId());
        assertEquals(101L, response.getItems().get(1).getId());
        // Both read and unread remain in timeline
        assertNull(response.getItems().get(0).getReadAt());
        assertNotNull(response.getItems().get(1).getReadAt());
    }

    @Test
    void testListNotifications_InvalidPaging() {
        assertThrows(IllegalArgumentException.class, () -> service.listNotifications(user, -1, 30));
        assertThrows(IllegalArgumentException.class, () -> service.listNotifications(user, 0, 0));
        assertThrows(IllegalArgumentException.class, () -> service.listNotifications(user, 0, 101));
    }

    @Test
    void testGetUnreadCount() {
        when(repository.countByRecipientUserIdAndReadAtIsNull(10L)).thenReturn(5L);

        NotificationUnreadCountResponse response = service.getUnreadCount(user);
        assertEquals(5L, response.getUnreadCount());
    }

    @Test
    void testMarkAsRead_UnreadNotification() {
        when(repository.findByIdAndRecipientUserId(100L, 10L)).thenReturn(Optional.of(unreadNotif));
        when(repository.save(any(UserNotification.class))).thenAnswer(i -> i.getArguments()[0]);

        NotificationResponse response = service.markAsRead(user, 100L);
        assertNotNull(response.getReadAt());
        verify(repository, times(1)).save(unreadNotif);
    }

    @Test
    void testMarkAsRead_AlreadyReadNotificationIsIdempotent() {
        LocalDateTime originalReadAt = readNotif.getReadAt();
        when(repository.findByIdAndRecipientUserId(101L, 10L)).thenReturn(Optional.of(readNotif));

        NotificationResponse response = service.markAsRead(user, 101L);
        assertEquals(originalReadAt, response.getReadAt());
        // save should not be called since it's already read
        verify(repository, never()).save(any());
    }

    @Test
    void testMarkAsRead_OtherUserOrNotFound() {
        when(repository.findByIdAndRecipientUserId(999L, 10L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.markAsRead(user, 999L));
    }

    @Test
    void testMarkAllAsRead() {
        when(repository.markAllAsRead(eq(10L), any(LocalDateTime.class))).thenReturn(3);

        NotificationUnreadCountResponse response = service.markAllAsRead(user);
        assertEquals(0L, response.getUnreadCount());
        verify(repository, times(1)).markAllAsRead(eq(10L), any(LocalDateTime.class));
    }

    @Test
    void testCreateSingleRecipientTransition() {
        when(repository.countByRecipientUserIdAndTypeAndReferenceId(10L, NotificationType.LIKE_RECEIVED, 50L)).thenReturn(2L);
        when(repository.save(any(UserNotification.class))).thenAnswer(i -> i.getArguments()[0]);

        service.createSingleRecipientTransition(10L, NotificationType.LIKE_RECEIVED, 20L, 50L, null, "TO_LIKE");

        verify(repository, times(1)).save(argThat(notif ->
            notif.getRecipientUserId() == 10L &&
            notif.getType() == NotificationType.LIKE_RECEIVED &&
            notif.getActorUserId() == 20L &&
            notif.getReferenceId() == 50L &&
            "LIKE_RECEIVED:RECIPIENT:10:REFERENCE:50:EVENT:TO_LIKE:OCCURRENCE:3".equals(notif.getEventKey())
        ));
    }

    @Test
    void testCreateMatchActivationPair_Success() {
        when(repository.countByRecipientUserIdAndTypeAndReferenceId(10L, NotificationType.MATCH_CREATED, 100L)).thenReturn(1L);
        when(repository.countByRecipientUserIdAndTypeAndReferenceId(20L, NotificationType.MATCH_CREATED, 100L)).thenReturn(1L);
        when(repository.save(any(UserNotification.class))).thenAnswer(i -> i.getArguments()[0]);

        service.createMatchActivationPair(100L, 10L, 20L);

        verify(repository, times(2)).save(any(UserNotification.class));

        verify(repository, times(1)).save(argThat(notif ->
            notif.getRecipientUserId() == 10L &&
            notif.getType() == NotificationType.MATCH_CREATED &&
            notif.getActorUserId() == 20L &&
            notif.getReferenceId() == 100L &&
            "MATCH_CREATED:RECIPIENT:10:REFERENCE:100:EVENT:ACTIVATE:OCCURRENCE:2".equals(notif.getEventKey())
        ));

        verify(repository, times(1)).save(argThat(notif ->
            notif.getRecipientUserId() == 20L &&
            notif.getType() == NotificationType.MATCH_CREATED &&
            notif.getActorUserId() == 10L &&
            notif.getReferenceId() == 100L &&
            "MATCH_CREATED:RECIPIENT:20:REFERENCE:100:EVENT:ACTIVATE:OCCURRENCE:2".equals(notif.getEventKey())
        ));
    }

    @Test
    void testCreateMatchActivationPair_InconsistentHistory() {
        when(repository.countByRecipientUserIdAndTypeAndReferenceId(10L, NotificationType.MATCH_CREATED, 100L)).thenReturn(1L);
        when(repository.countByRecipientUserIdAndTypeAndReferenceId(20L, NotificationType.MATCH_CREATED, 100L)).thenReturn(2L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            service.createMatchActivationPair(100L, 10L, 20L);
        });

        assertTrue(ex.getMessage().contains("Inconsistent MATCH_CREATED"));
        verify(repository, never()).save(any(UserNotification.class));
    }
}
