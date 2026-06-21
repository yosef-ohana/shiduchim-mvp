package com.shiduchim.backend.dto.report;

import com.shiduchim.backend.enums.ReportReasonType;
import com.shiduchim.backend.enums.ReportStatus;

import java.time.LocalDateTime;

public class UserReportDetailsResponse {
    private Long id;
    private Long reporterUserId;
    private Long reportedUserId;
    private ReportStatus status;
    private ReportReasonType reasonType;
    private String text;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String reporterName;
    private String reporterEmail;
    private String reportedUserName;
    private String reportedUserEmail;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getReporterUserId() { return reporterUserId; }
    public void setReporterUserId(Long reporterUserId) { this.reporterUserId = reporterUserId; }

    public Long getReportedUserId() { return reportedUserId; }
    public void setReportedUserId(Long reportedUserId) { this.reportedUserId = reportedUserId; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public ReportReasonType getReasonType() { return reasonType; }
    public void setReasonType(ReportReasonType reasonType) { this.reasonType = reasonType; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getReportedUserName() { return reportedUserName; }
    public void setReportedUserName(String reportedUserName) { this.reportedUserName = reportedUserName; }

    public String getReportedUserEmail() { return reportedUserEmail; }
    public void setReportedUserEmail(String reportedUserEmail) { this.reportedUserEmail = reportedUserEmail; }
}
