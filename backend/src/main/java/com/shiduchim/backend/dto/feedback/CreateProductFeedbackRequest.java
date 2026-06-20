package com.shiduchim.backend.dto.feedback;

import com.shiduchim.backend.enums.FeedbackType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateProductFeedbackRequest {

    @NotNull(message = "Type is required")
    private FeedbackType type;

    @NotBlank(message = "Text is required")
    private String text;

    public FeedbackType getType() {
        return type;
    }

    public void setType(FeedbackType type) {
        this.type = type;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
