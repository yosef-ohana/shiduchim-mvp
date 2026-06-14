package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByMatchId(Long matchId);

    List<ChatMessage> findByMatchIdOrderBySentAtAsc(Long matchId);

    Optional<ChatMessage> findTopByMatchIdOrderBySentAtDesc(Long matchId);

    List<ChatMessage> findByMatchIdAndSenderIdNotAndReadByRecipientFalse(Long matchId, Long senderId);

    int countByMatchIdAndSenderIdNotAndReadByRecipientFalse(Long matchId, Long senderId);
}
