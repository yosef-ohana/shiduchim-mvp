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
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
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

        List<UserReport> reports = userReportRepository.findAllByOrderByCreatedAtDesc();

        Set<Long> userIds = new HashSet<>();
        for (UserReport report : reports) {
            userIds.add(report.getReporterUserId());
            userIds.add(report.getReportedUserId());
        }

        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        return reports.stream().map(report -> {
            UserReportSummaryResponse response = new UserReportSummaryResponse();
            response.setId(report.getId());
            response.setReporterUserId(report.getReporterUserId());
            response.setReportedUserId(report.getReportedUserId());
            response.setStatus(report.getStatus());
            response.setReasonType(report.getReasonType());
            response.setHasText(report.getText() != null && !report.getText().trim().isEmpty());
            response.setCreatedAt(report.getCreatedAt());

            User reporter = userMap.get(report.getReporterUserId());
            if (reporter != null) {
                response.setReporterName(reporter.getFullName());
                response.setReporterEmail(reporter.getEmail());
            }
            User reported = userMap.get(report.getReportedUserId());
            if (reported != null) {
                response.setReportedUserName(reported.getFullName());
                response.setReportedUserEmail(reported.getEmail());
            }

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

        userRepository.findById(report.getReporterUserId()).ifPresent(user -> {
            response.setReporterName(user.getFullName());
            response.setReporterEmail(user.getEmail());
        });
        userRepository.findById(report.getReportedUserId()).ifPresent(user -> {
            response.setReportedUserName(user.getFullName());
            response.setReportedUserEmail(user.getEmail());
        });

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
