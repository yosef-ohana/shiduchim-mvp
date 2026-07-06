package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.Wedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeddingRepository extends JpaRepository<Wedding, Long> {

    Optional<Wedding> findByAccessCode(String accessCode);

    boolean existsByAccessCode(String accessCode);

    java.util.List<Wedding> findByOwnerUserId(Long ownerUserId);

    long countByStatus(com.shiduchim.backend.enums.WeddingStatus status);

    java.util.List<Wedding> findByOwnerUserIdAndStatusNotOrderByWeddingDateAscIdAsc(Long ownerUserId, com.shiduchim.backend.enums.WeddingStatus status);
}
