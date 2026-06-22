package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.wedding.AddParticipantRequest;
import com.shiduchim.backend.dto.wedding.ParticipantResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.service.ParticipantService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/weddings/{weddingId}/participants")
public class AdminParticipantController {

    private final ParticipantService participantService;

    public AdminParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    private void checkAdmin(User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (currentUser.getRole() != UserRole.ADMIN || Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }
    }

    @GetMapping
    public List<ParticipantResponse> getParticipants(@PathVariable Long weddingId,
                                                     @AuthenticationPrincipal User currentUser) {
        checkAdmin(currentUser);
        return participantService.getParticipants(weddingId, currentUser);
    }

    @PostMapping
    public ParticipantResponse addParticipant(@PathVariable Long weddingId,
                                               @RequestBody AddParticipantRequest request,
                                               @AuthenticationPrincipal User currentUser) {
        checkAdmin(currentUser);
        return participantService.addParticipant(weddingId, request, currentUser);
    }

    @DeleteMapping("/{userId}")
    public ParticipantResponse removeParticipant(@PathVariable Long weddingId,
                                                 @PathVariable Long userId,
                                                 @AuthenticationPrincipal User currentUser) {
        checkAdmin(currentUser);
        return participantService.removeParticipant(weddingId, userId, currentUser);
    }
}
