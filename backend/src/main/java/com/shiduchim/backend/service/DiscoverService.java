package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.discover.DiscoverResponse;
import com.shiduchim.backend.dto.discover.PublicUserCardResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.entity.WeddingParticipant;
import com.shiduchim.backend.enums.*;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class DiscoverService {

    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingParticipantRepository weddingParticipantRepository;

    public DiscoverService(UserRepository userRepository,
                           UserPhotoRepository userPhotoRepository,
                           WeddingRepository weddingRepository,
                           WeddingParticipantRepository weddingParticipantRepository) {
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.weddingRepository = weddingRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
    }

    public DiscoverResponse getDiscover(User authenticatedUser, PoolType pool, Long weddingId, Integer limit) {
        User currentUser = userRepository.findById(authenticatedUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        validateCurrentUserBasic(currentUser);

        int finalLimit = (limit != null && limit > 0) ? Math.min(limit, 50) : 20;
        Pageable pageable = PageRequest.of(0, finalLimit);

        Gender oppositeGender = (currentUser.getGender() == Gender.MALE) ? Gender.FEMALE : Gender.MALE;
        List<Object[]> results;

        if (pool == PoolType.WEDDING) {
            if (weddingId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId is required for WEDDING pool");
            }
            validateWeddingAccess(currentUser, weddingId);
            results = userRepository.findWeddingCandidatesWithPhoto(currentUser.getId(), oppositeGender, weddingId, pageable);
        } else if (pool == PoolType.GLOBAL) {
            if (weddingId != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weddingId is not allowed for GLOBAL pool");
            }
            if (currentUser.getProfileStatus() != ProfileStatus.FULL) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "GLOBAL pool requires a FULL profile status");
            }
            results = userRepository.findGlobalCandidatesWithPhoto(currentUser.getId(), oppositeGender, pageable);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pool type");
        }

        List<PublicUserCardResponse> items = new ArrayList<>();
        for (Object[] row : results) {
            User candidate = (User) row[0];
            String primaryPhotoUrl = (String) row[1];
            items.add(mapToCardResponse(candidate, primaryPhotoUrl, pool, weddingId));
        }

        return new DiscoverResponse(items);
    }

    private void validateCurrentUserBasic(User user) {
        if (user.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only USERS can access discover");
        }
        if (Boolean.TRUE.equals(user.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is blocked by admin");
        }
        if (user.getGender() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Gender is not set");
        }
        if (user.getProfileStatus() == ProfileStatus.NONE || user.getProfileStatus() == ProfileStatus.FULL_INCOMPLETE_BLOCKED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Incomplete profile status");
        }
        boolean hasPrimaryPhoto = userPhotoRepository.existsByUserIdAndIsPrimaryTrue(user.getId());
        if (!hasPrimaryPhoto) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Primary photo is required");
        }
    }

    private void validateWeddingAccess(User user, Long weddingId) {
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));
        if (wedding.getStatus() != WeddingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wedding is not active");
        }
        WeddingParticipant participant = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a participant in this wedding"));
        if (participant.getStatus() != ParticipantStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not an active participant in this wedding");
        }
    }

    private PublicUserCardResponse mapToCardResponse(User candidate, String primaryPhotoUrl, PoolType poolType, Long weddingId) {
        PublicUserCardResponse dto = new PublicUserCardResponse();
        dto.setUserId(candidate.getId());
        dto.setPrimaryPhotoUrl(primaryPhotoUrl);
        dto.setFullName(candidate.getFullName());
        dto.setAge(candidate.getAge());
        dto.setHeightCm(candidate.getHeightCm());
        dto.setAreaOfResidence(candidate.getAreaOfResidence());
        dto.setReligiousLevel(candidate.getReligiousLevel());
        dto.setEducation(candidate.getEducation());
        dto.setPoolType(poolType);
        dto.setWeddingId(weddingId);

        String lookingFor = candidate.getLookingFor();
        if (lookingFor != null) {
            if (lookingFor.length() > 100) {
                dto.setLookingForShort(lookingFor.substring(0, 97) + "...");
            } else {
                dto.setLookingForShort(lookingFor);
            }
        } else {
            dto.setLookingForShort(null);
        }

        return dto;
    }
}
