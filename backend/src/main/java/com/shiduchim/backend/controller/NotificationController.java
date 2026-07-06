package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.notification.NotificationPageResponse;
import com.shiduchim.backend.dto.notification.NotificationResponse;
import com.shiduchim.backend.dto.notification.NotificationUnreadCountResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private void enforceUserRole(User user) {
        if (user.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only USER role can access notifications");
        }
    }

    @GetMapping
    public ResponseEntity<NotificationPageResponse> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {

        enforceUserRole(user);
        NotificationPageResponse response = notificationService.listNotifications(user, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<NotificationUnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal User user) {

        enforceUserRole(user);
        NotificationUnreadCountResponse response = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        enforceUserRole(user);
        NotificationResponse response = notificationService.markAsRead(user, id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/read-all")
    public ResponseEntity<NotificationUnreadCountResponse> markAllAsRead(
            @AuthenticationPrincipal User user) {

        enforceUserRole(user);
        NotificationUnreadCountResponse response = notificationService.markAllAsRead(user);
        return ResponseEntity.ok(response);
    }
}
