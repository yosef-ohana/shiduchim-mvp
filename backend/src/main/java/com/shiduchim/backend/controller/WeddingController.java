package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.wedding.JoinWeddingRequest;
import com.shiduchim.backend.dto.wedding.JoinWeddingResponse;
import com.shiduchim.backend.dto.wedding.ValidateWeddingCodeRequest;
import com.shiduchim.backend.dto.wedding.ValidateWeddingCodeResponse;
import com.shiduchim.backend.dto.wedding.WeddingCreateRequest;
import com.shiduchim.backend.dto.wedding.WeddingResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.WeddingService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.shiduchim.backend.service.WeddingBackgroundService;
import com.shiduchim.backend.entity.Wedding;

import java.util.List;

@RestController
@RequestMapping("/api")
public class WeddingController {

    private final WeddingService weddingService;
    private final WeddingBackgroundService weddingBackgroundService;

    public WeddingController(WeddingService weddingService, WeddingBackgroundService weddingBackgroundService) {
        this.weddingService = weddingService;
        this.weddingBackgroundService = weddingBackgroundService;
    }

    @PostMapping("/event-manager/weddings")
    public WeddingResponse createWedding(@jakarta.validation.Valid @RequestBody WeddingCreateRequest request,
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

    @PostMapping("/event-manager/weddings/{id}/background")
    public WeddingResponse uploadWeddingBackground(@PathVariable Long id,
                                                   @RequestParam("file") MultipartFile file,
                                                   @AuthenticationPrincipal User currentUser) {
        Wedding wedding = weddingBackgroundService.uploadBackground(id, file, currentUser);
        return weddingService.toResponse(wedding);
    }

    @DeleteMapping("/event-manager/weddings/{id}/background")
    public WeddingResponse deleteWeddingBackground(@PathVariable Long id,
                                                   @AuthenticationPrincipal User currentUser) {
        Wedding wedding = weddingBackgroundService.deleteBackground(id, currentUser);
        return weddingService.toResponse(wedding);
    }

    @PostMapping("/weddings/join")
    public JoinWeddingResponse joinWedding(@RequestBody JoinWeddingRequest request,
                                           @AuthenticationPrincipal User currentUser) {
        return weddingService.joinWedding(request, currentUser);
    }

    @PostMapping("/weddings/validate-code")
    public ValidateWeddingCodeResponse validateCode(@RequestBody ValidateWeddingCodeRequest request) {
        return weddingService.validateCode(request);
    }

    @GetMapping("/weddings/my")
    public List<com.shiduchim.backend.dto.wedding.UserWeddingResponse> getMyWeddings(@AuthenticationPrincipal User currentUser) {
        return weddingService.getMyWeddings(currentUser);
    }
}
