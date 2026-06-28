package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.feedback.CreateProductFeedbackRequest;
import com.shiduchim.backend.dto.feedback.MyProductFeedbackResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ProductFeedbackService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/feedback")
public class ProductFeedbackController {

    private final ProductFeedbackService feedbackService;

    public ProductFeedbackController(ProductFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<Void> createFeedback(@Valid @RequestBody CreateProductFeedbackRequest request,
                               @AuthenticationPrincipal User currentUser) {
        feedbackService.createFeedback(currentUser, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public List<MyProductFeedbackResponse> getMyFeedback(@AuthenticationPrincipal User currentUser) {
        return feedbackService.getMyFeedback(currentUser);
    }
}
