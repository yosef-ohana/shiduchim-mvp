package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.feedback.CreateProductFeedbackRequest;
import com.shiduchim.backend.dto.feedback.ProductFeedbackDetailsResponse;
import com.shiduchim.backend.dto.feedback.ProductFeedbackSummaryResponse;
import com.shiduchim.backend.dto.feedback.UpdateProductFeedbackStatusRequest;
import com.shiduchim.backend.entity.ProductFeedback;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.FeedbackStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.ProductFeedbackRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductFeedbackService {

    private final ProductFeedbackRepository feedbackRepository;

    public ProductFeedbackService(ProductFeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional
    public void createFeedback(User currentUser, CreateProductFeedbackRequest request) {
        if (!currentUser.getRole().equals(UserRole.USER)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users can create product feedback");
        }

        ProductFeedback feedback = new ProductFeedback();
        feedback.setSenderUserId(currentUser.getId());
        feedback.setType(request.getType());
        feedback.setStatus(FeedbackStatus.NEW);
        
        String text = request.getText();
        if (text != null) {
            text = text.trim();
        }
        if (text == null || text.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback text cannot be blank");
        }
        feedback.setText(text);

        feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<ProductFeedbackSummaryResponse> getAllFeedback(User currentUser) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream().map(feedback -> {
            ProductFeedbackSummaryResponse response = new ProductFeedbackSummaryResponse();
            response.setId(feedback.getId());
            response.setSenderUserId(feedback.getSenderUserId());
            response.setType(feedback.getType());
            response.setStatus(feedback.getStatus());
            response.setCreatedAt(feedback.getCreatedAt());
            return response;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductFeedbackDetailsResponse getFeedbackDetails(Long feedbackId, User currentUser) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        ProductFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));

        ProductFeedbackDetailsResponse response = new ProductFeedbackDetailsResponse();
        response.setId(feedback.getId());
        response.setSenderUserId(feedback.getSenderUserId());
        response.setType(feedback.getType());
        response.setStatus(feedback.getStatus());
        response.setText(feedback.getText());
        response.setCreatedAt(feedback.getCreatedAt());
        response.setUpdatedAt(feedback.getUpdatedAt());
        response.setResolvedAt(feedback.getResolvedAt());

        return response;
    }

    @Transactional
    public void updateFeedbackStatus(Long feedbackId, UpdateProductFeedbackStatusRequest request, User currentUser) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        ProductFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));

        FeedbackStatus newStatus = request.getStatus();
        if (newStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status cannot be null");
        }

        feedback.setStatus(newStatus);

        if (newStatus == FeedbackStatus.RESOLVED) {
            feedback.setResolvedAt(LocalDateTime.now());
        } else {
            feedback.setResolvedAt(null);
        }

        feedbackRepository.save(feedback);
    }
}
