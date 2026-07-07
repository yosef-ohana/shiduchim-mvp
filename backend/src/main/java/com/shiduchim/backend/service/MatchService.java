package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.match.MatchDetailsResponse;
import com.shiduchim.backend.dto.match.MatchResponse;
import com.shiduchim.backend.dto.match.MatchUserProfile;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.UserPhoto;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final UserBlockService userBlockService;

    public MatchService(MatchRepository matchRepository, UserRepository userRepository, UserPhotoRepository userPhotoRepository, UserBlockService userBlockService) {
        this.matchRepository = matchRepository;
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.userBlockService = userBlockService;
    }

    public List<MatchResponse> getActiveMatches(User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User must have USER role");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked");
        }

        List<Match> matches = matchRepository.findByUserIdAndStatus(currentUser.getId(), MatchStatus.ACTIVE);

        return matches.stream()
                .map(match -> mapToMatchResponse(currentUser, match))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private MatchResponse mapToMatchResponse(User currentUser, Match match) {
        Long otherUserId = match.getUser1Id().equals(currentUser.getId()) ? match.getUser2Id() : match.getUser1Id();
        User otherUser = userRepository.findById(otherUserId).orElse(null);

        if (otherUser == null || Boolean.TRUE.equals(otherUser.getAdminBlocked())) {
            return null;
        }

        // UserBlock enforcement: hide match from list if an ACTIVE block exists in either direction
        if (userBlockService.existsActiveBlockBetween(currentUser.getId(), otherUserId)) {
            return null;
        }

        String primaryPhotoUrl = userPhotoRepository.findByUserIdAndIsPrimaryTrue(otherUserId)
                .map(UserPhoto::getImageUrl).orElse(null);

        return new MatchResponse(
                match.getId(),
                otherUserId,
                otherUser.getFullName(),
                primaryPhotoUrl,
                match.getPoolType(),
                match.getWeddingId(),
                match.getStatus(),
                match.getCreatedAt()
        );
    }

    public MatchDetailsResponse getMatchDetails(User currentUser, Long matchId) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User must have USER role");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked");
        }

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        if (!match.getUser1Id().equals(currentUser.getId()) && !match.getUser2Id().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a party to this match");
        }

        if (match.getStatus() == MatchStatus.BLOCKED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found or is blocked");
        }

        Long otherUserId = match.getUser1Id().equals(currentUser.getId()) ? match.getUser2Id() : match.getUser1Id();
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        if (Boolean.TRUE.equals(otherUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found");
        }

        // UserBlock enforcement: block match details access if an ACTIVE block exists in either direction
        if (userBlockService.existsActiveBlockBetween(currentUser.getId(), otherUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found or is not accessible");
        }

        String primaryPhotoUrl = userPhotoRepository.findByUserIdAndIsPrimaryTrue(otherUserId)
                .map(UserPhoto::getImageUrl).orElse(null);

        MatchUserProfile profile = new MatchUserProfile();
        profile.setUserId(otherUser.getId());
        profile.setPrimaryPhotoUrl(primaryPhotoUrl);
        profile.setFullName(otherUser.getFullName());
        profile.setAge(otherUser.getAge());
        profile.setHeightCm(otherUser.getHeightCm());
        profile.setAreaOfResidence(otherUser.getAreaOfResidence());
        profile.setReligiousLevel(otherUser.getReligiousLevel());
        profile.setEducation(otherUser.getEducation());
        profile.setOccupation(otherUser.getOccupation());
        profile.setSelfDescription(otherUser.getSelfDescription());
        profile.setHobbies(otherUser.getHobbies());
        profile.setFamilyDescription(otherUser.getFamilyDescription());
        profile.setLookingFor(otherUser.getLookingFor());
        profile.setHeadCovering(otherUser.getHeadCovering());
        profile.setHasDrivingLicense(otherUser.getHasDrivingLicense());

        MatchDetailsResponse response = new MatchDetailsResponse();
        response.setMatchId(match.getId());
        response.setOtherUserProfile(profile);
        response.setPoolType(match.getPoolType());
        response.setWeddingId(match.getWeddingId());
        response.setStatus(match.getStatus());
        response.setCreatedAt(match.getCreatedAt());

        return response;
    }

    @Transactional
    public void cancelMatch(User currentUser, Long matchId) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        if (currentUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User must have USER role");
        }
        if (Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked");
        }

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        if (!match.getUser1Id().equals(currentUser.getId()) && !match.getUser2Id().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a party to this match");
        }

        if (match.getStatus() != MatchStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Match is not active");
        }

        match.setStatus(MatchStatus.BLOCKED);
        match.setBlockedAt(java.time.LocalDateTime.now());
        matchRepository.save(match);
    }
}
