package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.wedding.JoinWeddingRequest;
import com.shiduchim.backend.dto.wedding.JoinWeddingResponse;
import com.shiduchim.backend.dto.wedding.WeddingCreateRequest;
import com.shiduchim.backend.dto.wedding.WeddingResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.WeddingService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WeddingController {

    private final WeddingService weddingService;

    public WeddingController(WeddingService weddingService) {
        this.weddingService = weddingService;
    }

    @PostMapping("/event-manager/weddings")
    public WeddingResponse createWedding(@RequestBody WeddingCreateRequest request,
                                         @AuthenticationPrincipal User currentUser) {
        return weddingService.createWedding(request, currentUser);
    }

    @GetMapping("/event-manager/weddings")
    public List<WeddingResponse> getWeddings(@AuthenticationPrincipal User currentUser) {
        return weddingService.getWeddings(currentUser);
    }

    @GetMapping("/event-manager/weddings/{id}")
    public WeddingResponse getWedding(@PathVariable Long id,
                                      @AuthenticationPrincipal User currentUser) {
        return weddingService.getWedding(id, currentUser);
    }

    @PatchMapping("/event-manager/weddings/{id}/close")
    public WeddingResponse closeWedding(@PathVariable Long id,
                                        @AuthenticationPrincipal User currentUser) {
        return weddingService.closeWedding(id, currentUser);
    }

    @PatchMapping("/event-manager/weddings/{id}/cancel")
    public WeddingResponse cancelWedding(@PathVariable Long id,
                                         @AuthenticationPrincipal User currentUser) {
        return weddingService.cancelWedding(id, currentUser);
    }

    @PostMapping("/weddings/join")
    public JoinWeddingResponse joinWedding(@RequestBody JoinWeddingRequest request,
                                           @AuthenticationPrincipal User currentUser) {
        return weddingService.joinWedding(request, currentUser);
    }
}
