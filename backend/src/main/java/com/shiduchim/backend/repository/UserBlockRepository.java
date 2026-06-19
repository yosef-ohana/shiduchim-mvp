package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.UserBlock;
import com.shiduchim.backend.enums.UserBlockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBlockRepository extends JpaRepository<UserBlock, Long> {
    Optional<UserBlock> findByBlockerUserIdAndBlockedUserId(Long blockerUserId, Long blockedUserId);
    List<UserBlock> findByBlockerUserIdAndStatus(Long blockerUserId, UserBlockStatus status);
}
