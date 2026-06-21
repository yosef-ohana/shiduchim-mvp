package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.opening.CreateOpeningMessageRequest;
import com.shiduchim.backend.dto.opening.CreateOpeningReplyRequest;
import com.shiduchim.backend.dto.opening.OpeningConversationDetailsResponse;
import com.shiduchim.backend.dto.opening.OpeningConversationSummaryResponse;
import com.shiduchim.backend.dto.opening.OpeningMessageResponse;
import com.shiduchim.backend.dto.opening.OpeningReplyResponse;
import com.shiduchim.backend.entity.*;
import com.shiduchim.backend.enums.*;
import com.shiduchim.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OpeningMessageService {

    private final OpeningConversationRepository openingConversationRepository;
    private final OpeningMessageRepository openingMessageRepository;
    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final UserBlockService userBlockService;
    private final MatchRepository matchRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingParticipantRepository weddingParticipantRepository;

    public OpeningMessageService(
            OpeningConversationRepository openingConversationRepository,
            OpeningMessageRepository openingMessageRepository,
            UserRepository userRepository,
            UserPhotoRepository userPhotoRepository,
            UserBlockService userBlockService,
            MatchRepository matchRepository,
            ChatMessageRepository chatMessageRepository,
            WeddingRepository weddingRepository,
            WeddingParticipantRepository weddingParticipantRepository) {
        this.openingConversationRepository = openingConversationRepository;
        this.openingMessageRepository = openingMessageRepository;
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.userBlockService = userBlockService;
        this.matchRepository = matchRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.weddingRepository = weddingRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
    }

    // -------------------------------------------------------------------------
    // Batch 5: Send the first (opener) message
    // -------------------------------------------------------------------------

    @Transactional
    public void sendFirstMessage(User currentUser, Long targetUserId, CreateOpeningMessageRequest request) {
        // Validation: current user
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can send opening messages");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked by admin");
        }
        if (currentUser.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send opening message to self");
        }

        // Content validation
        String content = request.getContent() != null ? request.getContent().trim() : "";
        if (content.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot be empty");
        }
        if (content.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot exceed 1000 characters");
        }

        // Validation: target user
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (targetUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target is not a valid user");
        }
        if (Boolean.TRUE.equals(targetUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user is unavailable");
        }
        if (currentUser.getGender() != null && currentUser.getGender() == targetUser.getGender()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send opening message to same gender");
        }

        // User block validation
        if (userBlockService.existsActiveBlockBetween(currentUser.getId(), targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot send message due to an active block");
        }

        // Primary photo validation
        if (!userPhotoRepository.existsByUserIdAndIsPrimaryTrue(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You must have a primary photo");
        }
        if (!userPhotoRepository.existsByUserIdAndIsPrimaryTrue(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user must have a primary photo");
        }

        PoolType poolType = request.getPoolType();
        Long weddingId = request.getWeddingId();

        // Context Eligibility Validation
        if (poolType == PoolType.WEDDING) {
            if (weddingId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId is required for WEDDING pool");
            }
            Wedding wedding = weddingRepository.findById(weddingId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wedding not found"));
            if (wedding.getStatus() != WeddingStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Wedding is not active");
            }
            
            boolean currentActiveParticipant = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, currentUser.getId())
                    .map(p -> p.getStatus() == ParticipantStatus.ACTIVE).orElse(false);
            if (!currentActiveParticipant) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not an active participant in this wedding");
            }

            boolean targetActiveParticipant = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, targetUserId)
                    .map(p -> p.getStatus() == ParticipantStatus.ACTIVE).orElse(false);
            if (!targetActiveParticipant) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user is not an active participant in this wedding");
            }
            // Existing wedding discover/profile eligibility is implicitly satisfied if they are active participants and have a primary photo, based on existing logic.
        } else if (poolType == PoolType.GLOBAL) {
            weddingId = null; // force null for global
            if (currentUser.getProfileStatus() != ProfileStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You need a FULL profile to send messages in the global pool");
            }
            if (targetUser.getProfileStatus() != ProfileStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user does not have a FULL profile");
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pool type");
        }

        // Cross-context active match validation
        if (matchRepository.existsActiveMatchBetweenUsers(currentUser.getId(), targetUserId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An active match already exists between these users in another context");
        }

        // Match validation
        List<Match> existingMatches = matchRepository.findByUser1IdOrUser2Id(currentUser.getId(), currentUser.getId());
        for (Match match : existingMatches) {
            if ((match.getUser1Id().equals(targetUserId) || match.getUser2Id().equals(targetUserId)) &&
                match.getPoolType() == poolType &&
                (weddingId == null ? match.getWeddingId() == null : weddingId.equals(match.getWeddingId()))) {
                if (match.getStatus() == MatchStatus.ACTIVE || match.getStatus() == MatchStatus.BLOCKED) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An active or blocked match already exists in this context");
                }
            }
        }

        // Opening conversation validation
        Optional<OpeningConversation> existingConversation = openingConversationRepository
                .findExistingConversationBetweenUsersInContext(
                        currentUser.getId(), targetUserId, poolType, weddingId, OpeningConversationStatus.OPEN);

        if (existingConversation.isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An open conversation already exists between you and this user in this context");
        }

        // Create
        OpeningConversation conversation = new OpeningConversation();
        conversation.setOpenerUserId(currentUser.getId());
        conversation.setRecipientUserId(targetUserId);
        conversation.setPoolType(poolType);
        conversation.setWeddingId(weddingId);
        conversation.setStatus(OpeningConversationStatus.OPEN);
        conversation.setMatchId(null); // Explicitly null for Batch 5
        
        conversation = openingConversationRepository.save(conversation);

        OpeningMessage message = new OpeningMessage();
        message.setConversationId(conversation.getId());
        message.setSenderUserId(currentUser.getId());
        message.setContent(content);
        
        openingMessageRepository.save(message);
    }

    // -------------------------------------------------------------------------
    // Batch 6: Reply to an existing conversation (recipient) / convert to Match
    // -------------------------------------------------------------------------

    /**
     * Handles the recipient replying to an OPEN opening conversation.
     *
     * <p>First reply: creates one OpeningMessage. No Match, no ChatMessage, no UserAction.
     * <p>Second reply without confirmCreateMatch=true: rejected with a clear validation error.
     * <p>Second reply with confirmCreateMatch=true: atomically creates a Match, copies all
     * OpeningMessages into ChatMessages, adds the confirmed reply as a ChatMessage, and
     * sets OpeningConversation.status = MATCH_CREATED with the new matchId.
     */
    @Transactional
    public OpeningReplyResponse replyToConversation(User currentUser, Long conversationId, CreateOpeningReplyRequest request) {

        // --- Basic caller validation ---
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can reply to opening conversations");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked by admin");
        }

        // --- Content validation ---
        String content = request.getContent() != null ? request.getContent().trim() : "";
        if (content.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot be empty");
        }
        if (content.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content cannot exceed 1000 characters");
        }

        // --- Load conversation ---
        OpeningConversation conversation = openingConversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        // --- Access check: caller must be opener or recipient ---
        Long openerId    = conversation.getOpenerUserId();
        Long recipientId = conversation.getRecipientUserId();
        boolean isOpener    = currentUser.getId().equals(openerId);
        boolean isRecipient = currentUser.getId().equals(recipientId);

        if (!isOpener && !isRecipient) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }

        // --- Opener cannot send another pre-match message ---
        if (isOpener) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Opener cannot send another message before a match is created. Wait for the recipient to reply.");
        }

        // --- Conversation must be OPEN ---
        if (conversation.getStatus() != OpeningConversationStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "This conversation is no longer accepting pre-match replies. Use normal chat instead.");
        }

        // --- Reload other user with fresh state ---
        Long otherUserId = openerId;
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        if (Boolean.TRUE.equals(otherUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "The other user is unavailable");
        }

        // --- UserBlock check ---
        if (userBlockService.existsActiveBlockBetween(currentUser.getId(), otherUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot reply due to an active block between you and the other user");
        }

        // --- Determine how many messages the recipient has already sent ---
        List<OpeningMessage> existingMessages = openingMessageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        long recipientMessageCount = existingMessages.stream()
                .filter(m -> m.getSenderUserId().equals(recipientId))
                .count();

        boolean isFirstReply = (recipientMessageCount == 0);

        if (isFirstReply) {
            // ----------------------------------------------------------------
            // FIRST REPLY: create one OpeningMessage only.
            // No Match, no ChatMessage, no UserAction.
            // ----------------------------------------------------------------
            OpeningMessage reply = new OpeningMessage();
            reply.setConversationId(conversationId);
            reply.setSenderUserId(currentUser.getId());
            reply.setContent(content);
            openingMessageRepository.save(reply);

            OpeningReplyResponse response = new OpeningReplyResponse();
            response.setMatchCreated(false);
            response.setMatchId(null);
            // Signal that the next reply will require explicit confirmation.
            response.setRequiresMatchConfirmation(true);
            response.setMessage("Reply sent. To continue this conversation, you will need to confirm match creation on your next reply.");
            return response;

        } else {
            // ----------------------------------------------------------------
            // SECOND (OR LATER) REPLY:
            // Without confirmCreateMatch=true → reject.
            // With confirmCreateMatch=true → convert to Match.
            // ----------------------------------------------------------------
            if (!Boolean.TRUE.equals(request.getConfirmCreateMatch())) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "Explicit confirmation is required to continue. Set confirmCreateMatch=true to create a match and continue the conversation.");
            }

            // --- Revalidate: no existing ACTIVE or BLOCKED Match in same context ---
            PoolType poolType = conversation.getPoolType();
            Long weddingId   = conversation.getWeddingId();

            Long canonicalUser1 = Math.min(currentUser.getId(), otherUserId);
            Long canonicalUser2 = Math.max(currentUser.getId(), otherUserId);

            Optional<Match> existingActive = matchRepository.findByCanonicalUsersAndContextAndStatus(
                    canonicalUser1, canonicalUser2, poolType, weddingId, MatchStatus.ACTIVE);
            if (existingActive.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A match already exists between you and this user in this context");
            }

            Optional<Match> existingBlocked = matchRepository.findByCanonicalUsersAndContextAndStatus(
                    canonicalUser1, canonicalUser2, poolType, weddingId, MatchStatus.BLOCKED);
            if (existingBlocked.isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A blocked match already exists between you and this user in this context");
            }

            // --- Create the Match ---
            Match match = new Match();
            match.setUser1Id(canonicalUser1);
            match.setUser2Id(canonicalUser2);
            match.setPoolType(poolType);
            match.setWeddingId(weddingId);
            match.setStatus(MatchStatus.ACTIVE);
            match = matchRepository.save(match);
            final Long newMatchId = match.getId();

            // --- Copy all existing OpeningMessages → ChatMessage (chronological) ---
            for (OpeningMessage om : existingMessages) {
                ChatMessage cm = new ChatMessage();
                cm.setMatchId(newMatchId);
                cm.setSenderId(om.getSenderUserId());
                cm.setContent(om.getContent());
                // Preserve original timestamps; ChatMessage.onCreate() only sets sentAt if null.
                cm.setSentAt(om.getCreatedAt());
                cm.setReadByRecipient(false);
                chatMessageRepository.save(cm);
            }

            // --- Add the confirmed reply as a ChatMessage ---
            ChatMessage confirmedReply = new ChatMessage();
            confirmedReply.setMatchId(newMatchId);
            confirmedReply.setSenderId(currentUser.getId());
            confirmedReply.setContent(content);
            // sentAt left null so @PrePersist will set it to now.
            confirmedReply.setReadByRecipient(false);
            chatMessageRepository.save(confirmedReply);

            // --- Update conversation ---
            conversation.setStatus(OpeningConversationStatus.MATCH_CREATED);
            conversation.setMatchId(newMatchId);
            openingConversationRepository.save(conversation);

            OpeningReplyResponse response = new OpeningReplyResponse();
            response.setMatchCreated(true);
            response.setMatchId(newMatchId);
            response.setRequiresMatchConfirmation(false);
            response.setMessage("Match created. You can now continue the conversation in normal chat.");
            return response;
        }
    }

    // -------------------------------------------------------------------------
    // Batch 5: Read endpoints
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<OpeningConversationSummaryResponse> getInbox(User currentUser) {
        if (currentUser.getRole() != UserRole.USER || Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        List<OpeningConversation> conversations = openingConversationRepository
                .findByRecipientUserIdAndStatusOrderByUpdatedAtDesc(currentUser.getId(), OpeningConversationStatus.OPEN);
                
        return conversations.stream()
                .map(conv -> mapToSummary(conv, conv.getOpenerUserId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OpeningConversationSummaryResponse> getSent(User currentUser) {
        if (currentUser.getRole() != UserRole.USER || Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        List<OpeningConversation> conversations = openingConversationRepository
                .findByOpenerUserIdAndStatusOrderByUpdatedAtDesc(currentUser.getId(), OpeningConversationStatus.OPEN);
                
        return conversations.stream()
                .map(conv -> mapToSummary(conv, conv.getRecipientUserId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OpeningConversationDetailsResponse getConversationDetails(User currentUser, Long conversationId) {
        if (currentUser.getRole() != UserRole.USER || Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        OpeningConversation conversation = openingConversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

        if (!conversation.getOpenerUserId().equals(currentUser.getId()) && !conversation.getRecipientUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this conversation");
        }

        Long otherUserId = conversation.getOpenerUserId().equals(currentUser.getId()) 
                ? conversation.getRecipientUserId() : conversation.getOpenerUserId();

        List<OpeningMessage> messages = openingMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());

        // Determine requiresMatchConfirmation:
        // OPEN conversation where recipient has already replied once means next reply needs confirmCreateMatch.
        boolean requiresMatchConfirmation = false;
        if (conversation.getStatus() == OpeningConversationStatus.OPEN) {
            long recipientReplies = messages.stream()
                    .filter(m -> m.getSenderUserId().equals(conversation.getRecipientUserId()))
                    .count();
            requiresMatchConfirmation = (recipientReplies >= 1);
        }

        List<OpeningMessageResponse> messageResponses = messages.stream().map(msg -> {
            OpeningMessageResponse mr = new OpeningMessageResponse();
            mr.setId(msg.getId());
            mr.setSenderUserId(msg.getSenderUserId());
            mr.setContent(msg.getContent());
            mr.setCreatedAt(msg.getCreatedAt());
            return mr;
        }).collect(Collectors.toList());

        OpeningConversationDetailsResponse response = new OpeningConversationDetailsResponse();
        response.setConversationId(conversation.getId());
        response.setOpenerUserId(conversation.getOpenerUserId());
        response.setRecipientUserId(conversation.getRecipientUserId());
        response.setOtherUserId(otherUserId);
        response.setPoolType(conversation.getPoolType());
        response.setWeddingId(conversation.getWeddingId());
        response.setStatus(conversation.getStatus());
        response.setMessages(messageResponses);
        response.setMatchCreated(conversation.getStatus() == OpeningConversationStatus.MATCH_CREATED);
        response.setMatchId(conversation.getMatchId());
        response.setRequiresMatchConfirmation(requiresMatchConfirmation);
        return response;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private OpeningConversationSummaryResponse mapToSummary(OpeningConversation conversation, Long otherUserId) {
        OpeningConversationSummaryResponse response = new OpeningConversationSummaryResponse();
        response.setConversationId(conversation.getId());
        response.setOtherUserId(otherUserId);
        
        userRepository.findById(otherUserId).ifPresent(user -> response.setOtherUserName(user.getFullName()));
        
        response.setPoolType(conversation.getPoolType());
        response.setWeddingId(conversation.getWeddingId());
        response.setStatus(conversation.getStatus());
        response.setCreatedAt(conversation.getCreatedAt());

        OpeningMessage lastMsg = openingMessageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversation.getId());
        if (lastMsg != null) {
            String preview = lastMsg.getContent();
            if (preview.length() > 50) preview = preview.substring(0, 47) + "...";
            response.setLastMessagePreview(preview);
            response.setLastMessageAt(lastMsg.getCreatedAt());
        }
        
        return response;
    }
}
