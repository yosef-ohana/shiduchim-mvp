package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.ProductFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductFeedbackRepository extends JpaRepository<ProductFeedback, Long> {
    List<ProductFeedback> findAllByOrderByCreatedAtDesc();
}
