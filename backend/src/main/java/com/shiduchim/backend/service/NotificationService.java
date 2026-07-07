package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.notification.NotificationPageResponse;
import com.shiduchim.backend.dto.notification.NotificationResponse;
import com.shiduchim.backend.dto.notification.NotificationUnreadCountResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserNotification;
import com.shiduchim.backend.repository.UserNotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final UserNotificationRepository userNotificationRepository;

    public NotificationService(UserNotificationRepository userNotificationRepository) {
        this.userNotificationRepository = userNotificationRepository;
    }

    @Transactional(readOnly = true)
    public NotificationPageResponse listNotifications(User user, int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("Page index must not be less than zero");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("Page size must be between 1 and 100");
        }

        Page<UserNotification> notificationPage = userNotificationRepository
                .findByRecipientUserIdOrderByCreatedAtDescIdDesc(user.getId(), PageRequest.of(page, size));

        List<NotificationResponse> items = notificationPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new NotificationPageResponse(
                items,
                notificationPage.getNumber(),
                notificationPage.getSize(),
                notificationPage.getTotalElements(),
                notificationPage.getTotalPages(),
                notificationPage.hasNext()
        );
    }

    @Transactional(readOnly = true)
    public NotificationUnreadCountResponse getUnreadCount(User user) {
        long count = userNotificationRepository.countByRecipientUserIdAndReadAtIsNull(user.getId());
        return new NotificationUnreadCountResponse(count);
    }

    @Transactional
    public NotificationResponse markAsRead(User user, Long notificationId) {
        UserNotification notification = userNotificationRepository.findByIdAndRecipientUserId(notificationId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found or access denied"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notification = userNotificationRepository.save(notification);
        }

        return mapToResponse(notification);
    }

    @Transactional
    public NotificationUnreadCountResponse markAllAsRead(User user) {
        userNotificationRepository.markAllAsRead(user.getId(), LocalDateTime.now());
        return new NotificationUnreadCountResponse(0);
    }

    private NotificationResponse mapToResponse(UserNotification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getActorUserId(),
                notification.getReferenceId(),
                notification.getStatusValue(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }

    @Transactional
    public void createSingleRecipientTransition(Long recipientUserId, com.shiduchim.backend.enums.NotificationType type, Long actorUserId, Long referenceId, String statusValue, String eventLabel) {
        long count = userNotificationRepository.countByRecipientUserIdAndTypeAndReferenceId(recipientUserId, type, referenceId);
        long occurrence = count + 1;

        String eventKey = type.name() + ":RECIPIENT:" + recipientUserId + ":REFERENCE:" + referenceId + ":EVENT:" + eventLabel + ":OCCURRENCE:" + occurrence;

        UserNotification notification = new UserNotification();
        notification.setRecipientUserId(recipientUserId);
        notification.setType(type);
        notification.setActorUserId(actorUserId);
        notification.setReferenceId(referenceId);
        notification.setStatusValue(statusValue);
        notification.setEventKey(eventKey);

        userNotificationRepository.save(notification);
    }

    @Transactional
    public void createMatchActivationPair(Long matchId, Long user1Id, Long user2Id) {
        long count1 = userNotificationRepository.countByRecipientUserIdAndTypeAndReferenceId(user1Id, com.shiduchim.backend.enums.NotificationType.MATCH_CREATED, matchId);
        long count2 = userNotificationRepository.countByRecipientUserIdAndTypeAndReferenceId(user2Id, com.shiduchim.backend.enums.NotificationType.MATCH_CREATED, matchId);

        if (count1 != count2) {
            throw new IllegalStateException("Inconsistent MATCH_CREATED notification history for matchId: " + matchId);
        }

        long occurrence = count1 + 1;

        String eventKey1 = com.shiduchim.backend.enums.NotificationType.MATCH_CREATED.name() + ":RECIPIENT:" + user1Id + ":REFERENCE:" + matchId + ":EVENT:ACTIVATE:OCCURRENCE:" + occurrence;
        String eventKey2 = com.shiduchim.backend.enums.NotificationType.MATCH_CREATED.name() + ":RECIPIENT:" + user2Id + ":REFERENCE:" + matchId + ":EVENT:ACTIVATE:OCCURRENCE:" + occurrence;

        UserNotification notification1 = new UserNotification();
        notification1.setRecipientUserId(user1Id);
        notification1.setType(com.shiduchim.backend.enums.NotificationType.MATCH_CREATED);
        notification1.setActorUserId(user2Id);
        notification1.setReferenceId(matchId);
        notification1.setEventKey(eventKey1);
        userNotificationRepository.save(notification1);

        UserNotification notification2 = new UserNotification();
        notification2.setRecipientUserId(user2Id);
        notification2.setType(com.shiduchim.backend.enums.NotificationType.MATCH_CREATED);
        notification2.setActorUserId(user1Id);
        notification2.setReferenceId(matchId);
        notification2.setEventKey(eventKey2);
        userNotificationRepository.save(notification2);
    }

    @Transactional
    public void deleteLikeNotificationsForInvalidatedActions(Long recipientUserId, Long actorUserId, java.util.Collection<Long> invalidatedActionIds) {
        if (invalidatedActionIds == null || invalidatedActionIds.isEmpty()) {
            return;
        }
        userNotificationRepository.deleteByRecipientAndActorAndTypeAndReferenceIds(
                recipientUserId,
                actorUserId,
                com.shiduchim.backend.enums.NotificationType.LIKE_RECEIVED,
                invalidatedActionIds
        );
    }
}
