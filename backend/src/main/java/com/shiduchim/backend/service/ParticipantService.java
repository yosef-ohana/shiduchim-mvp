package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.wedding.AddParticipantRequest;
import com.shiduchim.backend.dto.wedding.ParticipantResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.entity.WeddingParticipant;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.enums.WeddingStatus;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParticipantService {

    private final WeddingService weddingService;
    private final WeddingParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;

    public ParticipantService(WeddingService weddingService,
                              WeddingParticipantRepository participantRepository,
                              UserRepository userRepository,
                              UserPhotoRepository userPhotoRepository) {
        this.weddingService = weddingService;
        this.participantRepository = participantRepository;
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
    }

    public List<ParticipantResponse> getParticipants(Long weddingId, User currentUser) {
        // Will check if owner or admin
        weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);

        List<WeddingParticipant> participants = participantRepository.findByWeddingId(weddingId);
        return participants.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ParticipantResponse addParticipant(Long weddingId, AddParticipantRequest request, User currentUser) {
        Wedding wedding = weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);

        if (wedding.getStatus() == WeddingStatus.CLOSED || wedding.getStatus() == WeddingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wedding is closed or cancelled");
        }

        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + request.getEmail()));

        if (targetUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Target user must be of role USER");
        }

        WeddingParticipant participant = participantRepository.findByWeddingIdAndUserId(weddingId, targetUser.getId())
                .orElse(null);

        if (participant != null) {
            if (participant.getStatus() == ParticipantStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already an active participant");
            } else {
                participant.setStatus(ParticipantStatus.ACTIVE);
                participant.setRemovedAt(null);
                participant = participantRepository.save(participant);
                return toResponse(participant);
            }
        }

        participant = new WeddingParticipant();
        participant.setWeddingId(weddingId);
        participant.setUserId(targetUser.getId());
        participant.setStatus(ParticipantStatus.ACTIVE);
        participant = participantRepository.save(participant);

        return toResponse(participant);
    }

    @Transactional
    public ParticipantResponse removeParticipant(Long weddingId, Long userId, User currentUser) {
        weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);

        WeddingParticipant participant = participantRepository.findByWeddingIdAndUserId(weddingId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found"));

        participant.setStatus(ParticipantStatus.REMOVED);
        participant.setRemovedAt(LocalDateTime.now());
        participant = participantRepository.save(participant);

        return toResponse(participant);
    }

    private ParticipantResponse toResponse(WeddingParticipant participant) {
        User user = userRepository.findById(participant.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found for participant"));

        ParticipantResponse response = new ParticipantResponse();
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setGender(user.getGender());
        response.setProfileStatus(user.getProfileStatus());
        response.setHasPrimaryPhoto(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(user.getId()));
        response.setParticipantStatus(participant.getStatus());
        response.setJoinedAt(participant.getJoinedAt());
        response.setRemovedAt(participant.getRemovedAt());
        return response;
    }
}
