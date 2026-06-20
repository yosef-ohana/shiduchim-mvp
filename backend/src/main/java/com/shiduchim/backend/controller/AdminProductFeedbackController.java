package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.feedback.ProductFeedbackDetailsResponse;
import com.shiduchim.backend.dto.feedback.ProductFeedbackSummaryResponse;
import com.shiduchim.backend.dto.feedback.UpdateProductFeedbackStatusRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ProductFeedbackService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/feedback")
public class AdminProductFeedbackController {

    private final ProductFeedbackService feedbackService;

    public AdminProductFeedbackController(ProductFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    public List<ProductFeedbackSummaryResponse> getAllFeedback(@AuthenticationPrincipal User currentUser) {
        return feedbackService.getAllFeedback(currentUser);
    }

    @GetMapping("/{feedbackId}")
    public ProductFeedbackDetailsResponse getFeedbackDetails(@PathVariable Long feedbackId,
                                                             @AuthenticationPrincipal User currentUser) {
        return feedbackService.getFeedbackDetails(feedbackId, currentUser);
    }

    @PatchMapping("/{feedbackId}/status")
    public void updateFeedbackStatus(@PathVariable Long feedbackId,
                                     @Valid @RequestBody UpdateProductFeedbackStatusRequest request,
                                     @AuthenticationPrincipal User currentUser) {
        feedbackService.updateFeedbackStatus(feedbackId, request, currentUser);
    }
}
