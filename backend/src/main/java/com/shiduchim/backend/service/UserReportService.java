package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.report.CreateUserReportRequest;
import com.shiduchim.backend.dto.report.UserReportDetailsResponse;
import com.shiduchim.backend.dto.report.UserReportSummaryResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserReport;
import com.shiduchim.backend.enums.ReportStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserReportRepository;
import com.shiduchim.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserReportService {

    private final UserReportRepository userReportRepository;
    private final UserRepository userRepository;

    public UserReportService(UserReportRepository userReportRepository, UserRepository userRepository) {
        this.userReportRepository = userReportRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createReport(User currentUser, Long reportedUserId, CreateUserReportRequest request) {
        if (!currentUser.getRole().equals(UserRole.USER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can report other users");
        }
        
        if (currentUser.getId().equals(reportedUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Self-reporting is not allowed");
        }

        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reported user not found"));
                
        if (!reportedUser.getRole().equals(UserRole.USER)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only report users");
        }

        UserReport report = new UserReport();
        report.setReporterUserId(currentUser.getId());
        report.setReportedUserId(reportedUserId);
        report.setStatus(ReportStatus.NEW);
        report.setReasonType(request.getReasonType());
        
        String text = request.getText();
        if (text != null) {
            text = text.trim();
            if (text.isEmpty()) {
                text = null;
            }
        }
        report.setText(text);
        
        userReportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<UserReportSummaryResponse> getAllReports(User currentUser) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        return userReportRepository.findAllByOrderByCreatedAtDesc().stream().map(report -> {
            UserReportSummaryResponse response = new UserReportSummaryResponse();
            response.setId(report.getId());
            response.setReporterUserId(report.getReporterUserId());
            response.setReportedUserId(report.getReportedUserId());
            response.setStatus(report.getStatus());
            response.setReasonType(report.getReasonType());
            response.setHasText(report.getText() != null && !report.getText().trim().isEmpty());
            response.setCreatedAt(report.getCreatedAt());
            return response;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserReportDetailsResponse getReportDetails(Long reportId, User currentUser) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        UserReport report = userReportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        UserReportDetailsResponse response = new UserReportDetailsResponse();
        response.setId(report.getId());
        response.setReporterUserId(report.getReporterUserId());
        response.setReportedUserId(report.getReportedUserId());
        response.setStatus(report.getStatus());
        response.setReasonType(report.getReasonType());
        response.setText(report.getText());
        response.setCreatedAt(report.getCreatedAt());
        response.setResolvedAt(report.getResolvedAt());
        
        return response;
    }

    @Transactional
    public void resolveReport(Long reportId, User currentUser) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        UserReport report = userReportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));

        if (report.getStatus() == ReportStatus.NEW) {
            report.setStatus(ReportStatus.RESOLVED);
            report.setResolvedAt(LocalDateTime.now());
            userReportRepository.save(report);
        }
    }
}
