package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.WeddingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeddingParticipantRepository extends JpaRepository<WeddingParticipant, Long> {

    List<WeddingParticipant> findByWeddingId(Long weddingId);

    Optional<WeddingParticipant> findByWeddingIdAndUserId(Long weddingId, Long userId);

    long countByWeddingIdAndStatus(Long weddingId, com.shiduchim.backend.enums.ParticipantStatus status);
}
