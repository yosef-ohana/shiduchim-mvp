package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.profile.*;
import com.shiduchim.backend.entity.*;
import com.shiduchim.backend.enums.*;
import com.shiduchim.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateRelationshipServiceTest {

    @Mock private MatchRepository matchRepository;
    @Mock private OpeningConversationRepository openingConversationRepository;
    @Mock private UserActionRepository userActionRepository;
    @Mock private UserNotificationRepository userNotificationRepository;
    @Mock private WeddingRepository weddingRepository;
    @Mock private WeddingParticipantRepository weddingParticipantRepository;
    @Mock private UserPhotoRepository userPhotoRepository;

    @InjectMocks
    private CandidateRelationshipService service;

    private User viewer;
    private User target;

    @BeforeEach
    void setUp() {
        viewer = new User();
        viewer.setId(1L);
        viewer.setProfileStatus(ProfileStatus.FULL);

        target = new User();
        target.setId(2L);
        target.setProfileStatus(ProfileStatus.FULL);
    }

    // ==========================================
    // NOTIFICATION Source Matrix
    // ==========================================
    @Test
    void testNotification_ValidLikeReceived() {
        UserNotification notif = createNotification(10L, 1L, 2L, NotificationType.LIKE_RECEIVED, 50L);
        UserAction action = createAction(50L, 2L, 1L, ActionType.LIKE, PoolType.GLOBAL, null);

        when(userNotificationRepository.findByIdAndRecipientUserId(10L, 1L)).thenReturn(Optional.of(notif));
        when(userActionRepository.findById(50L)).thenReturn(Optional.of(action));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();
        mockHasPhotos();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.NOTIFICATION, 10L, null, null, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
        assertEquals(PoolType.GLOBAL, response.getEffectiveContext().getPoolType());
    }

    @Test
    void testNotification_Foreign_RecipientMismatch() {
        // Notification owned by someone else
        when(userNotificationRepository.findByIdAndRecipientUserId(10L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.NOTIFICATION, 10L, null, null, true)
        );
    }

    @Test
    void testNotification_ActorTargetMismatch() {
        UserNotification notif = createNotification(10L, 1L, 99L, NotificationType.LIKE_RECEIVED, 50L);
        when(userNotificationRepository.findByIdAndRecipientUserId(10L, 1L)).thenReturn(Optional.of(notif));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.NOTIFICATION, 10L, null, null, true)
        );
    }

    @Test
    void testNotification_TypeReferenceMismatch() {
        UserNotification notif = createNotification(10L, 1L, 2L, NotificationType.USER_REPORT_STATUS_CHANGED, 50L);
        when(userNotificationRepository.findByIdAndRecipientUserId(10L, 1L)).thenReturn(Optional.of(notif));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.NOTIFICATION, 10L, null, null, true)
        );
    }

    @Test
    void testNotification_ReferencedUserActionMismatch() {
        UserNotification notif = createNotification(10L, 1L, 2L, NotificationType.LIKE_RECEIVED, 50L);
        UserAction action = createAction(50L, 2L, 1L, ActionType.FREEZE, PoolType.GLOBAL, null); // Not LIKE

        when(userNotificationRepository.findByIdAndRecipientUserId(10L, 1L)).thenReturn(Optional.of(notif));
        when(userActionRepository.findById(50L)).thenReturn(Optional.of(action));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.NOTIFICATION, 10L, null, null, true); // Has independent access

        assertFalse(response.getEffectiveContext().getValidForActions());
    }

    @Test
    void testNotification_AuthenticStale_NoIndependentAccess() {
        UserNotification notif = createNotification(10L, 1L, 2L, NotificationType.LIKE_RECEIVED, 50L);
        UserAction action = createAction(50L, 2L, 1L, ActionType.FREEZE, PoolType.GLOBAL, null); // Stale

        when(userNotificationRepository.findByIdAndRecipientUserId(10L, 1L)).thenReturn(Optional.of(notif));
        when(userActionRepository.findById(50L)).thenReturn(Optional.of(action));
        mockNoMatches();
        mockNoOpenings();

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.NOTIFICATION, 10L, null, null, false)
        );
    }

    // ==========================================
    // OPENING Source Matrix
    // ==========================================
    @Test
    void testOpening_ValidOpen() {
        OpeningConversation conv = createOpening(20L, 1L, 2L, OpeningConversationStatus.OPEN);
        when(openingConversationRepository.findById(20L)).thenReturn(Optional.of(conv));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.OPENING, 20L, null, null, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
    }

    @Test
    void testOpening_Foreign_ViewerNotParticipant() {
        OpeningConversation conv = createOpening(20L, 98L, 99L, OpeningConversationStatus.OPEN);
        when(openingConversationRepository.findById(20L)).thenReturn(Optional.of(conv));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.OPENING, 20L, null, null, true)
        );
    }

    @Test
    void testOpening_TargetMismatch() {
        OpeningConversation conv = createOpening(20L, 1L, 99L, OpeningConversationStatus.OPEN); // Viewer is participant, target is not
        when(openingConversationRepository.findById(20L)).thenReturn(Optional.of(conv));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.OPENING, 20L, null, null, true)
        );
    }

    @Test
    void testOpening_Stale_WithIndependentAccess() {
        OpeningConversation conv = createOpening(20L, 1L, 2L, OpeningConversationStatus.MATCH_CREATED); // Stale
        when(openingConversationRepository.findById(20L)).thenReturn(Optional.of(conv));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.OPENING, 20L, null, null, true);

        assertFalse(response.getEffectiveContext().getValidForActions());
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.OPENING_CREATE));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.LIKE));
    }

    @Test
    void testOpening_Stale_NoIndependentAccess() {
        OpeningConversation conv = createOpening(20L, 1L, 2L, OpeningConversationStatus.MATCH_CREATED); // Stale
        when(openingConversationRepository.findById(20L)).thenReturn(Optional.of(conv));
        mockNoMatches();
        mockNoOpenings();

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.OPENING, 20L, null, null, false)
        );
    }

    // ==========================================
    // MATCH Source Matrix
    // ==========================================
    @Test
    void testMatch_ValidActive() {
        Match match = createMatch(30L, 1L, 2L, MatchStatus.ACTIVE);
        when(matchRepository.findById(30L)).thenReturn(Optional.of(match));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.MATCH, 30L, null, null, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
    }

    @Test
    void testMatch_SymmetricParticipantOrder() {
        Match match = createMatch(30L, 2L, 1L, MatchStatus.ACTIVE); // Reverse order
        when(matchRepository.findById(30L)).thenReturn(Optional.of(match));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.MATCH, 30L, null, null, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
    }

    @Test
    void testMatch_Foreign() {
        Match match = createMatch(30L, 98L, 99L, MatchStatus.ACTIVE);
        when(matchRepository.findById(30L)).thenReturn(Optional.of(match));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.MATCH, 30L, null, null, true)
        );
    }

    @Test
    void testMatch_TargetMismatch() {
        Match match = createMatch(30L, 1L, 99L, MatchStatus.ACTIVE);
        when(matchRepository.findById(30L)).thenReturn(Optional.of(match));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.MATCH, 30L, null, null, true)
        );
    }

    @Test
    void testMatch_BlockedSource_WithIndependentAccess() {
        Match match = createMatch(30L, 1L, 2L, MatchStatus.BLOCKED); // Stale for capabilities
        when(matchRepository.findById(30L)).thenReturn(Optional.of(match));
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(List.of(match));
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.MATCH, 30L, null, null, true);

        assertFalse(response.getEffectiveContext().getValidForActions());
    }

    @Test
    void testMatch_BlockedSource_NoIndependentAccess() {
        Match match = createMatch(30L, 1L, 2L, MatchStatus.BLOCKED);
        when(matchRepository.findById(30L)).thenReturn(Optional.of(match));
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(List.of(match));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.MATCH, 30L, null, null, false)
        );
    }

    // ==========================================
    // DISCOVER / ACTION_LIST Context Matrix
    // ==========================================
    @Test
    void testDiscover_ValidGlobal() {
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();
        mockHasPhotos();
        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.GLOBAL, null, false);
        assertTrue(response.getEffectiveContext().getValidForActions());
    }

    @Test
    void testDiscover_ValidWedding() {
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();
        mockHasPhotos();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.WEDDING, 100L, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
    }

    @ParameterizedTest
    @EnumSource(value = WeddingStatus.class, names = {"CLOSED", "CANCELLED", "DELETED"})
    void testDiscover_InactiveWedding(WeddingStatus status) {
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(status)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.WEDDING, 100L, true);

        assertFalse(response.getEffectiveContext().getValidForActions());
    }

    @Test
    void testDiscover_ForgedWeddingId() {
        when(weddingRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.WEDDING, 100L, true)
        );
    }

    @Test
    void testDiscover_ViewerNotActiveParticipant() {
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.WEDDING, 100L, true)
        );
    }

    @Test
    void testDiscover_TargetNotActiveParticipant() {
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.WEDDING, 100L, true)
        );
    }

    // ==========================================
    // ACTION_LIST Tests (Incoming & Context)
    // ==========================================
    @Test
    void testActionList_NoRealAction() {
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, null, null, true)
        );
    }

    @ParameterizedTest
    @EnumSource(value = ActionType.class)
    void testActionList_OutgoingAction_Authenticates(ActionType type) {
        UserAction action = createAction(50L, 1L, 2L, type, PoolType.GLOBAL, null);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(action));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());
        mockNoMatches();
        mockNoOpenings();
        mockHasPhotos();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.GLOBAL, null, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
        assertEquals(PoolType.GLOBAL, response.getEffectiveContext().getPoolType());
        if (type == ActionType.LIKE) {
            assertEquals(CandidateOutgoingAction.LIKE, response.getOutgoingAction());
        }
    }

    @Test
    void testActionList_IncomingLike_Authenticates() {
        UserAction incomingLikeAction = createAction(50L, 2L, 1L, ActionType.LIKE, PoolType.GLOBAL, null);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(incomingLikeAction));
        mockNoMatches();
        mockNoOpenings();
        mockHasPhotos();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.GLOBAL, null, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
        assertEquals(PoolType.GLOBAL, response.getEffectiveContext().getPoolType());
        assertTrue(response.getIncomingLike());
    }

    @ParameterizedTest
    @EnumSource(value = ActionType.class, names = {"DISLIKE", "FREEZE"})
    void testActionList_IncomingDislikeOrFreeze_DoesNotAuthenticate(ActionType type) {
        UserAction incomingAction = createAction(50L, 2L, 1L, type, PoolType.GLOBAL, null);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(incomingAction));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.GLOBAL, null, false)
        );
    }

    @Test
    void testActionList_UnrelatedAction_DoesNotAuthenticate() {
        // Actor is target, recipient is someone else (not viewer)
        UserAction unrelated = createAction(50L, 2L, 99L, ActionType.LIKE, PoolType.GLOBAL, null);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.GLOBAL, null, false)
        );
    }

    @Test
    void testActionList_ContextMatching_OutgoingSelected() {
        UserAction globalAction = createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.GLOBAL, null);
        UserAction weddingAction = createAction(60L, 1L, 2L, ActionType.DISLIKE, PoolType.WEDDING, 100L);

        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(weddingAction, globalAction));
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        
        mockNoMatches();
        mockNoOpenings();
        mockHasPhotos();

        // Query for WEDDING 100L should return the wedding action
        CandidateRelationshipResponse respWedding = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, false);
        assertEquals(PoolType.WEDDING, respWedding.getEffectiveContext().getPoolType());
        assertEquals(100L, respWedding.getEffectiveContext().getWeddingId());

        // Query for GLOBAL should return the global action
        CandidateRelationshipResponse respGlobal = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.GLOBAL, null, false);
        assertEquals(PoolType.GLOBAL, respGlobal.getEffectiveContext().getPoolType());
    }

    @Test
    void testActionList_ContextMatching_IncomingSelectedWhenOutgoingMismatch() {
        UserAction globalAction = createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.GLOBAL, null); // Outgoing GLOBAL
        UserAction incomingWeddingLike = createAction(60L, 2L, 1L, ActionType.LIKE, PoolType.WEDDING, 100L); // Incoming WEDDING LIKE

        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(globalAction));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(incomingWeddingLike));
        
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        
        mockNoMatches();
        mockNoOpenings();
        mockHasPhotos();

        // Query for WEDDING 100L should select the incoming wedding like
        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, false);
        assertEquals(PoolType.WEDDING, response.getEffectiveContext().getPoolType());
        assertEquals(100L, response.getEffectiveContext().getWeddingId());
    }

    @Test
    void testActionList_ContextMismatch_PoolTypeRejected() {
        UserAction globalAction = createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.GLOBAL, null);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(globalAction));

        // Query for WEDDING 100L but we only have a GLOBAL action
        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, false)
        );
    }

    @Test
    void testActionList_ContextMismatch_WeddingIdRejected() {
        UserAction weddingAction = createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.WEDDING, 200L);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(weddingAction));

        // Query for WEDDING 100L but action is in Wedding 200
        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, false)
        );
    }

    @Test
    void testActionList_ContextMismatch_GlobalDoesNotAcceptWeddingAction() {
        UserAction weddingAction = createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.WEDDING, 100L);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(weddingAction));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.GLOBAL, null, false)
        );
    }

    @Test
    void testActionList_ContextMismatch_WeddingDoesNotAcceptGlobalAction() {
        UserAction globalAction = createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.GLOBAL, null);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(globalAction));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, false)
        );
    }

    @Test
    void testActionList_DeterministicSelection_OutgoingPreferred() {
        UserAction outgoingLike = createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.GLOBAL, null);
        UserAction incomingLike = createAction(60L, 2L, 1L, ActionType.LIKE, PoolType.GLOBAL, null);

        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(outgoingLike));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(incomingLike));
        mockNoMatches();
        mockNoOpenings();
        mockHasPhotos();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.GLOBAL, null, false);

        // Outgoing action should be preferred (so outgoingAction is LIKE, and incomingLike is true because target also liked viewer)
        assertEquals(CandidateOutgoingAction.LIKE, response.getOutgoingAction());
        assertTrue(response.getIncomingLike());
    }

    @Test
    void testActionList_IncomingLike_ActiveWeddingValid() {
        UserAction incomingLike = createAction(50L, 2L, 1L, ActionType.LIKE, PoolType.WEDDING, 100L);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(incomingLike));
        
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        mockNoMatches();
        mockNoOpenings();
        mockHasPhotos();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, false);

        assertTrue(response.getEffectiveContext().getValidForActions());
    }

    @ParameterizedTest
    @EnumSource(value = WeddingStatus.class, names = {"CLOSED", "CANCELLED", "DELETED"})
    void testActionList_IncomingLike_InactiveWedding(WeddingStatus status) {
        UserAction incomingLike = createAction(50L, 2L, 1L, ActionType.LIKE, PoolType.WEDDING, 100L);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(incomingLike));
        
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(status)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        mockNoMatches();
        mockNoOpenings();

        // Stale with independent access
        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, true);

        assertFalse(response.getEffectiveContext().getValidForActions());
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.LIKE));
    }

    @Test
    void testActionList_IncomingLike_Stale_NoIndependentAccess() {
        UserAction incomingLike = createAction(50L, 2L, 1L, ActionType.LIKE, PoolType.WEDDING, 100L);
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(incomingLike));
        
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.CLOSED)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        mockNoMatches();
        mockNoOpenings();

        // Stale without independent access -> should reject
        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, CandidateProfileSourceType.ACTION_LIST, null, PoolType.WEDDING, 100L, false)
        );
    }


    @Test
    void testDiscover_NoAutomaticFallbackToGlobal() {
        when(weddingRepository.findById(100L)).thenReturn(Optional.of(createWedding(WeddingStatus.CLOSED))); // Stale
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 1L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        when(weddingParticipantRepository.findByWeddingIdAndUserId(100L, 2L)).thenReturn(Optional.of(createParticipant(ParticipantStatus.ACTIVE)));
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(
                viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.WEDDING, 100L, true);

        assertFalse(response.getEffectiveContext().getValidForActions());
        // Does not fall back to Global pool even though viewer and target are FULL
        assertEquals(PoolType.WEDDING, response.getEffectiveContext().getPoolType());
    }

    // ==========================================
    // Precedence and Capability Matrix
    // ==========================================
    @Test
    void testPrecedence_NoRelationship() {
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertEquals(CandidateOutgoingAction.NONE, response.getOutgoingAction());
        assertFalse(response.getIncomingLike());
        assertNull(response.getOpening());
        assertNull(response.getMatch());
    }

    @Test
    void testPrecedence_IncomingLike() {
        mockNoMatches();
        mockNoOpenings();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(createAction(50L, 2L, 1L, ActionType.LIKE, PoolType.GLOBAL, null)));

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertTrue(response.getIncomingLike());
    }

    @Test
    void testPrecedence_IncomingDislike_Hidden() {
        mockNoMatches();
        mockNoOpenings();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of(createAction(50L, 2L, 1L, ActionType.DISLIKE, PoolType.GLOBAL, null)));

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertFalse(response.getIncomingLike());
    }

    @ParameterizedTest
    @EnumSource(value = ActionType.class, names = {"LIKE", "DISLIKE", "FREEZE"})
    void testPrecedence_OutgoingActions(ActionType type) {
        mockNoMatches();
        mockNoOpenings();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(createAction(50L, 1L, 2L, type, PoolType.GLOBAL, null)));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertEquals(type.name(), response.getOutgoingAction().name());
    }

    @Test
    void testPrecedence_OpeningSent() {
        mockNoMatches();
        OpeningConversation conv = createOpening(20L, 1L, 2L, OpeningConversationStatus.OPEN);
        when(openingConversationRepository.findOpenConversationsBetweenUsers(1L, 2L, OpeningConversationStatus.OPEN)).thenReturn(List.of(conv));
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertEquals(CandidateOpeningDirection.SENT, response.getOpening().getDirection());
    }

    @Test
    void testPrecedence_OpeningReceived() {
        mockNoMatches();
        OpeningConversation conv = createOpening(20L, 2L, 1L, OpeningConversationStatus.OPEN);
        when(openingConversationRepository.findOpenConversationsBetweenUsers(1L, 2L, OpeningConversationStatus.OPEN)).thenReturn(List.of(conv));
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertEquals(CandidateOpeningDirection.RECEIVED, response.getOpening().getDirection());
    }

    @Test
    void testPrecedence_ActionAndOpeningOverlap() {
        mockNoMatches();
        OpeningConversation conv = createOpening(20L, 1L, 2L, OpeningConversationStatus.OPEN);
        when(openingConversationRepository.findOpenConversationsBetweenUsers(1L, 2L, OpeningConversationStatus.OPEN)).thenReturn(List.of(conv));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.GLOBAL, null)));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertNotNull(response.getOpening());
        assertEquals(CandidateOutgoingAction.LIKE, response.getOutgoingAction());
        assertTrue(response.getAllowedActions().contains(AllowedCandidateAction.OPENING_OPEN));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.OPENING_CREATE));
    }

    @Test
    void testCapabilities_ActiveMatchExact() {
        Match match = createMatch(30L, 1L, 2L, MatchStatus.ACTIVE);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(List.of(match));
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, false); // Match gives access

        Set<AllowedCandidateAction> expected = Set.of(
                AllowedCandidateAction.CHAT_OPEN,
                AllowedCandidateAction.MATCH_DETAILS_OPEN,
                AllowedCandidateAction.MATCH_CANCEL,
                AllowedCandidateAction.BLOCK,
                AllowedCandidateAction.REPORT
        );
        assertEquals(expected, Set.copyOf(response.getAllowedActions()));
    }

    @Test
    void testCapabilities_BlockedMatchAloneGrantsNoAccess() {
        Match match = createMatch(30L, 1L, 2L, MatchStatus.BLOCKED);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(List.of(match));

        assertThrows(ResponseStatusException.class, () ->
            service.getRelationship(viewer, target, null, null, null, null, false)
        );
    }

    @Test
    void testCapabilities_BlockedMatchRestrictions() {
        Match match = createMatch(30L, 1L, 2L, MatchStatus.BLOCKED);
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(List.of(match));
        mockNoOpenings();
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        Set<AllowedCandidateAction> expected = Set.of(
                AllowedCandidateAction.BLOCK,
                AllowedCandidateAction.REPORT
        );
        assertEquals(expected, Set.copyOf(response.getAllowedActions()));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.MATCH_CANCEL));
    }

    @Test
    void testCapabilities_OpenOpeningPreventsCreation() {
        mockNoMatches();
        OpeningConversation conv = createOpening(20L, 1L, 2L, OpeningConversationStatus.OPEN);
        when(openingConversationRepository.findOpenConversationsBetweenUsers(1L, 2L, OpeningConversationStatus.OPEN)).thenReturn(List.of(conv));
        mockNoActions();

        CandidateRelationshipResponse response = service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.GLOBAL, null, true);

        assertTrue(response.getAllowedActions().contains(AllowedCandidateAction.OPENING_OPEN));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.OPENING_CREATE));
    }

    @Test
    void testCapabilities_StaleContextNoActions() {
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();
        
        CandidateRelationshipResponse response = service.getRelationship(viewer, target, null, null, null, null, true);

        assertFalse(response.getEffectiveContext().getValidForActions());
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.LIKE));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.OPENING_CREATE));
    }

    // ==========================================
    // Mutation Parity
    // ==========================================
    @Test
    void testMutationParity_NoneTransitions() {
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();
        mockHasPhotos();
        
        CandidateRelationshipResponse response = service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.GLOBAL, null, true);
        
        assertTrue(response.getAllowedActions().containsAll(Set.of(AllowedCandidateAction.LIKE, AllowedCandidateAction.DISLIKE, AllowedCandidateAction.FREEZE, AllowedCandidateAction.OPENING_CREATE)));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.REMOVE_ACTION));
    }

    @Test
    void testMutationParity_LikeTransitions() {
        mockNoMatches();
        mockNoOpenings();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(createAction(50L, 1L, 2L, ActionType.LIKE, PoolType.GLOBAL, null)));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());
        mockHasPhotos();
        
        CandidateRelationshipResponse response = service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.GLOBAL, null, true);
        
        assertTrue(response.getAllowedActions().containsAll(Set.of(AllowedCandidateAction.DISLIKE, AllowedCandidateAction.FREEZE, AllowedCandidateAction.REMOVE_ACTION, AllowedCandidateAction.OPENING_CREATE)));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.LIKE));
    }

    @Test
    void testMutationParity_DislikeTransitions() {
        mockNoMatches();
        mockNoOpenings();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(createAction(50L, 1L, 2L, ActionType.DISLIKE, PoolType.GLOBAL, null)));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());
        mockHasPhotos();
        
        CandidateRelationshipResponse response = service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.GLOBAL, null, true);
        
        assertTrue(response.getAllowedActions().containsAll(Set.of(AllowedCandidateAction.LIKE, AllowedCandidateAction.FREEZE, AllowedCandidateAction.REMOVE_ACTION, AllowedCandidateAction.OPENING_CREATE)));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.DISLIKE));
    }

    @Test
    void testMutationParity_FreezeTransitions() {
        mockNoMatches();
        mockNoOpenings();
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of(createAction(50L, 1L, 2L, ActionType.FREEZE, PoolType.GLOBAL, null)));
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());
        mockHasPhotos();
        
        CandidateRelationshipResponse response = service.getRelationship(viewer, target, CandidateProfileSourceType.DISCOVER, null, PoolType.GLOBAL, null, true);
        
        assertTrue(response.getAllowedActions().containsAll(Set.of(AllowedCandidateAction.LIKE, AllowedCandidateAction.DISLIKE, AllowedCandidateAction.UNFREEZE, AllowedCandidateAction.OPENING_CREATE)));
        assertFalse(response.getAllowedActions().contains(AllowedCandidateAction.FREEZE));
    }
    
    @Test
    void testReadOnlyBehavior() {
        mockNoMatches();
        mockNoOpenings();
        mockNoActions();

        service.getRelationship(viewer, target, null, null, null, null, true);

        // Verification of read-only nature: No save, delete, or mutating methods are called on ANY repo
        verify(userActionRepository, never()).save(any());
        verify(matchRepository, never()).save(any());
        verify(openingConversationRepository, never()).save(any());
        verify(userNotificationRepository, never()).save(any());
        verify(weddingParticipantRepository, never()).save(any());
        verify(weddingRepository, never()).save(any());
        
        verify(userActionRepository, never()).delete(any());
        verify(matchRepository, never()).delete(any());
        verify(openingConversationRepository, never()).delete(any());
        verify(userNotificationRepository, never()).delete(any());
        verify(weddingParticipantRepository, never()).delete(any());
        verify(weddingRepository, never()).delete(any());
    }

    // ==========================================
    // Helpers
    // ==========================================

    private void mockNoMatches() {
        when(matchRepository.findMatchesBetweenUsers(1L, 2L)).thenReturn(List.of());
    }

    private void mockNoOpenings() {
        when(openingConversationRepository.findOpenConversationsBetweenUsers(1L, 2L, OpeningConversationStatus.OPEN)).thenReturn(List.of());
    }

    private void mockNoActions() {
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(1L, 2L)).thenReturn(List.of());
        when(userActionRepository.findByActorUserIdAndTargetUserIdOrderByUpdatedAtDesc(2L, 1L)).thenReturn(List.of());
    }

    private void mockHasPhotos() {
        lenient().when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(1L)).thenReturn(true);
        lenient().when(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(2L)).thenReturn(true);
    }

    private UserNotification createNotification(Long id, Long recipientId, Long actorId, NotificationType type, Long refId) {
        UserNotification notif = new UserNotification();
        notif.setId(id);
        notif.setRecipientUserId(recipientId);
        notif.setActorUserId(actorId);
        notif.setType(type);
        notif.setReferenceId(refId);
        return notif;
    }

    private UserAction createAction(Long id, Long actorId, Long targetId, ActionType type, PoolType pool, Long weddingId) {
        UserAction action = new UserAction();
        action.setId(id);
        action.setActorUserId(actorId);
        action.setTargetUserId(targetId);
        action.setActionType(type);
        action.setPoolType(pool);
        action.setWeddingId(weddingId);
        return action;
    }

    private OpeningConversation createOpening(Long id, Long openerId, Long recipientId, OpeningConversationStatus status) {
        OpeningConversation conv = new OpeningConversation();
        conv.setId(id);
        conv.setOpenerUserId(openerId);
        conv.setRecipientUserId(recipientId);
        conv.setStatus(status);
        conv.setPoolType(PoolType.GLOBAL);
        return conv;
    }

    private Match createMatch(Long id, Long u1, Long u2, MatchStatus status) {
        Match match = new Match();
        match.setId(id);
        match.setUser1Id(u1);
        match.setUser2Id(u2);
        match.setStatus(status);
        match.setPoolType(PoolType.GLOBAL);
        return match;
    }

    private Wedding createWedding(WeddingStatus status) {
        Wedding w = new Wedding();
        w.setStatus(status);
        return w;
    }

    private WeddingParticipant createParticipant(ParticipantStatus status) {
        WeddingParticipant wp = new WeddingParticipant();
        wp.setStatus(status);
        return wp;
    }
}
