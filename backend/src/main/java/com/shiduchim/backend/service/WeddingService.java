package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.wedding.*;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.entity.WeddingInvite;
import com.shiduchim.backend.entity.WeddingParticipant;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.enums.WeddingInviteStatus;
import com.shiduchim.backend.enums.WeddingStatus;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.WeddingInviteRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class WeddingService {

    private final WeddingRepository weddingRepository;
    private final WeddingParticipantRepository participantRepository;
    private final MatchRepository matchRepository;
    private final WeddingInviteRepository weddingInviteRepository;

    public WeddingService(WeddingRepository weddingRepository,
                          WeddingParticipantRepository participantRepository,
                          MatchRepository matchRepository,
                          WeddingInviteRepository weddingInviteRepository) {
        this.weddingRepository = weddingRepository;
        this.participantRepository = participantRepository;
        this.matchRepository = matchRepository;
        this.weddingInviteRepository = weddingInviteRepository;
    }

    private void requireEventManagerOrAdmin(User user) {
        if (user.getRole() != UserRole.EVENT_MANAGER && user.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only EVENT_MANAGER or ADMIN allowed");
        }
    }

    private void requireUserRole(User user) {
        if (user.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only USER allowed");
        }
    }

    @Transactional
    public WeddingResponse createWedding(WeddingCreateRequest request, User currentUser) {
        requireEventManagerOrAdmin(currentUser);

        String code = request.getAccessCode();
        if (code == null || code.trim().isEmpty()) {
            code = generateUniqueAccessCode();
        } else {
            if (weddingRepository.existsByAccessCode(code)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Access code already exists");
            }
        }

        Wedding wedding = new Wedding();
        wedding.setName(request.getName());
        wedding.setCity(request.getCity());
        wedding.setWeddingDate(request.getWeddingDate());
        wedding.setAccessCode(code);
        wedding.setOwnerUserId(currentUser.getId());
        wedding.setStatus(WeddingStatus.ACTIVE);

        wedding = weddingRepository.save(wedding);
        return toResponse(wedding);
    }

    public List<WeddingResponse> getWeddings(User currentUser) {
        requireEventManagerOrAdmin(currentUser);
        List<Wedding> weddings;
        if (currentUser.getRole() == UserRole.ADMIN) {
            weddings = weddingRepository.findAll();
        } else {
            weddings = weddingRepository.findByOwnerUserId(currentUser.getId());
        }
        return weddings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserWeddingResponse> getMyWeddings(User currentUser) {
        requireUserRole(currentUser);

        List<WeddingParticipant> participations = participantRepository.findByUserId(currentUser.getId());
        if (participations.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<Long> weddingIds = participations.stream()
                .map(WeddingParticipant::getWeddingId)
                .collect(Collectors.toList());

        List<Wedding> weddings = weddingRepository.findAllById(weddingIds);
        java.util.Map<Long, Wedding> weddingMap = weddings.stream()
                .collect(Collectors.toMap(Wedding::getId, w -> w));

        return participations.stream()
                .map(participant -> {
                    Wedding wedding = weddingMap.get(participant.getWeddingId());
                    if (wedding == null) return null;

                    UserWeddingResponse response = new UserWeddingResponse();
                    response.setWeddingId(wedding.getId());
                    response.setWeddingName(wedding.getName());
                    response.setCity(wedding.getCity());
                    response.setWeddingDate(wedding.getWeddingDate());
                    response.setWeddingStatus(wedding.getStatus());
                    response.setParticipantStatus(participant.getStatus());
                    response.setJoinedAt(participant.getJoinedAt());

                    boolean isEligible = wedding.getStatus() == WeddingStatus.ACTIVE
                            && participant.getStatus() == ParticipantStatus.ACTIVE;
                    response.setWeddingPoolEligible(isEligible);

                    return response;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    public WeddingResponse getWedding(Long id, User currentUser) {
        requireEventManagerOrAdmin(currentUser);
        Wedding wedding = weddingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));

        if (currentUser.getRole() != UserRole.ADMIN && !wedding.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner of this wedding");
        }

        return toResponse(wedding);
    }

    @Transactional
    public JoinWeddingResponse joinWedding(JoinWeddingRequest request, User currentUser) {
        requireUserRole(currentUser);

        Wedding wedding = weddingRepository.findByAccessCode(request.getAccessCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));

        if (wedding.getStatus() == WeddingStatus.CLOSED || wedding.getStatus() == WeddingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Wedding is closed or cancelled");
        }

        WeddingParticipant participant = participantRepository.findByWeddingIdAndUserId(wedding.getId(), currentUser.getId())
                .orElse(null);

        if (participant != null) {
            if (participant.getStatus() == ParticipantStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Already joined this wedding");
            } else {
                participant.setStatus(ParticipantStatus.ACTIVE);
                participant.setRemovedAt(null);
                participant.setJoinedAt(LocalDateTime.now());
                participant = participantRepository.save(participant);
            }
        } else {
            participant = new WeddingParticipant();
            participant.setWeddingId(wedding.getId());
            participant.setUserId(currentUser.getId());
            participant.setStatus(ParticipantStatus.ACTIVE);
            participant = participantRepository.save(participant);
        }

        String normalizedEmail = currentUser.getEmail().trim().toLowerCase();
        weddingInviteRepository.findByWeddingIdAndEmailAndStatus(wedding.getId(), normalizedEmail, WeddingInviteStatus.PENDING)
                .ifPresent(invite -> {
                    invite.setStatus(WeddingInviteStatus.ACCEPTED);
                    invite.setAcceptedUserId(currentUser.getId());
                    invite.setAcceptedAt(LocalDateTime.now());
                    weddingInviteRepository.save(invite);
                });

        JoinWeddingResponse response = new JoinWeddingResponse();
        response.setWeddingId(wedding.getId());
        response.setWeddingName(wedding.getName());
        response.setParticipantStatus(participant.getStatus());
        response.setJoinedAt(participant.getJoinedAt());
        return response;
    }

    @Transactional
    public WeddingResponse closeWedding(Long id, User currentUser) {
        Wedding wedding = getWeddingEntityAndCheckOwner(id, currentUser);
        wedding.setStatus(WeddingStatus.CLOSED);
        wedding = weddingRepository.save(wedding);
        return toResponse(wedding);
    }

    @Transactional
    public WeddingResponse cancelWedding(Long id, User currentUser) {
        Wedding wedding = getWeddingEntityAndCheckOwner(id, currentUser);
        wedding.setStatus(WeddingStatus.CANCELLED);
        wedding = weddingRepository.save(wedding);
        return toResponse(wedding);
    }

    public Wedding getWeddingEntityAndCheckOwner(Long id, User currentUser) {
        requireEventManagerOrAdmin(currentUser);
        Wedding wedding = weddingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));

        if (currentUser.getRole() != UserRole.ADMIN && !wedding.getOwnerUserId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner of this wedding");
        }
        return wedding;
    }

    private WeddingResponse toResponse(Wedding wedding) {
        WeddingResponse response = new WeddingResponse();
        response.setId(wedding.getId());
        response.setName(wedding.getName());
        response.setCity(wedding.getCity());
        response.setWeddingDate(wedding.getWeddingDate());
        response.setAccessCode(wedding.getAccessCode());
        response.setOwnerUserId(wedding.getOwnerUserId());
        response.setStatus(wedding.getStatus());

        response.setParticipantsCount(participantRepository.countByWeddingIdAndStatus(wedding.getId(), ParticipantStatus.ACTIVE));
        response.setMatchesCount(matchRepository.countByWeddingIdAndStatus(wedding.getId(), MatchStatus.ACTIVE));

        return response;
    }

    private String generateUniqueAccessCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        int maxAttempts = 10;
        for (int i = 0; i < maxAttempts; i++) {
            StringBuilder code = new StringBuilder();
            for (int j = 0; j < 6; j++) {
                code.append(chars.charAt(random.nextInt(chars.length())));
            }
            if (!weddingRepository.existsByAccessCode(code.toString())) {
                return code.toString();
            }
        }
        throw new RuntimeException("Could not generate unique access code");
    }

    public ValidateWeddingCodeResponse validateCode(ValidateWeddingCodeRequest request) {
        ValidateWeddingCodeResponse response = new ValidateWeddingCodeResponse();
        
        if (request.getAccessCode() == null || request.getAccessCode().trim().isEmpty()) {
            response.setValid(false);
            response.setJoinAllowed(false);
            response.setMessage("Wedding code not provided");
            return response;
        }

        Wedding wedding = weddingRepository.findByAccessCode(request.getAccessCode()).orElse(null);

        if (wedding == null) {
            response.setValid(false);
            response.setJoinAllowed(false);
            response.setMessage("Wedding code not found");
            return response;
        }

        response.setValid(true);
        response.setWeddingId(wedding.getId());
        response.setWeddingName(wedding.getName());
        response.setCity(wedding.getCity());
        response.setWeddingDate(wedding.getWeddingDate());
        response.setStatus(wedding.getStatus());

        if (wedding.getStatus() == WeddingStatus.ACTIVE) {
            response.setJoinAllowed(true);
            response.setMessage("Valid wedding code");
        } else {
            response.setJoinAllowed(false);
            response.setMessage("This wedding is not open for joining");
        }

        return response;
    }
}
