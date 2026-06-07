package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.chat.ChatMessageRequest;
import com.shiduchim.backend.dto.chat.ChatMessageResponse;
import com.shiduchim.backend.dto.chat.ChatMessagesResponse;
import com.shiduchim.backend.entity.ChatMessage;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.dto.chat.ConversationResponse;
import com.shiduchim.backend.repository.ChatMessageRepository;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.entity.UserPhoto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;

    public ChatService(ChatMessageRepository chatMessageRepository, MatchRepository matchRepository, UserRepository userRepository, UserPhotoRepository userPhotoRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
    }

    public ChatMessagesResponse getMessages(User currentUser, Long matchId) {
        validateChatAccess(currentUser, matchId);

        List<ChatMessage> messages = chatMessageRepository.findByMatchIdOrderBySentAtAsc(matchId);
        List<ChatMessageResponse> messageResponses = messages.stream()
                .map(msg -> new ChatMessageResponse(msg.getId(), msg.getMatchId(), msg.getSenderId(), msg.getContent(), msg.getSentAt()))
                .collect(Collectors.toList());

        return new ChatMessagesResponse(matchId, messageResponses);
    }

    public List<ConversationResponse> getConversations(User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User must have USER role");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked");
        }

        List<Match> activeMatches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.ACTIVE);

        List<java.util.Map.Entry<ConversationResponse, java.time.LocalDateTime>> conversations = activeMatches.stream().map(match -> {
            Long otherUserId = match.getUser1Id().equals(currentUser.getId()) ? match.getUser2Id() : match.getUser1Id();
            User otherUser = userRepository.findById(otherUserId).orElse(null);
            
            if (otherUser == null || Boolean.TRUE.equals(otherUser.getAdminBlocked())) {
                return null;
            }

            String otherUserPhotoUrl = userPhotoRepository.findByUserIdAndIsPrimaryTrue(otherUserId)
                    .map(UserPhoto::getImageUrl)
                    .orElse(null);

            ChatMessage latestMessage = chatMessageRepository.findTopByMatchIdOrderBySentAtDesc(match.getId()).orElse(null);
            
            String lastMessagePreview = null;
            java.time.LocalDateTime lastMessageAt = null;

            if (latestMessage != null) {
                lastMessagePreview = latestMessage.getContent();
                lastMessageAt = latestMessage.getSentAt();
            }

            ConversationResponse response = new ConversationResponse(
                    match.getId(),
                    otherUserId,
                    otherUser.getFullName(),
                    otherUserPhotoUrl,
                    lastMessagePreview,
                    lastMessageAt,
                    match.getPoolType(),
                    match.getWeddingId(),
                    match.getStatus()
            );
            
            return new java.util.AbstractMap.SimpleEntry<>(response, match.getCreatedAt());
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());

        conversations.sort((e1, e2) -> {
            java.time.LocalDateTime t1 = e1.getKey().getLastMessageAt() != null ? e1.getKey().getLastMessageAt() : e1.getValue();
            java.time.LocalDateTime t2 = e2.getKey().getLastMessageAt() != null ? e2.getKey().getLastMessageAt() : e2.getValue();

            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            return t2.compareTo(t1); // Descending
        });

        return conversations.stream().map(java.util.Map.Entry::getKey).collect(Collectors.toList());
    }

    public ChatMessageResponse sendMessage(User currentUser, Long matchId, ChatMessageRequest request) {
        validateChatAccess(currentUser, matchId);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMatchId(matchId);
        chatMessage.setSenderId(currentUser.getId());
        chatMessage.setContent(request.getContent());

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        return new ChatMessageResponse(
                savedMessage.getId(),
                savedMessage.getMatchId(),
                savedMessage.getSenderId(),
                savedMessage.getContent(),
                savedMessage.getSentAt()
        );
    }

    private void validateChatAccess(User currentUser, Long matchId) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User must have USER role");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked");
        }

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        if (!match.getUser1Id().equals(currentUser.getId()) && !match.getUser2Id().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a party to this match");
        }

        if (match.getStatus() == MatchStatus.BLOCKED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found or is blocked");
        }

        Long otherUserId = match.getUser1Id().equals(currentUser.getId()) ? match.getUser2Id() : match.getUser1Id();
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        if (Boolean.TRUE.equals(otherUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found");
        }
    }
}
