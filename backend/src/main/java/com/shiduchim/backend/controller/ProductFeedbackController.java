package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.feedback.CreateProductFeedbackRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ProductFeedbackService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
public class ProductFeedbackController {

    private final ProductFeedbackService feedbackService;

    public ProductFeedbackController(ProductFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public void createFeedback(@Valid @RequestBody CreateProductFeedbackRequest request,
                               @AuthenticationPrincipal User currentUser) {
        feedbackService.createFeedback(currentUser, request);
    }
}
