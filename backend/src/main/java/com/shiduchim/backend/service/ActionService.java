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

import java.util.List;
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
    private final OpeningMessageService openingMessageService;
    private final NotificationService notificationService;

    public ActionService(
            UserRepository userRepository,
            UserPhotoRepository userPhotoRepository,
            WeddingRepository weddingRepository,
            WeddingParticipantRepository weddingParticipantRepository,
            UserActionRepository userActionRepository,
            MatchRepository matchRepository,
            UserBlockService userBlockService,
            OpeningMessageService openingMessageService,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.weddingRepository = weddingRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
        this.userActionRepository = userActionRepository;
        this.matchRepository = matchRepository;
        this.userBlockService = userBlockService;
        this.openingMessageService = openingMessageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ActionResponse handleAction(User actor, Long targetUserId, ActionType actionType, PoolType poolType, Long weddingId) {
        validateAction(actor, targetUserId, poolType, weddingId);

        if (matchRepository.existsActiveMatchBetweenUsers(actor.getId(), targetUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An active match already exists between these users.");
        }

        List<UserAction> existingActions = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(
                actor.getId(), targetUserId);

        boolean isNewRealLike = false;
        UserAction primaryAction;

        if (!existingActions.isEmpty()) {
            primaryAction = existingActions.get(0);
            if (primaryAction.getActionType() != ActionType.LIKE && actionType == ActionType.LIKE) {
                isNewRealLike = true;
            }
            primaryAction.setActionType(actionType);
            primaryAction.setPoolType(poolType);
            primaryAction.setWeddingId(weddingId);
            primaryAction = userActionRepository.save(primaryAction);

            // Clean up duplicates for this exact actor+target pair
            for (int i = 1; i < existingActions.size(); i++) {
                userActionRepository.delete(existingActions.get(i));
            }
        } else {
            primaryAction = new UserAction();
            primaryAction.setActorUserId(actor.getId());
            primaryAction.setTargetUserId(targetUserId);
            primaryAction.setActionType(actionType);
            primaryAction.setPoolType(poolType);
            primaryAction.setWeddingId(weddingId);
            primaryAction = userActionRepository.save(primaryAction);
            if (actionType == ActionType.LIKE) {
                isNewRealLike = true;
            }
        }

        if (isNewRealLike) {
            notificationService.createSingleRecipientTransition(
                targetUserId,
                com.shiduchim.backend.enums.NotificationType.LIKE_RECEIVED,
                actor.getId(),
                primaryAction.getId(),
                null,
                "TO_LIKE"
            );
        }

        boolean matchCreated = false;
        boolean matchBlocked = false;
        Long matchId = null;

        Long user1Id = Math.min(actor.getId(), targetUserId);
        Long user2Id = Math.max(actor.getId(), targetUserId);

        List<Match> matches = matchRepository.findByUser1IdAndUser2Id(user1Id, user2Id);
        Optional<Match> existingMatchOpt = matches.isEmpty() ? Optional.empty() : Optional.of(matches.get(0));

        if (actionType == ActionType.LIKE) {
            List<UserAction> oppositeActions = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(
                    targetUserId, actor.getId());

            if (!oppositeActions.isEmpty() && oppositeActions.get(0).getActionType() == ActionType.LIKE) {
                Match match = existingMatchOpt.orElseGet(() -> {
                    Match m = new Match();
                    m.setUser1Id(user1Id);
                    m.setUser2Id(user2Id);
                    m.setPoolType(poolType);
                    m.setWeddingId(weddingId);
                    return m;
                });
                
                boolean matchActivated = !existingMatchOpt.isPresent() || match.getStatus() != MatchStatus.ACTIVE;
                match.setStatus(MatchStatus.ACTIVE);
                match.setBlockedAt(null);
                match = matchRepository.save(match);
                
                matchCreated = matchActivated;
                matchId = match.getId();

                if (matchActivated) {
                    notificationService.createMatchActivationPair(matchId, user1Id, user2Id);
                }

                openingMessageService.attachOpenConversationsToMatchAfterMutualLike(
                        actor.getId(), targetUserId, matchId, poolType, weddingId);
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

        List<UserAction> existingActions = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(
                actor.getId(), targetUserId);

        boolean removed = false;
        if (!existingActions.isEmpty()) {
            UserAction action = existingActions.get(0);
            if (action.getActionType() == ActionType.FREEZE) {
                for (UserAction ua : existingActions) {
                    userActionRepository.delete(ua);
                }
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

        List<UserAction> existingActions = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(
                actor.getId(), targetUserId);

        ActionType removedType = null;
        if (!existingActions.isEmpty()) {
            removedType = existingActions.get(0).getActionType();
            for (UserAction action : existingActions) {
                userActionRepository.delete(action);
            }
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

