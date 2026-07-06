package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.UserNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    Page<UserNotification> findByRecipientUserIdOrderByCreatedAtDescIdDesc(Long recipientUserId, Pageable pageable);

    Optional<UserNotification> findByIdAndRecipientUserId(Long id, Long recipientUserId);

    long countByRecipientUserIdAndReadAtIsNull(Long recipientUserId);

    @Modifying
    @Query("UPDATE UserNotification n SET n.readAt = :readAt WHERE n.recipientUserId = :recipientUserId AND n.readAt IS NULL")
    int markAllAsRead(@Param("recipientUserId") Long recipientUserId, @Param("readAt") LocalDateTime readAt);

    long countByRecipientUserIdAndTypeAndReferenceId(Long recipientUserId, com.shiduchim.backend.enums.NotificationType type, Long referenceId);
}
