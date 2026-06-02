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

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(wp1) > 0 FROM WeddingParticipant wp1 " +
            "JOIN WeddingParticipant wp2 ON wp1.weddingId = wp2.weddingId " +
            "JOIN Wedding w ON wp1.weddingId = w.id " +
            "WHERE wp1.userId = :userId1 AND wp2.userId = :userId2 " +
            "AND wp1.status = 'ACTIVE' AND wp2.status = 'ACTIVE' " +
            "AND w.status = 'ACTIVE'")
    boolean existsSharedActiveWedding(@org.springframework.data.repository.query.Param("userId1") Long userId1,
                                      @org.springframework.data.repository.query.Param("userId2") Long userId2);
}
