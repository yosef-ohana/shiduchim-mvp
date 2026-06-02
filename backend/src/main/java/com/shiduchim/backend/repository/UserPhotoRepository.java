package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.UserPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPhotoRepository extends JpaRepository<UserPhoto, Long> {

    List<UserPhoto> findByUserId(Long userId);

    List<UserPhoto> findByUserIdOrderByOrderIndexAscCreatedAtAsc(Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndIsPrimaryTrue(Long userId);

    Optional<UserPhoto> findByIdAndUserId(Long id, Long userId);
}

