package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.feedback.CreateProductFeedbackRequest;
import com.shiduchim.backend.dto.feedback.UpdateProductFeedbackStatusRequest;
import com.shiduchim.backend.entity.ProductFeedback;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.FeedbackStatus;
import com.shiduchim.backend.enums.FeedbackType;
import com.shiduchim.backend.enums.NotificationType;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.ProductFeedbackRepository;
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
public class ProductFeedbackServiceProducerTest {

    @Mock private ProductFeedbackRepository feedbackRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private ProductFeedbackService productFeedbackService;

    private User admin;
    private User sender;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(10L);
        admin.setRole(UserRole.ADMIN);

        sender = new User();
        sender.setId(20L);
        sender.setRole(UserRole.USER);
    }

    @Test
    void testInitialFeedbackCreation_CreatesNoNotification() {
        CreateProductFeedbackRequest request = new CreateProductFeedbackRequest();
        request.setType(FeedbackType.BUG);
        request.setText("App crashed");

        ProductFeedback savedFeedback = new ProductFeedback();
        savedFeedback.setId(100L);
        when(feedbackRepository.save(any(ProductFeedback.class))).thenReturn(savedFeedback);

        productFeedbackService.createFeedback(sender, request);

        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
    }

    @Test
    void testStatusChange_CreatesNotification() {
        ProductFeedback feedback = new ProductFeedback();
        feedback.setId(100L);
        feedback.setSenderUserId(20L);
        feedback.setStatus(FeedbackStatus.NEW);

        when(feedbackRepository.findById(100L)).thenReturn(Optional.of(feedback));

        UpdateProductFeedbackStatusRequest request = new UpdateProductFeedbackStatusRequest();
        request.setStatus(FeedbackStatus.RESOLVED);

        productFeedbackService.updateFeedbackStatus(100L, request, admin);

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.PRODUCT_FEEDBACK_STATUS_CHANGED), eq(10L), eq(100L), eq("RESOLVED"), eq("TO_RESOLVED")
        );
    }

    @Test
    void testSameStatusChange_CreatesNoNotification() {
        ProductFeedback feedback = new ProductFeedback();
        feedback.setId(100L);
        feedback.setSenderUserId(20L);
        feedback.setStatus(FeedbackStatus.RESOLVED);

        when(feedbackRepository.findById(100L)).thenReturn(Optional.of(feedback));

        UpdateProductFeedbackStatusRequest request = new UpdateProductFeedbackStatusRequest();
        request.setStatus(FeedbackStatus.RESOLVED);

        productFeedbackService.updateFeedbackStatus(100L, request, admin);

        verify(notificationService, never()).createSingleRecipientTransition(any(), any(), any(), any(), any(), any());
    }

    @Test
    void testSubsequentStatusChange_CreatesNewNotification() {
        ProductFeedback feedback = new ProductFeedback();
        feedback.setId(100L);
        feedback.setSenderUserId(20L);
        feedback.setStatus(FeedbackStatus.RESOLVED);

        when(feedbackRepository.findById(100L)).thenReturn(Optional.of(feedback));

        UpdateProductFeedbackStatusRequest request = new UpdateProductFeedbackStatusRequest();
        request.setStatus(FeedbackStatus.NEW); // Reopen

        productFeedbackService.updateFeedbackStatus(100L, request, admin);

        verify(notificationService).createSingleRecipientTransition(
            eq(20L), eq(NotificationType.PRODUCT_FEEDBACK_STATUS_CHANGED), eq(10L), eq(100L), eq("NEW"), eq("TO_NEW")
        );
    }
}
