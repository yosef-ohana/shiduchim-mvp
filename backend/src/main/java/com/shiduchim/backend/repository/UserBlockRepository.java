package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.UserBlock;
import com.shiduchim.backend.enums.UserBlockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {
    Optional<UserBlock> findByBlockerUserIdAndBlockedUserId(Long blockerUserId, Long blockedUserId);
    List<UserBlock> findByBlockerUserIdAndStatus(Long blockerUserId, UserBlockStatus status);

    @Query("SELECT CASE WHEN COUNT(ub) > 0 THEN true ELSE false END FROM UserBlock ub " +
           "WHERE ub.status = com.shiduchim.backend.enums.UserBlockStatus.ACTIVE " +
           "  AND ((ub.blockerUserId = :userAId AND ub.blockedUserId = :userBId) " +
           "    OR (ub.blockerUserId = :userBId AND ub.blockedUserId = :userAId))")
    boolean existsActiveBlockBetween(@Param("userAId") Long userAId, @Param("userBId") Long userBId);
}
