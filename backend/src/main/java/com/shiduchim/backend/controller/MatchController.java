package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.match.MatchDetailsResponse;
import com.shiduchim.backend.dto.match.MatchResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public ResponseEntity<List<MatchResponse>> getMatches(@AuthenticationPrincipal User currentUser) {
        List<MatchResponse> matches = matchService.getActiveMatches(currentUser);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/{matchId}")
    public ResponseEntity<MatchDetailsResponse> getMatchDetails(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long matchId) {
        MatchDetailsResponse details = matchService.getMatchDetails(currentUser, matchId);
        return ResponseEntity.ok(details);
    }

    @PatchMapping("/{matchId}/cancel")
    public ResponseEntity<Void> cancelMatch(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long matchId) {
        matchService.cancelMatch(currentUser, matchId);
        return ResponseEntity.noContent().build();
    }
}
