package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.PoolType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @org.springframework.data.jpa.repository.Query("SELECT m FROM Match m WHERE (m.user1Id = :userId OR m.user2Id = :userId) AND m.status = :status")
    List<Match> findByUserIdAndStatus(@org.springframework.data.repository.query.Param("userId") Long userId, @org.springframework.data.repository.query.Param("status") com.shiduchim.backend.enums.MatchStatus status);

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Match m " +
           "WHERE m.status = com.shiduchim.backend.enums.MatchStatus.ACTIVE " +
           "AND ((m.user1Id = :userAId AND m.user2Id = :userBId) OR (m.user1Id = :userBId AND m.user2Id = :userAId))")
    boolean existsActiveMatchBetweenUsers(@Param("userAId") Long userAId, @Param("userBId") Long userBId);

    /**
     * Find a match between two users (in canonical user1/user2 order) in a given pool/wedding context,
     * filtered by status. Used by OpeningMessageService during conversion to detect duplicate/blocked matches.
     */
    @Query("SELECT m FROM Match m WHERE m.user1Id = :user1Id AND m.user2Id = :user2Id " +
           "AND m.poolType = :poolType " +
           "AND ((m.weddingId IS NULL AND :weddingId IS NULL) OR m.weddingId = :weddingId) " +
           "AND m.status = :status")
    Optional<Match> findByCanonicalUsersAndContextAndStatus(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id,
            @Param("poolType") PoolType poolType,
            @Param("weddingId") Long weddingId,
            @Param("status") MatchStatus status
    );
}
