package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.action.ActionResponse;
import com.shiduchim.backend.dto.action.RemoveActionResponse;
import com.shiduchim.backend.dto.action.UnfreezeResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserAction;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.entity.WeddingParticipant;
import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.enums.WeddingStatus;
import com.shiduchim.backend.repository.UserActionRepository;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.enums.MatchStatus;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class ActionService {

    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingParticipantRepository weddingParticipantRepository;
    private final UserActionRepository userActionRepository;
    private final MatchRepository matchRepository;
    private final UserBlockService userBlockService;

    public ActionService(
            UserRepository userRepository,
            UserPhotoRepository userPhotoRepository,
            WeddingRepository weddingRepository,
            WeddingParticipantRepository weddingParticipantRepository,
            UserActionRepository userActionRepository,
            MatchRepository matchRepository,
            UserBlockService userBlockService) {
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.weddingRepository = weddingRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
        this.userActionRepository = userActionRepository;
        this.matchRepository = matchRepository;
        this.userBlockService = userBlockService;
    }

    @Transactional
    public ActionResponse handleAction(User actor, Long targetUserId, ActionType actionType, PoolType poolType, Long weddingId) {
        validateAction(actor, targetUserId, poolType, weddingId);

        Optional<UserAction> existingActionOpt = userActionRepository.findByActorUserIdAndTargetUserIdAndPoolTypeAndWeddingId(
                actor.getId(), targetUserId, poolType, weddingId);

        if (existingActionOpt.isPresent()) {
            UserAction action = existingActionOpt.get();
            action.setActionType(actionType);
            userActionRepository.save(action);
        } else {
            UserAction newAction = new UserAction();
            newAction.setActorUserId(actor.getId());
            newAction.setTargetUserId(targetUserId);
            newAction.setActionType(actionType);
            newAction.setPoolType(poolType);
            newAction.setWeddingId(weddingId);
            userActionRepository.save(newAction);
        }

        boolean matchCreated = false;
        boolean matchBlocked = false;
        Long matchId = null;

        Long user1Id = Math.min(actor.getId(), targetUserId);
        Long user2Id = Math.max(actor.getId(), targetUserId);

        Optional<Match> existingMatchOpt = matchRepository.findByUser1IdAndUser2IdAndPoolTypeAndWeddingId(
                user1Id, user2Id, poolType, weddingId);

        if (actionType == ActionType.LIKE) {
            Optional<UserAction> oppositeActionOpt = userActionRepository.findByActorUserIdAndTargetUserIdAndPoolTypeAndWeddingId(
                    targetUserId, actor.getId(), poolType, weddingId);

            if (oppositeActionOpt.isPresent() && oppositeActionOpt.get().getActionType() == ActionType.LIKE) {
                Match match = existingMatchOpt.orElseGet(() -> {
                    Match m = new Match();
                    m.setUser1Id(user1Id);
                    m.setUser2Id(user2Id);
                    m.setPoolType(poolType);
                    m.setWeddingId(weddingId);
                    return m;
                });
                
                match.setStatus(MatchStatus.ACTIVE);
                match.setBlockedAt(null);
                matchRepository.save(match);
                
                matchCreated = true;
                matchId = match.getId();
            }
        } else if (actionType == ActionType.DISLIKE || actionType == ActionType.FREEZE) {
            if (existingMatchOpt.isPresent() && existingMatchOpt.get().getStatus() == MatchStatus.ACTIVE) {
                Match match = existingMatchOpt.get();
                match.setStatus(MatchStatus.BLOCKED);
                match.setBlockedAt(java.time.LocalDateTime.now());
                matchRepository.save(match);
                
                matchBlocked = true;
                matchId = match.getId();
            }
        }

        return new ActionResponse(
                targetUserId,
                actionType,
                poolType,
                weddingId,
                matchCreated,
                matchBlocked,
                matchId
        );
    }

    @Transactional
    public UnfreezeResponse unfreeze(User actor, Long targetUserId, PoolType poolType, Long weddingId) {
        validateActorAndContext(actor, targetUserId, poolType, weddingId);

        Optional<UserAction> existingActionOpt = userActionRepository.findByActorUserIdAndTargetUserIdAndPoolTypeAndWeddingId(
                actor.getId(), targetUserId, poolType, weddingId);

        boolean removed = false;
        if (existingActionOpt.isPresent()) {
            UserAction action = existingActionOpt.get();
            if (action.getActionType() == ActionType.FREEZE) {
                userActionRepository.delete(action);
                removed = true;
            }
        }

        return new UnfreezeResponse(targetUserId, removed, true);
    }

    @Transactional
    public RemoveActionResponse removeAction(User actor, Long targetUserId, PoolType poolType, Long weddingId) {
        validateActorAndContext(actor, targetUserId, poolType, weddingId);

        Long user1Id = Math.min(actor.getId(), targetUserId);
        Long user2Id = Math.max(actor.getId(), targetUserId);

        Optional<Match> existingMatchOpt = matchRepository.findByUser1IdAndUser2IdAndPoolTypeAndWeddingId(
                user1Id, user2Id, poolType, weddingId);

        if (existingMatchOpt.isPresent() && existingMatchOpt.get().getStatus() == MatchStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot remove action when an ACTIVE Match exists.");
        }

        Optional<UserAction> existingActionOpt = userActionRepository.findByActorUserIdAndTargetUserIdAndPoolTypeAndWeddingId(
                actor.getId(), targetUserId, poolType, weddingId);

        ActionType removedType = null;
        if (existingActionOpt.isPresent()) {
            removedType = existingActionOpt.get().getActionType();
            userActionRepository.delete(existingActionOpt.get());
        }

        return new RemoveActionResponse(
                true,
                "Action removed successfully",
                targetUserId,
                poolType,
                weddingId,
                removedType
        );
    }

    private User validateActorAndContext(User actor, Long targetUserId, PoolType poolType, Long weddingId) {
        if (actor == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Actor must be authenticated");
        }
        if (actor.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot perform action on self");
        }

        // Actor basic validation
        if (actor.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor must have USER role");
        }
        if (Boolean.TRUE.equals(actor.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor is blocked");
        }
        if (actor.getProfileStatus() == ProfileStatus.NONE || actor.getProfileStatus() == ProfileStatus.FULL_INCOMPLETE_BLOCKED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor has invalid profile status");
        }
        if (actor.getGender() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor must have a gender");
        }
        if (!userPhotoRepository.existsByUserIdAndIsPrimaryTrue(actor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor must have a primary photo");
        }

        if (poolType == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "poolType is required");
        }

        // Target user must exist
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        // UserBlock enforcement: block actions between blocked pairs in either direction
        if (userBlockService.existsActiveBlockBetween(actor.getId(), targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Action not allowed between blocked users");
        }

        // Context validations
        if (poolType == PoolType.WEDDING) {
            if (weddingId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId is required for WEDDING pool");
            }
            if (actor.getProfileStatus() != ProfileStatus.BASIC && actor.getProfileStatus() != ProfileStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor profile status must be BASIC or FULL for WEDDING pool");
            }

            Wedding wedding = weddingRepository.findById(weddingId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));
            if (wedding.getStatus() != WeddingStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wedding is not ACTIVE");
            }

            WeddingParticipant actorParticipant = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, actor.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor is not a participant in this wedding"));
            if (actorParticipant.getStatus() != ParticipantStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor is not an ACTIVE participant in this wedding");
            }
        } else if (poolType == PoolType.GLOBAL) {
            if (weddingId != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId must be null for GLOBAL pool");
            }
            if (actor.getProfileStatus() != ProfileStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Actor profile status must be FULL for GLOBAL pool");
            }
        }

        return target;
    }

    private void validateAction(User actor, Long targetUserId, PoolType poolType, Long weddingId) {
        User target = validateActorAndContext(actor, targetUserId, poolType, weddingId);

        // Target validation
        if (target.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user must have USER role");
        }
        if (Boolean.TRUE.equals(target.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user is blocked");
        }
        if (target.getGender() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user must have a gender");
        }
        if (target.getGender() == actor.getGender()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot perform action on same gender");
        }
        if (!userPhotoRepository.existsByUserIdAndIsPrimaryTrue(target.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user must have a primary photo");
        }

        if (poolType == PoolType.WEDDING) {
            if (target.getProfileStatus() != ProfileStatus.BASIC && target.getProfileStatus() != ProfileStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target profile status must be BASIC or FULL for WEDDING pool");
            }

            WeddingParticipant targetParticipant = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, target.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Target is not a participant in this wedding"));
            if (targetParticipant.getStatus() != ParticipantStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target is not an ACTIVE participant in this wedding");
            }
        } else if (poolType == PoolType.GLOBAL) {
            if (target.getProfileStatus() != ProfileStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target profile status must be FULL for GLOBAL pool");
            }
        }
    }
}

