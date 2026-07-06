package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.notification.NotificationPageResponse;
import com.shiduchim.backend.dto.notification.NotificationResponse;
import com.shiduchim.backend.dto.notification.NotificationUnreadCountResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

    @Mock
    private NotificationService service;

    @InjectMocks
    private NotificationController controller;

    private User regularUser;
    private User adminUser;
    private User eventManagerUser;

    @BeforeEach
    void setUp() {
        regularUser = new User();
        regularUser.setRole(UserRole.USER);

        adminUser = new User();
        adminUser.setRole(UserRole.ADMIN);

        eventManagerUser = new User();
        eventManagerUser.setRole(UserRole.EVENT_MANAGER);
    }

    @Test
    void testGetNotifications_UserAllowed() {
        NotificationPageResponse mockResponse = new NotificationPageResponse();
        when(service.listNotifications(regularUser, 0, 30)).thenReturn(mockResponse);

        ResponseEntity<NotificationPageResponse> response = controller.getNotifications(regularUser, 0, 30);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testGetNotifications_AdminRejected() {
        assertThrows(ResponseStatusException.class, () -> controller.getNotifications(adminUser, 0, 30));
    }

    @Test
    void testGetNotifications_EventManagerRejected() {
        assertThrows(ResponseStatusException.class, () -> controller.getNotifications(eventManagerUser, 0, 30));
    }

    @Test
    void testGetUnreadCount_UserAllowed() {
        NotificationUnreadCountResponse mockResponse = new NotificationUnreadCountResponse(5);
        when(service.getUnreadCount(regularUser)).thenReturn(mockResponse);

        ResponseEntity<NotificationUnreadCountResponse> response = controller.getUnreadCount(regularUser);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testGetUnreadCount_AdminRejected() {
        assertThrows(ResponseStatusException.class, () -> controller.getUnreadCount(adminUser));
    }

    @Test
    void testMarkAsRead_UserAllowed() {
        NotificationResponse mockResponse = new NotificationResponse();
        when(service.markAsRead(regularUser, 100L)).thenReturn(mockResponse);

        ResponseEntity<NotificationResponse> response = controller.markAsRead(regularUser, 100L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testMarkAsRead_AdminRejected() {
        assertThrows(ResponseStatusException.class, () -> controller.markAsRead(adminUser, 100L));
    }

    @Test
    void testMarkAllAsRead_UserAllowed() {
        NotificationUnreadCountResponse mockResponse = new NotificationUnreadCountResponse(0);
        when(service.markAllAsRead(regularUser)).thenReturn(mockResponse);

        ResponseEntity<NotificationUnreadCountResponse> response = controller.markAllAsRead(regularUser);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResponse, response.getBody());
    }

    @Test
    void testMarkAllAsRead_AdminRejected() {
        assertThrows(ResponseStatusException.class, () -> controller.markAllAsRead(adminUser));
    }
}
