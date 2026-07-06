package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.report.CreateUserReportRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserReport;
import com.shiduchim.backend.enums.NotificationType;
import com.shiduchim.backend.enums.ReportReasonType;
import com.shiduchim.backend.enums.ReportStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserReportRepository;
import com.shiduchim.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserReportServiceProducerTest {

    @Mock private UserReportRepository userReportRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private UserReportService userReportService;

    private User admin;
    private User reporter;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(10L);
        admin.setRole(UserRole.ADMIN);

        reporter = new User();
        reporter.setId(20L);
        reporter.setRole(UserRole.USER);
    }

    @Test
    void testInitialReportCreation_CreatesNoNotification() {
        CreateUserReportRequest request = new CreateUserReportRequest();
        request.setReasonType(ReportReasonType.BEHAVIOR);

        User targetUser = new User();
        targetUser.setId(30L);
        targetUser.setRole(UserRole.USER);
        when(userRepository.findById(30L)).thenReturn(Optional.of(targetUser));

        UserReport savedReport = new UserReport();
        savedReport.setId(100L);
        when(userReportRepository.save(any(UserReport.class))).thenReturn(savedReport);

        userReportService.createReport(reporter, 30L, request);

        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
    }

    @Test
    void testStatusChangeToResolved_CreatesNotification() {
        UserReport report = new UserReport();
        report.setId(100L);
        report.setReporterUserId(20L);
        report.setStatus(ReportStatus.NEW);

        when(userReportRepository.findById(100L)).thenReturn(Optional.of(report));

        userReportService.resolveReport(100L, admin);

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.USER_REPORT_STATUS_CHANGED), eq(10L), eq(100L), eq("RESOLVED"), eq("TO_RESOLVED")
        );
    }

    @Test
    void testSameStatusChange_CreatesNoNotification() {
        UserReport report = new UserReport();
        report.setId(100L);
        report.setReporterUserId(20L);
        report.setStatus(ReportStatus.RESOLVED);

        when(userReportRepository.findById(100L)).thenReturn(Optional.of(report));

        userReportService.resolveReport(100L, admin);

        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
    }
}
