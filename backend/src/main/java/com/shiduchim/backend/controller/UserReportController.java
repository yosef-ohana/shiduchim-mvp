package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.report.CreateUserReportRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.UserReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class UserReportController {

    private final UserReportService userReportService;

    public UserReportController(UserReportService userReportService) {
        this.userReportService = userReportService;
    }

    @PostMapping("/users/{reportedUserId}")
    public ResponseEntity<Void> createReport(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long reportedUserId,
            @RequestBody CreateUserReportRequest request) {
        
        userReportService.createReport(currentUser, reportedUserId, request);
        return ResponseEntity.ok().build();
    }
}
