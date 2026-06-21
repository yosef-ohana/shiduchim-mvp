package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.Gender;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(com.shiduchim.backend.enums.UserRole role);

    List<User> findByRole(com.shiduchim.backend.enums.UserRole role);

    long countByRole(com.shiduchim.backend.enums.UserRole role);

    long countByRoleAndAdminBlockedFalse(com.shiduchim.backend.enums.UserRole role);

    /**
     * Discover: Wedding pool candidates.
     * Excludes users who:
     * - are not opposite gender
     * - have no primary photo
     * - are not active participants in the wedding
     * - the current user has already acted on (UserAction)
     * - have an ACTIVE UserBlock in either direction
     * - already have an OPEN OpeningConversation with the current user in the same wedding context
     *   (checked bidirectionally: current user as opener OR as recipient)
     * - already have an ACTIVE Match with the current user in the same wedding context
     *   (bidirectional; covers Matches created via OpeningMessages conversion with no UserAction)
     */
    @Query("SELECT u, up.imageUrl FROM User u " +
           "JOIN UserPhoto up ON up.userId = u.id AND up.isPrimary = true " +
           "WHERE u.role = com.shiduchim.backend.enums.UserRole.USER " +
           "  AND u.adminBlocked = false " +
           "  AND u.id <> :currentUserId " +
           "  AND u.gender = :oppositeGender " +
           "  AND (u.profileStatus = com.shiduchim.backend.enums.ProfileStatus.BASIC " +
           "       OR u.profileStatus = com.shiduchim.backend.enums.ProfileStatus.FULL) " +
           "  AND EXISTS (SELECT 1 FROM WeddingParticipant wp " +
           "              WHERE wp.userId = u.id " +
           "                AND wp.weddingId = :weddingId " +
           "                AND wp.status = com.shiduchim.backend.enums.ParticipantStatus.ACTIVE) " +
           "  AND NOT EXISTS (SELECT 1 FROM UserAction ua " +
           "                  WHERE ua.actorUserId = :currentUserId " +
           "                    AND ua.targetUserId = u.id " +
           "                    AND ua.poolType = com.shiduchim.backend.enums.PoolType.WEDDING " +
           "                    AND ua.weddingId = :weddingId) " +
           "  AND NOT EXISTS (SELECT 1 FROM UserBlock ub " +
           "                  WHERE ub.status = com.shiduchim.backend.enums.UserBlockStatus.ACTIVE " +
           "                    AND ((ub.blockerUserId = :currentUserId AND ub.blockedUserId = u.id) " +
           "                      OR (ub.blockerUserId = u.id AND ub.blockedUserId = :currentUserId))) " +
           "  AND NOT EXISTS (SELECT 1 FROM OpeningConversation oc " +
           "                  WHERE oc.status = com.shiduchim.backend.enums.OpeningConversationStatus.OPEN " +
           "                    AND oc.poolType = com.shiduchim.backend.enums.PoolType.WEDDING " +
           "                    AND oc.weddingId = :weddingId " +
           "                    AND ((oc.openerUserId = :currentUserId AND oc.recipientUserId = u.id) " +
           "                      OR (oc.openerUserId = u.id AND oc.recipientUserId = :currentUserId))) " +
           "  AND NOT EXISTS (SELECT 1 FROM Match m " +
           "                  WHERE m.status = com.shiduchim.backend.enums.MatchStatus.ACTIVE " +
           "                    AND ((m.user1Id = :currentUserId AND m.user2Id = u.id) " +
           "                      OR (m.user1Id = u.id AND m.user2Id = :currentUserId)))")
    List<Object[]> findWeddingCandidatesWithPhoto(
        @Param("currentUserId") Long currentUserId,
        @Param("oppositeGender") Gender oppositeGender,
        @Param("weddingId") Long weddingId,
        Pageable pageable
    );

    /**
     * Discover: Global pool candidates.
     * Excludes users who:
     * - are not opposite gender
     * - do not have a FULL profile
     * - have no primary photo
     * - the current user has already acted on (UserAction)
     * - have an ACTIVE UserBlock in either direction
     * - already have an OPEN OpeningConversation with the current user in the global context
     *   (checked bidirectionally: current user as opener OR as recipient; weddingId IS NULL)
     * - already have an ACTIVE Match with the current user in the global context
     *   (bidirectional; covers Matches created via OpeningMessages conversion with no UserAction)
     */
    @Query("SELECT u, up.imageUrl FROM User u " +
           "JOIN UserPhoto up ON up.userId = u.id AND up.isPrimary = true " +
           "WHERE u.role = com.shiduchim.backend.enums.UserRole.USER " +
           "  AND u.adminBlocked = false " +
           "  AND u.id <> :currentUserId " +
           "  AND u.gender = :oppositeGender " +
           "  AND u.profileStatus = com.shiduchim.backend.enums.ProfileStatus.FULL " +
           "  AND NOT EXISTS (SELECT 1 FROM UserAction ua " +
           "                  WHERE ua.actorUserId = :currentUserId " +
           "                    AND ua.targetUserId = u.id " +
           "                    AND ua.poolType = com.shiduchim.backend.enums.PoolType.GLOBAL " +
           "                    AND ua.weddingId IS NULL) " +
           "  AND NOT EXISTS (SELECT 1 FROM UserBlock ub " +
           "                  WHERE ub.status = com.shiduchim.backend.enums.UserBlockStatus.ACTIVE " +
           "                    AND ((ub.blockerUserId = :currentUserId AND ub.blockedUserId = u.id) " +
           "                      OR (ub.blockerUserId = u.id AND ub.blockedUserId = :currentUserId))) " +
           "  AND NOT EXISTS (SELECT 1 FROM OpeningConversation oc " +
           "                  WHERE oc.status = com.shiduchim.backend.enums.OpeningConversationStatus.OPEN " +
           "                    AND oc.poolType = com.shiduchim.backend.enums.PoolType.GLOBAL " +
           "                    AND oc.weddingId IS NULL " +
           "                    AND ((oc.openerUserId = :currentUserId AND oc.recipientUserId = u.id) " +
           "                      OR (oc.openerUserId = u.id AND oc.recipientUserId = :currentUserId))) " +
           "  AND NOT EXISTS (SELECT 1 FROM Match m " +
           "                  WHERE m.status = com.shiduchim.backend.enums.MatchStatus.ACTIVE " +
           "                    AND ((m.user1Id = :currentUserId AND m.user2Id = u.id) " +
           "                      OR (m.user1Id = u.id AND m.user2Id = :currentUserId)))")
    List<Object[]> findGlobalCandidatesWithPhoto(
        @Param("currentUserId") Long currentUserId,
        @Param("oppositeGender") Gender oppositeGender,
        Pageable pageable
    );
}
