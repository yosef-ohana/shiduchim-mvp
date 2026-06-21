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

    public ListsService(
            UserActionRepository userActionRepository,
            UserRepository userRepository,
            UserPhotoRepository userPhotoRepository,
            MatchRepository matchRepository,
            UserBlockService userBlockService) {
        this.userActionRepository = userActionRepository;
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.matchRepository = matchRepository;
        this.userBlockService = userBlockService;
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
        
        Set<Long> activeMatchPartnerIds = null;
        if (actionType == ActionType.LIKE) {
            List<Match> activeMatches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.ACTIVE);
            activeMatchPartnerIds = activeMatches.stream()
                    .map(m -> m.getUser1Id().equals(currentUser.getId()) ? m.getUser2Id() : m.getUser1Id())
                    .collect(Collectors.toSet());
        }

        for (UserAction action : actions) {
            User targetUser = userRepository.findById(action.getTargetUserId()).orElse(null);
            if (targetUser == null || Boolean.TRUE.equals(targetUser.getAdminBlocked())) {
                continue;
            }

            // UserBlock enforcement: filter out blocked pairs in either direction
            if (userBlockService.existsActiveBlockBetween(currentUser.getId(), targetUser.getId())) {
                continue;
            }

            if (actionType == ActionType.LIKE && activeMatchPartnerIds != null) {
                if (activeMatchPartnerIds.contains(targetUser.getId())) {
                    continue;
                }
            }

            String primaryPhotoUrl = userPhotoRepository.findByUserIdAndIsPrimaryTrue(targetUser.getId())
                    .map(UserPhoto::getImageUrl).orElse(null);

            responseList.add(new ActionListItemResponse(
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
            ));
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

        // Fetch active matches for current user to filter out active matches across all contexts
        List<Match> activeMatches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.ACTIVE);
        Set<Long> activeMatchPartnerIds = activeMatches.stream()
                .map(m -> m.getUser1Id().equals(currentUser.getId()) ? m.getUser2Id() : m.getUser1Id())
                .collect(Collectors.toSet());

        List<LikedMeItemResponse> responseList = new ArrayList<>();
        for (UserAction action : actions) {
            User liker = userRepository.findById(action.getActorUserId()).orElse(null);
            if (liker == null || Boolean.TRUE.equals(liker.getAdminBlocked())) {
                continue;
            }

            // UserBlock enforcement: filter out blocked pairs in either direction
            if (userBlockService.existsActiveBlockBetween(currentUser.getId(), liker.getId())) {
                continue;
            }

            // Check if there is an active match in any context
            if (activeMatchPartnerIds.contains(liker.getId())) {
                continue;
            }

            String primaryPhotoUrl = userPhotoRepository.findByUserIdAndIsPrimaryTrue(liker.getId())
                    .map(UserPhoto::getImageUrl).orElse(null);

            responseList.add(new LikedMeItemResponse(
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
            ));
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
