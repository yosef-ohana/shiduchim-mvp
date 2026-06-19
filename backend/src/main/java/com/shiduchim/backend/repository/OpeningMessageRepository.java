package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.OpeningMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpeningMessageRepository extends JpaRepository<OpeningMessage, Long> {
    List<OpeningMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    
    OpeningMessage findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);
}
