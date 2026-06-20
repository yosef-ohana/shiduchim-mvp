package com.shiduchim.backend.dto.feedback;

import com.shiduchim.backend.enums.FeedbackStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateProductFeedbackStatusRequest {

    @NotNull(message = "Status is required")
    private FeedbackStatus status;

    public FeedbackStatus getStatus() {
        return status;
    }

    public void setStatus(FeedbackStatus status) {
        this.status = status;
    }
}
