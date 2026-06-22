package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.UserAction;
import com.shiduchim.backend.enums.PoolType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserActionRepository extends JpaRepository<UserAction, Long> {

    List<UserAction> findByActorUserId(Long actorUserId);

    List<UserAction> findByTargetUserId(Long targetUserId);

    Optional<UserAction> findByActorUserIdAndTargetUserIdAndPoolTypeAndWeddingId(
            Long actorUserId,
            Long targetUserId,
            PoolType poolType,
            Long weddingId
    );

    List<UserAction> findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(Long actorUserId, Long targetUserId);

    List<UserAction> findByActorUserIdAndPoolType(Long actorUserId, PoolType poolType);

    List<UserAction> findByActorUserIdAndActionType(Long actorUserId, com.shiduchim.backend.enums.ActionType actionType);

    List<UserAction> findByActorUserIdAndActionTypeAndPoolType(Long actorUserId, com.shiduchim.backend.enums.ActionType actionType, PoolType poolType);

    List<UserAction> findByActorUserIdAndActionTypeAndPoolTypeAndWeddingId(Long actorUserId, com.shiduchim.backend.enums.ActionType actionType, PoolType poolType, Long weddingId);

    List<UserAction> findByTargetUserIdAndActionType(Long targetUserId, com.shiduchim.backend.enums.ActionType actionType);

    List<UserAction> findByTargetUserIdAndActionTypeAndPoolType(Long targetUserId, com.shiduchim.backend.enums.ActionType actionType, PoolType poolType);

    List<UserAction> findByTargetUserIdAndActionTypeAndPoolTypeAndWeddingId(Long targetUserId, com.shiduchim.backend.enums.ActionType actionType, PoolType poolType, Long weddingId);
}

