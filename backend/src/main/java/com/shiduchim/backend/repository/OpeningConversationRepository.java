package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.OpeningConversation;
import com.shiduchim.backend.enums.OpeningConversationStatus;
import com.shiduchim.backend.enums.PoolType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpeningConversationRepository extends JpaRepository<OpeningConversation, Long> {

    List<OpeningConversation> findByRecipientUserIdAndStatusOrderByUpdatedAtDesc(Long recipientUserId, OpeningConversationStatus status);

    List<OpeningConversation> findByOpenerUserIdAndStatusOrderByUpdatedAtDesc(Long openerUserId, OpeningConversationStatus status);

    @Query("SELECT oc FROM OpeningConversation oc WHERE " +
           "((oc.openerUserId = :user1Id AND oc.recipientUserId = :user2Id) OR " +
           "(oc.openerUserId = :user2Id AND oc.recipientUserId = :user1Id)) " +
           "AND oc.poolType = :poolType AND " +
           "((oc.weddingId IS NULL AND :weddingId IS NULL) OR oc.weddingId = :weddingId) " +
           "AND oc.status = :status")
    Optional<OpeningConversation> findExistingConversationBetweenUsersInContext(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id,
            @Param("poolType") PoolType poolType,
            @Param("weddingId") Long weddingId,
            @Param("status") OpeningConversationStatus status);
}
