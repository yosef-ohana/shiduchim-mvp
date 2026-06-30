package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.admin.AdminUserResponse;
import com.shiduchim.backend.dto.admin.AdminWeddingResponse;
import com.shiduchim.backend.dto.admin.AdminCreateWeddingRequest;
import com.shiduchim.backend.dto.admin.AssignManagerRequest;
import com.shiduchim.backend.dto.admin.CreateEventManagerRequest;
import com.shiduchim.backend.dto.admin.AdminDashboardResponse;
import com.shiduchim.backend.dto.report.UserReportSummaryResponse;
import com.shiduchim.backend.dto.report.UserReportDetailsResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.AdminService;
import com.shiduchim.backend.service.ParticipantService;
import com.shiduchim.backend.service.UserReportService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.shiduchim.backend.service.WeddingBackgroundService;
import com.shiduchim.backend.dto.wedding.StaffParticipantDetailsResponse;
import com.shiduchim.backend.entity.Wedding;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final ParticipantService participantService;
    private final UserReportService userReportService;
    private final WeddingBackgroundService weddingBackgroundService;

    public AdminController(AdminService adminService, ParticipantService participantService, UserReportService userReportService, WeddingBackgroundService weddingBackgroundService) {
        this.adminService = adminService;
        this.participantService = participantService;
        this.userReportService = userReportService;
        this.weddingBackgroundService = weddingBackgroundService;
    }

    @PostMapping("/event-managers")
    public AdminUserResponse createEventManager(@Valid @RequestBody CreateEventManagerRequest request,
                                                @AuthenticationPrincipal User currentUser) {
        return adminService.createEventManager(request, currentUser);
    }

    @GetMapping("/event-managers")
    public List<AdminUserResponse> getEventManagers(@AuthenticationPrincipal User currentUser) {
        return adminService.getEventManagers(currentUser);
    }

    @PatchMapping("/event-managers/{id}/block")
    public AdminUserResponse blockEventManager(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return adminService.blockEventManager(id, currentUser);
    }

    @PatchMapping("/event-managers/{id}/unblock")
    public AdminUserResponse unblockEventManager(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return adminService.unblockEventManager(id, currentUser);
    }

    @PatchMapping("/event-managers/{id}/deactivate")
    public AdminUserResponse deactivateEventManager(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return adminService.deactivateEventManager(id, currentUser);
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers(@AuthenticationPrincipal User currentUser) {
        return adminService.getUsers(currentUser);
    }

    @GetMapping("/users/{userId}/details")
    public StaffParticipantDetailsResponse getUserDetails(@PathVariable Long userId,
                                                          @AuthenticationPrincipal User currentUser) {
        return participantService.getAdminUserDetails(userId, currentUser);
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

    @PostMapping("/weddings")
    public AdminWeddingResponse createWedding(@jakarta.validation.Valid @RequestBody AdminCreateWeddingRequest request,
                                              @AuthenticationPrincipal User currentUser) {
        return adminService.createWedding(request, currentUser);
    }

    @PatchMapping("/weddings/{weddingId}/assign-manager")
    public AdminWeddingResponse assignManagerToWedding(@PathVariable Long weddingId,
                                                       @RequestBody AssignManagerRequest request,
                                                       @AuthenticationPrincipal User currentUser) {
        return adminService.assignManagerToWedding(weddingId, request, currentUser);
    }

    @PatchMapping("/weddings/{weddingId}/close")
    public AdminWeddingResponse closeWedding(@PathVariable Long weddingId,
                                             @AuthenticationPrincipal User currentUser) {
        return adminService.closeWedding(weddingId, currentUser);
    }

    @PatchMapping("/weddings/{weddingId}/cancel")
    public AdminWeddingResponse cancelWedding(@PathVariable Long weddingId,
                                              @AuthenticationPrincipal User currentUser) {
        return adminService.cancelWedding(weddingId, currentUser);
    }

    @PatchMapping("/weddings/{weddingId}/restore")
    public AdminWeddingResponse restoreWedding(@PathVariable Long weddingId,
                                               @AuthenticationPrincipal User currentUser) {
        return adminService.restoreWedding(weddingId, currentUser);
    }

    @DeleteMapping("/weddings/{weddingId}")
    public org.springframework.http.ResponseEntity<Void> hardDeleteWedding(@PathVariable Long weddingId,
                                                                           @AuthenticationPrincipal User currentUser) {
        adminService.hardDeleteWedding(weddingId, currentUser);
        return org.springframework.http.ResponseEntity.noContent().build();
    }

    @PatchMapping("/weddings/{weddingId}/assign-self")
    public AdminWeddingResponse assignSelfToWedding(@PathVariable Long weddingId,
                                                    @AuthenticationPrincipal User currentUser) {
        return adminService.assignSelfToWedding(weddingId, currentUser);
    }

    @PostMapping("/weddings/{weddingId}/background")
    public AdminWeddingResponse uploadWeddingBackground(@PathVariable Long weddingId,
                                                        @RequestParam("file") MultipartFile file,
                                                        @AuthenticationPrincipal User currentUser) {
        Wedding wedding = weddingBackgroundService.uploadBackground(weddingId, file, currentUser);
        return adminService.toAdminWeddingResponse(wedding);
    }

    @DeleteMapping("/weddings/{weddingId}/background")
    public AdminWeddingResponse deleteWeddingBackground(@PathVariable Long weddingId,
                                                        @AuthenticationPrincipal User currentUser) {
        Wedding wedding = weddingBackgroundService.deleteBackground(weddingId, currentUser);
        return adminService.toAdminWeddingResponse(wedding);
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard(@AuthenticationPrincipal User currentUser) {
        return adminService.getDashboard(currentUser);
    }

    @GetMapping("/reports")
    public List<UserReportSummaryResponse> getReports(@AuthenticationPrincipal User currentUser) {
        return userReportService.getAllReports(currentUser);
    }

    @GetMapping("/reports/{reportId}")
    public UserReportDetailsResponse getReportDetails(@PathVariable Long reportId, @AuthenticationPrincipal User currentUser) {
        return userReportService.getReportDetails(reportId, currentUser);
    }

    @PatchMapping("/reports/{reportId}/resolve")
    public void resolveReport(@PathVariable Long reportId, @AuthenticationPrincipal User currentUser) {
        userReportService.resolveReport(reportId, currentUser);
    }
}
