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
           "                    AND ua.weddingId = :weddingId)")
    List<Object[]> findWeddingCandidatesWithPhoto(
        @Param("currentUserId") Long currentUserId,
        @Param("oppositeGender") Gender oppositeGender,
        @Param("weddingId") Long weddingId,
        Pageable pageable
    );

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
           "                    AND ua.weddingId IS NULL)")
    List<Object[]> findGlobalCandidatesWithPhoto(
        @Param("currentUserId") Long currentUserId,
        @Param("oppositeGender") Gender oppositeGender,
        Pageable pageable
    );
}
