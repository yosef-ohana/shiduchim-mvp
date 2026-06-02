package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.enums.PoolType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    Optional<Match> findByUser1IdAndUser2IdAndPoolTypeAndWeddingId(
            Long user1Id,
            Long user2Id,
            PoolType poolType,
            Long weddingId
    );

    List<Match> findByUser1IdOrUser2Id(Long user1Id, Long user2Id);

    List<Match> findByUser1IdAndPoolType(Long user1Id, PoolType poolType);

    List<Match> findByUser2IdAndPoolType(Long user2Id, PoolType poolType);

    long countByWeddingIdAndStatus(Long weddingId, com.shiduchim.backend.enums.MatchStatus status);
}
