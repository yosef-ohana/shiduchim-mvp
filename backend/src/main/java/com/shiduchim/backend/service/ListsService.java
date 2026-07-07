package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.list.ActionListItemResponse;
import com.shiduchim.backend.dto.list.LikedMeItemResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserAction;
import com.shiduchim.backend.entity.UserPhoto;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.enums.ActionType;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserActionRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.enums.WeddingStatus;
import com.shiduchim.backend.repository.OpeningConversationRepository;
import com.shiduchim.backend.entity.OpeningConversation;
import com.shiduchim.backend.enums.OpeningConversationStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ListsService {

    private final UserActionRepository userActionRepository;
    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final MatchRepository matchRepository;
    private final UserBlockService userBlockService;
    private final OpeningConversationRepository openingConversationRepository;
    private final WeddingRepository weddingRepository;

    public ListsService(
            UserActionRepository userActionRepository,
            UserRepository userRepository,
            UserPhotoRepository userPhotoRepository,
            MatchRepository matchRepository,
            UserBlockService userBlockService,
            OpeningConversationRepository openingConversationRepository,
            WeddingRepository weddingRepository) {
        this.userActionRepository = userActionRepository;
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.matchRepository = matchRepository;
        this.userBlockService = userBlockService;
        this.openingConversationRepository = openingConversationRepository;
        this.weddingRepository = weddingRepository;
    }

    public List<ActionListItemResponse> getOutgoingActionsList(User currentUser, ActionType actionType, PoolType poolType, Long weddingId) {
        validateUser(currentUser);
        validateParams(poolType, weddingId);

        List<UserAction> actions;
        if (poolType == null) {
            actions = userActionRepository.findByActorUserIdAndActionType(currentUser.getId(), actionType);
        } else if (poolType == PoolType.GLOBAL) {
            actions = userActionRepository.findByActorUserIdAndActionTypeAndPoolType(currentUser.getId(), actionType, PoolType.GLOBAL);
        } else { // PoolType.WEDDING
            if (weddingId != null) {
                actions = userActionRepository.findByActorUserIdAndActionTypeAndPoolTypeAndWeddingId(currentUser.getId(), actionType, PoolType.WEDDING, weddingId);
            } else {
                actions = userActionRepository.findByActorUserIdAndActionTypeAndPoolType(currentUser.getId(), actionType, PoolType.WEDDING);
            }
        }

        List<ActionListItemResponse> responseList = new ArrayList<>();
        
        Set<Long> matchPartnerIds = null;
        if (actionType == ActionType.LIKE) {
            List<Match> activeMatches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.ACTIVE);
            List<Match> blockedMatches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.BLOCKED);
            matchPartnerIds = java.util.stream.Stream.concat(activeMatches.stream(), blockedMatches.stream())
                    .map(m -> m.getUser1Id().equals(currentUser.getId()) ? m.getUser2Id() : m.getUser1Id())
                    .collect(Collectors.toSet());
        }

        for (UserAction action : actions) {
            if (action.getPoolType() == PoolType.WEDDING) {
                if (action.getWeddingId() == null) continue;
                Wedding wedding = weddingRepository.findById(action.getWeddingId()).orElse(null);
                if (wedding == null || wedding.getStatus() == WeddingStatus.DELETED) {
                    continue;
                }
            }

            User targetUser = userRepository.findById(action.getTargetUserId()).orElse(null);
            if (targetUser == null || Boolean.TRUE.equals(targetUser.getAdminBlocked())) {
                continue;
            }

            // UserBlock enforcement: filter out blocked pairs in either direction
            if (userBlockService.existsActiveBlockBetween(currentUser.getId(), targetUser.getId())) {
                continue;
            }

            if (actionType == ActionType.LIKE && matchPartnerIds != null) {
                if (matchPartnerIds.contains(targetUser.getId())) {
                    continue;
                }
            }

            String primaryPhotoUrl = userPhotoRepository.findByUserIdAndIsPrimaryTrue(targetUser.getId())
                    .map(UserPhoto::getImageUrl).orElse(null);

            ActionListItemResponse itemResponse = new ActionListItemResponse(
                    targetUser.getId(),
                    primaryPhotoUrl,
                    targetUser.getFullName(),
                    targetUser.getAge(),
                    targetUser.getHeightCm(),
                    targetUser.getAreaOfResidence(),
                    targetUser.getReligiousLevel(),
                    targetUser.getEducation(),
                    truncateLookingFor(targetUser.getLookingFor()),
                    action.getActionType(),
                    action.getPoolType(),
                    action.getWeddingId(),
                    action.getUpdatedAt()
            );

            java.util.Optional<OpeningConversation> convOpt = openingConversationRepository.findExistingConversationBetweenUsersInContext(
                    currentUser.getId(), targetUser.getId(), action.getPoolType(), action.getWeddingId(), OpeningConversationStatus.OPEN);

            if (convOpt.isPresent()) {
                OpeningConversation conv = convOpt.get();
                itemResponse.setHasOpenOpeningConversation(true);
                itemResponse.setOpeningConversationId(conv.getId());
                itemResponse.setOpeningConversationDirection(
                        conv.getOpenerUserId().equals(currentUser.getId()) ? "SENT" : "RECEIVED"
                );
                itemResponse.setOpeningConversationStatus(conv.getStatus().name());
            } else {
                itemResponse.setHasOpenOpeningConversation(false);
            }

            responseList.add(itemResponse);
        }

        return responseList;
    }

    public List<LikedMeItemResponse> getLikedMeList(User currentUser, PoolType poolType, Long weddingId) {
        validateUser(currentUser);
        validateParams(poolType, weddingId);

        List<UserAction> actions;
        if (poolType == null) {
            actions = userActionRepository.findByTargetUserIdAndActionType(currentUser.getId(), ActionType.LIKE);
        } else if (poolType == PoolType.GLOBAL) {
            actions = userActionRepository.findByTargetUserIdAndActionTypeAndPoolType(currentUser.getId(), ActionType.LIKE, PoolType.GLOBAL);
        } else { // PoolType.WEDDING
            if (weddingId != null) {
                actions = userActionRepository.findByTargetUserIdAndActionTypeAndPoolTypeAndWeddingId(currentUser.getId(), ActionType.LIKE, PoolType.WEDDING, weddingId);
            } else {
                actions = userActionRepository.findByTargetUserIdAndActionTypeAndPoolType(currentUser.getId(), ActionType.LIKE, PoolType.WEDDING);
            }
        }

        // Fetch matches for current user to filter out matches across all contexts
        List<Match> activeMatches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.ACTIVE);
        List<Match> blockedMatches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.BLOCKED);
        Set<Long> matchPartnerIds = java.util.stream.Stream.concat(activeMatches.stream(), blockedMatches.stream())
                .map(m -> m.getUser1Id().equals(currentUser.getId()) ? m.getUser2Id() : m.getUser1Id())
                .collect(Collectors.toSet());

        List<LikedMeItemResponse> responseList = new ArrayList<>();
        for (UserAction action : actions) {
            if (action.getPoolType() == PoolType.WEDDING) {
                if (action.getWeddingId() == null) continue;
                Wedding wedding = weddingRepository.findById(action.getWeddingId()).orElse(null);
                if (wedding == null || wedding.getStatus() == WeddingStatus.DELETED) {
                    continue;
                }
            }

            User liker = userRepository.findById(action.getActorUserId()).orElse(null);
            if (liker == null || Boolean.TRUE.equals(liker.getAdminBlocked())) {
                continue;
            }

            // UserBlock enforcement: filter out blocked pairs in either direction
            if (userBlockService.existsActiveBlockBetween(currentUser.getId(), liker.getId())) {
                continue;
            }

            // Check if there is an active or blocked match in any context
            if (matchPartnerIds.contains(liker.getId())) {
                continue;
            }

            String primaryPhotoUrl = userPhotoRepository.findByUserIdAndIsPrimaryTrue(liker.getId())
                    .map(UserPhoto::getImageUrl).orElse(null);

            LikedMeItemResponse itemResponse = new LikedMeItemResponse(
                    liker.getId(),
                    primaryPhotoUrl,
                    liker.getFullName(),
                    liker.getAge(),
                    liker.getHeightCm(),
                    liker.getAreaOfResidence(),
                    liker.getReligiousLevel(),
                    liker.getEducation(),
                    truncateLookingFor(liker.getLookingFor()),
                    action.getPoolType(),
                    action.getWeddingId(),
                    action.getUpdatedAt() // likedAt is the action's updatedAt time
            );

            java.util.Optional<OpeningConversation> convOpt = openingConversationRepository.findExistingConversationBetweenUsersInContext(
                    currentUser.getId(), liker.getId(), action.getPoolType(), action.getWeddingId(), OpeningConversationStatus.OPEN);

            if (convOpt.isPresent()) {
                OpeningConversation conv = convOpt.get();
                itemResponse.setHasOpenOpeningConversation(true);
                itemResponse.setOpeningConversationId(conv.getId());
                itemResponse.setOpeningConversationDirection(
                        conv.getOpenerUserId().equals(currentUser.getId()) ? "SENT" : "RECEIVED"
                );
                itemResponse.setOpeningConversationStatus(conv.getStatus().name());
            } else {
                itemResponse.setHasOpenOpeningConversation(false);
                itemResponse.setOpeningConversationId(null);
                itemResponse.setOpeningConversationDirection(null);
                itemResponse.setOpeningConversationStatus(null);
            }

            responseList.add(itemResponse);
        }

        return responseList;
    }

    private void validateUser(User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User must have USER role");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked");
        }
    }

    private void validateParams(PoolType poolType, Long weddingId) {
        if (poolType == null && weddingId != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId without poolType is ambiguous");
        }
        if (poolType == PoolType.GLOBAL && weddingId != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId must be null/absent for GLOBAL pool");
        }
    }

    private String truncateLookingFor(String lookingFor) {
        if (lookingFor == null) {
            return null;
        }
        if (lookingFor.length() <= 100) {
            return lookingFor;
        }
        return lookingFor.substring(0, 97) + "...";
    }
}
