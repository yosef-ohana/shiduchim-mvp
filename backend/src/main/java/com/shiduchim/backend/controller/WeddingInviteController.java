package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.wedding.CreateWeddingInviteRequest;
import com.shiduchim.backend.dto.wedding.WeddingInviteResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.WeddingInviteService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WeddingInviteController {

    private final WeddingInviteService weddingInviteService;

    public WeddingInviteController(WeddingInviteService weddingInviteService) {
        this.weddingInviteService = weddingInviteService;
    }

    @PostMapping("/event-manager/weddings/{id}/invites")
    public WeddingInviteResponse createInvite(@PathVariable Long id,
                                              @RequestBody CreateWeddingInviteRequest request,
                                              @AuthenticationPrincipal User currentUser) {
        return weddingInviteService.createInvite(id, request, currentUser);
    }

    @GetMapping("/event-manager/weddings/{id}/invites")
    public List<WeddingInviteResponse> getInvites(@PathVariable Long id,
                                                  @AuthenticationPrincipal User currentUser) {
        return weddingInviteService.getInvites(id, currentUser);
    }

    @PatchMapping("/event-manager/weddings/{id}/invites/{inviteId}/cancel")
    public WeddingInviteResponse cancelInvite(@PathVariable Long id,
                                              @PathVariable Long inviteId,
                                              @AuthenticationPrincipal User currentUser) {
        return weddingInviteService.cancelInvite(id, inviteId, currentUser);
    }
}
