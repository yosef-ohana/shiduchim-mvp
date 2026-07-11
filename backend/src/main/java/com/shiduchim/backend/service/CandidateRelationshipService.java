package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.profile.*;
import com.shiduchim.backend.entity.*;
import com.shiduchim.backend.enums.*;
import com.shiduchim.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CandidateRelationshipService {

    private final MatchRepository matchRepository;
    private final OpeningConversationRepository openingConversationRepository;
    private final UserActionRepository userActionRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingParticipantRepository weddingParticipantRepository;
    private final UserPhotoRepository userPhotoRepository;

    public CandidateRelationshipService(
            MatchRepository matchRepository,
            OpeningConversationRepository openingConversationRepository,
            UserActionRepository userActionRepository,
            UserNotificationRepository userNotificationRepository,
            WeddingRepository weddingRepository,
            WeddingParticipantRepository weddingParticipantRepository,
            UserPhotoRepository userPhotoRepository) {
        this.matchRepository = matchRepository;
        this.openingConversationRepository = openingConversationRepository;
        this.userActionRepository = userActionRepository;
        this.userNotificationRepository = userNotificationRepository;
        this.weddingRepository = weddingRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
        this.userPhotoRepository = userPhotoRepository;
    }

    @Transactional(readOnly = true)
    public CandidateRelationshipResponse getRelationship(
            User viewer,
            User target,
            CandidateProfileSourceType sourceType,
            Long sourceId,
            PoolType poolType,
            Long weddingId,
            boolean hasExistingPublicAccess) {

        CandidateEffectiveContextResponse contextResp = new CandidateEffectiveContextResponse();
        contextResp.setSourceType(sourceType);
        contextResp.setPoolType(poolType);
        contextResp.setWeddingId(weddingId);
        contextResp.setValidForActions(false);

        boolean sourceValidAndNotStale = false;

        if (sourceType != null) {
            validateAndCheckStaleSource(viewer, target, sourceType, sourceId, poolType, weddingId, contextResp);
            sourceValidAndNotStale = Boolean.TRUE.equals(contextResp.getValidForActions());
        }

        List<Match> matches = matchRepository.findMatchesBetweenUsers(viewer.getId(), target.getId());
        Optional<Match> activeMatch = matches.stream().filter(m -> m.getStatus() == MatchStatus.ACTIVE).findFirst();
        Optional<Match> blockedMatch = matches.stream().filter(m -> m.getStatus() == MatchStatus.BLOCKED).findFirst();
        Match relevantMatch = activeMatch.orElse(blockedMatch.orElse(null));

        List<OpeningConversation> openings = openingConversationRepository.findOpenConversationsBetweenUsers(viewer.getId(), target.getId(), OpeningConversationStatus.OPEN);
        OpeningConversation relevantOpening = openings.isEmpty() ? null : openings.get(0);

        List<UserAction> outgoingActions = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(viewer.getId(), target.getId());
        UserAction outgoingAction = outgoingActions.isEmpty() ? null : outgoingActions.get(0);

        List<UserAction> incomingActions = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(target.getId(), viewer.getId());
        UserAction incomingAction = incomingActions.isEmpty() ? null : incomingActions.get(0);
        boolean incomingLike = incomingAction != null && incomingAction.getActionType() == ActionType.LIKE;

        boolean hasActiveMatch = activeMatch.isPresent();
        boolean hasOpenOpening = relevantOpening != null;
        
        boolean hasAccess = hasExistingPublicAccess || hasActiveMatch || hasOpenOpening || sourceValidAndNotStale;

        if (!hasAccess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No valid access basis for profile");
        }

        CandidateRelationshipResponse response = new CandidateRelationshipResponse();

        if (outgoingAction != null) {
            switch (outgoingAction.getActionType()) {
                case LIKE: response.setOutgoingAction(CandidateOutgoingAction.LIKE); break;
                case DISLIKE: response.setOutgoingAction(CandidateOutgoingAction.DISLIKE); break;
                case FREEZE: response.setOutgoingAction(CandidateOutgoingAction.FREEZE); break;
            }
        } else {
            response.setOutgoingAction(CandidateOutgoingAction.NONE);
        }

        response.setIncomingLike(incomingLike);

        if (relevantOpening != null) {
            CandidateOpeningSummaryResponse openingSummary = new CandidateOpeningSummaryResponse();
            openingSummary.setConversationId(relevantOpening.getId());
            openingSummary.setDirection(relevantOpening.getOpenerUserId().equals(viewer.getId()) ? CandidateOpeningDirection.SENT : CandidateOpeningDirection.RECEIVED);
            openingSummary.setStatus(relevantOpening.getStatus().name());
            response.setOpening(openingSummary);
        }

        if (relevantMatch != null) {
            CandidateMatchSummaryResponse matchSummary = new CandidateMatchSummaryResponse();
            matchSummary.setMatchId(relevantMatch.getId());
            matchSummary.setStatus(relevantMatch.getStatus().name());
            response.setMatch(matchSummary);
        }

        response.setEffectiveContext(contextResp);

        List<AllowedCandidateAction> allowed = new ArrayList<>();
        allowed.add(AllowedCandidateAction.BLOCK);
        allowed.add(AllowedCandidateAction.REPORT);

        if (activeMatch.isPresent()) {
            allowed.add(AllowedCandidateAction.CHAT_OPEN);
            allowed.add(AllowedCandidateAction.MATCH_DETAILS_OPEN);
            allowed.add(AllowedCandidateAction.MATCH_CANCEL);
        } else if (!blockedMatch.isPresent()) {
            boolean canAction = Boolean.TRUE.equals(contextResp.getValidForActions());
            if (relevantOpening != null) {
                allowed.add(AllowedCandidateAction.OPENING_OPEN);
                if (canAction) {
                    addActionTransitions(outgoingAction != null ? outgoingAction.getActionType() : null, allowed);
                }
            } else {
                if (canAction) {
                    boolean viewerHasPhoto = userPhotoRepository.existsByUserIdAndIsPrimaryTrue(viewer.getId());
                    boolean targetHasPhoto = userPhotoRepository.existsByUserIdAndIsPrimaryTrue(target.getId());
                    if (viewerHasPhoto && targetHasPhoto) {
                        allowed.add(AllowedCandidateAction.OPENING_CREATE);
                    }
                    addActionTransitions(outgoingAction != null ? outgoingAction.getActionType() : null, allowed);
                }
            }
        }

        response.setAllowedActions(allowed);
        return response;
    }

    private void validateAndCheckStaleSource(User viewer, User target, CandidateProfileSourceType sourceType, Long sourceId, PoolType poolType, Long weddingId, CandidateEffectiveContextResponse contextResp) {
        contextResp.setValidForActions(true);

        if (sourceType == CandidateProfileSourceType.NOTIFICATION) {
            if (sourceId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sourceId required for NOTIFICATION");
            UserNotification notif = userNotificationRepository.findByIdAndRecipientUserId(sourceId, viewer.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found or access denied"));
            
            if (!notif.getActorUserId().equals(target.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notification target mismatch");
            }

            if (notif.getType() == NotificationType.LIKE_RECEIVED) {
                Optional<UserAction> action = userActionRepository.findById(notif.getReferenceId());
                if (action.isEmpty() || action.get().getActionType() != ActionType.LIKE) {
                    contextResp.setValidForActions(false);
                } else {
                    contextResp.setPoolType(action.get().getPoolType());
                    contextResp.setWeddingId(action.get().getWeddingId());
                    checkContextStale(viewer, target, action.get().getPoolType(), action.get().getWeddingId(), contextResp);
                }
            } else if (notif.getType() == NotificationType.OPENING_RECEIVED) {
                Optional<OpeningConversation> conv = openingConversationRepository.findById(notif.getReferenceId());
                if (conv.isEmpty() || conv.get().getStatus() != OpeningConversationStatus.OPEN) {
                    contextResp.setValidForActions(false);
                } else {
                    contextResp.setPoolType(conv.get().getPoolType());
                    contextResp.setWeddingId(conv.get().getWeddingId());
                    checkContextStale(viewer, target, conv.get().getPoolType(), conv.get().getWeddingId(), contextResp);
                }
            } else if (notif.getType() == NotificationType.MATCH_CREATED) {
                Optional<Match> match = matchRepository.findById(notif.getReferenceId());
                if (match.isEmpty() || match.get().getStatus() != MatchStatus.ACTIVE) {
                    contextResp.setValidForActions(false);
                } else {
                    contextResp.setPoolType(match.get().getPoolType());
                    contextResp.setWeddingId(match.get().getWeddingId());
                    checkContextStale(viewer, target, match.get().getPoolType(), match.get().getWeddingId(), contextResp);
                }
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported notification type for profile source");
            }
        } else if (sourceType == CandidateProfileSourceType.OPENING) {
            if (sourceId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sourceId required for OPENING");
            OpeningConversation conv = openingConversationRepository.findById(sourceId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Opening not found"));

            boolean isParticipant = (conv.getOpenerUserId().equals(viewer.getId()) && conv.getRecipientUserId().equals(target.getId())) ||
                                    (conv.getOpenerUserId().equals(target.getId()) && conv.getRecipientUserId().equals(viewer.getId()));
            if (!isParticipant) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Opening ownership/target mismatch");
            }

            if (conv.getStatus() != OpeningConversationStatus.OPEN) {
                contextResp.setValidForActions(false);
            } else {
                contextResp.setPoolType(conv.getPoolType());
                contextResp.setWeddingId(conv.getWeddingId());
                checkContextStale(viewer, target, conv.getPoolType(), conv.getWeddingId(), contextResp);
            }
        } else if (sourceType == CandidateProfileSourceType.MATCH) {
            if (sourceId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sourceId required for MATCH");
            Match match = matchRepository.findById(sourceId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

            boolean isParticipant = (match.getUser1Id().equals(viewer.getId()) && match.getUser2Id().equals(target.getId())) ||
                                    (match.getUser1Id().equals(target.getId()) && match.getUser2Id().equals(viewer.getId()));
            if (!isParticipant) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Match ownership/target mismatch");
            }

            if (match.getStatus() != MatchStatus.ACTIVE) {
                contextResp.setValidForActions(false);
            } else {
                contextResp.setPoolType(match.getPoolType());
                contextResp.setWeddingId(match.getWeddingId());
                checkContextStale(viewer, target, match.getPoolType(), match.getWeddingId(), contextResp);
            }
        } else if (sourceType == CandidateProfileSourceType.ACTION_LIST) {
            UserAction action = findAuthenticActionListSource(viewer, target, poolType, weddingId);
            if (action == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Action not found for ACTION_LIST source");
            }
            contextResp.setPoolType(action.getPoolType());
            contextResp.setWeddingId(action.getWeddingId());
            checkContextStale(viewer, target, action.getPoolType(), action.getWeddingId(), contextResp);
        } else if (sourceType == CandidateProfileSourceType.DISCOVER) {
            if (poolType == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "poolType required for DISCOVER");
            checkContextStale(viewer, target, poolType, weddingId, contextResp);
        }
    }

    private void checkContextStale(User viewer, User target, PoolType poolType, Long weddingId, CandidateEffectiveContextResponse contextResp) {
        if (poolType == PoolType.WEDDING) {
            if (weddingId == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId required for WEDDING pool");
            Optional<Wedding> weddingOpt = weddingRepository.findById(weddingId);
            if (weddingOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found");
            }

            Optional<WeddingParticipant> viewerPart = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, viewer.getId());
            if (viewerPart.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Viewer is not a participant in this wedding");
            }

            Optional<WeddingParticipant> targetPart = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, target.getId());
            if (targetPart.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target is not a participant in this wedding");
            }

            if (weddingOpt.get().getStatus() != WeddingStatus.ACTIVE ||
                viewerPart.get().getStatus() != ParticipantStatus.ACTIVE ||
                targetPart.get().getStatus() != ParticipantStatus.ACTIVE) {
                contextResp.setValidForActions(false);
            }
        } else if (poolType == PoolType.GLOBAL) {
            if (weddingId != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId must be null for GLOBAL pool");
            }
            if (viewer.getProfileStatus() != ProfileStatus.FULL || target.getProfileStatus() != ProfileStatus.FULL) {
                contextResp.setValidForActions(false);
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid poolType");
        }
    }

    private void addActionTransitions(ActionType currentAction, List<AllowedCandidateAction> allowed) {
        if (currentAction == null) {
            allowed.add(AllowedCandidateAction.LIKE);
            allowed.add(AllowedCandidateAction.DISLIKE);
            allowed.add(AllowedCandidateAction.FREEZE);
        } else if (currentAction == ActionType.LIKE) {
            allowed.add(AllowedCandidateAction.DISLIKE);
            allowed.add(AllowedCandidateAction.FREEZE);
            allowed.add(AllowedCandidateAction.REMOVE_ACTION);
        } else if (currentAction == ActionType.DISLIKE) {
            allowed.add(AllowedCandidateAction.LIKE);
            allowed.add(AllowedCandidateAction.FREEZE);
            allowed.add(AllowedCandidateAction.REMOVE_ACTION);
        } else if (currentAction == ActionType.FREEZE) {
            allowed.add(AllowedCandidateAction.LIKE);
            allowed.add(AllowedCandidateAction.DISLIKE);
            allowed.add(AllowedCandidateAction.UNFREEZE);
        }
    }

    private UserAction findAuthenticActionListSource(
            User viewer,
            User target,
            PoolType requestedPool,
            Long requestedWeddingId) {
        
        List<UserAction> outgoing = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(viewer.getId(), target.getId());
        for (UserAction action : outgoing) {
            if (matchesContext(action, requestedPool, requestedWeddingId)) {
                return action;
            }
        }
        
        List<UserAction> incoming = userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(target.getId(), viewer.getId());
        for (UserAction action : incoming) {
            if (action.getActionType() == ActionType.LIKE && matchesContext(action, requestedPool, requestedWeddingId)) {
                return action;
            }
        }
        
        return null;
    }

    private boolean matchesContext(UserAction action, PoolType requestedPool, Long requestedWeddingId) {
        if (action.getPoolType() == PoolType.GLOBAL && action.getWeddingId() != null) {
            return false;
        }
        if (action.getPoolType() == PoolType.WEDDING && action.getWeddingId() == null) {
            return false;
        }

        if (requestedPool != null) {
            if (action.getPoolType() != requestedPool) {
                return false;
            }
            if (requestedPool == PoolType.GLOBAL && requestedWeddingId != null) {
                return false;
            }
            if (requestedPool == PoolType.WEDDING && requestedWeddingId == null) {
                return false;
            }
        }

        if (requestedWeddingId != null) {
            if (action.getPoolType() != PoolType.WEDDING || !requestedWeddingId.equals(action.getWeddingId())) {
                return false;
            }
        }

        return true;
    }
}
