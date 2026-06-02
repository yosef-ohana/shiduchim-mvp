package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.admin.AdminUserResponse;
import com.shiduchim.backend.dto.admin.AdminWeddingResponse;
import com.shiduchim.backend.dto.admin.CreateEventManagerRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/event-managers")
    public AdminUserResponse createEventManager(@Valid @RequestBody CreateEventManagerRequest request,
                                                @AuthenticationPrincipal User currentUser) {
        return adminService.createEventManager(request, currentUser);
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers(@AuthenticationPrincipal User currentUser) {
        return adminService.getUsers(currentUser);
    }

    @PatchMapping("/users/{userId}/block")
    public AdminUserResponse blockUser(@PathVariable Long userId,
                                       @AuthenticationPrincipal User currentUser) {
        return adminService.blockUser(userId, currentUser);
    }

    @PatchMapping("/users/{userId}/unblock")
    public AdminUserResponse unblockUser(@PathVariable Long userId,
                                         @AuthenticationPrincipal User currentUser) {
        return adminService.unblockUser(userId, currentUser);
    }

    @GetMapping("/weddings")
    public List<AdminWeddingResponse> getWeddings(@AuthenticationPrincipal User currentUser) {
        return adminService.getWeddings(currentUser);
    }

    @PatchMapping("/weddings/{weddingId}/assign-self")
    public AdminWeddingResponse assignSelfToWedding(@PathVariable Long weddingId,
                                                    @AuthenticationPrincipal User currentUser) {
        return adminService.assignSelfToWedding(weddingId, currentUser);
    }
}
