package com.shiduchim.backend.dto.report;

import com.shiduchim.backend.enums.ReportReasonType;

public class CreateUserReportRequest {
    private ReportReasonType reasonType;
    private String text;

    public ReportReasonType getReasonType() { return reasonType; }
    public void setReasonType(ReportReasonType reasonType) { this.reasonType = reasonType; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
