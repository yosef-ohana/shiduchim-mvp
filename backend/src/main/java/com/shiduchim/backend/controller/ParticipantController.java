package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.wedding.AddParticipantRequest;
import com.shiduchim.backend.dto.wedding.ParticipantResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.ParticipantService;
import com.shiduchim.backend.dto.wedding.StaffParticipantDetailsResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-manager/weddings/{id}/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @GetMapping
    public List<ParticipantResponse> getParticipants(@PathVariable Long id,
                                                     @AuthenticationPrincipal User currentUser) {
        return participantService.getParticipants(id, currentUser);
    }

    @PostMapping
    public ParticipantResponse addParticipant(@PathVariable Long id,
                                              @RequestBody AddParticipantRequest request,
                                              @AuthenticationPrincipal User currentUser) {
        return participantService.addParticipant(id, request, currentUser);
    }

    @DeleteMapping("/{userId}")
    public ParticipantResponse removeParticipant(@PathVariable Long id,
                                                 @PathVariable Long userId,
                                                 @AuthenticationPrincipal User currentUser) {
        return participantService.removeParticipant(id, userId, currentUser);
    }

    @GetMapping("/{userId}/details")
    public StaffParticipantDetailsResponse getParticipantDetails(@PathVariable Long id,
                                                                 @PathVariable Long userId,
                                                                 @AuthenticationPrincipal User currentUser) {
        return participantService.getParticipantDetails(id, userId, currentUser);
    }

    @PatchMapping("/{userId}/restore")
    public ParticipantResponse restoreParticipant(@PathVariable Long id,
                                                  @PathVariable Long userId,
                                                  @AuthenticationPrincipal User currentUser) {
        return participantService.restoreParticipant(id, userId, currentUser);
    }
}
