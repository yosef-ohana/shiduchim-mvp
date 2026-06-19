package com.shiduchim.backend.dto.report;

import com.shiduchim.backend.enums.ReportReasonType;
import com.shiduchim.backend.enums.ReportStatus;

import java.time.LocalDateTime;

public class UserReportSummaryResponse {
    private Long id;
    private Long reporterUserId;
    private Long reportedUserId;
    private ReportStatus status;
    private ReportReasonType reasonType;
    private boolean hasText;
    private LocalDateTime createdAt;

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

    public boolean isHasText() { return hasText; }
    public void setHasText(boolean hasText) { this.hasText = hasText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
