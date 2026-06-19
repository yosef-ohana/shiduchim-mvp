package com.shiduchim.backend.repository;

import com.shiduchim.backend.entity.UserReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserReportRepository extends JpaRepository<UserReport, Long> {
    List<UserReport> findAllByOrderByCreatedAtDesc();
}
