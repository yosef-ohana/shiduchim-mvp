package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.WeddingInvite;
import com.shiduchim.backend.enums.WeddingInviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeddingInviteRepository extends JpaRepository<WeddingInvite, Long> {
    List<WeddingInvite> findByWeddingId(Long weddingId);
    Optional<WeddingInvite> findByWeddingIdAndEmailAndStatus(Long weddingId, String email, WeddingInviteStatus status);
}
