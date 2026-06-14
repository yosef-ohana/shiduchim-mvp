package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.wedding.CreateWeddingInviteRequest;
import com.shiduchim.backend.dto.wedding.WeddingInviteResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.entity.WeddingInvite;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.enums.WeddingInviteStatus;
import com.shiduchim.backend.repository.WeddingInviteRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.enums.WeddingStatus;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.entity.WeddingParticipant;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WeddingInviteService {

    private final WeddingInviteRepository weddingInviteRepository;
    private final WeddingService weddingService;
    private final UserRepository userRepository;
    private final WeddingParticipantRepository weddingParticipantRepository;

    public WeddingInviteService(WeddingInviteRepository weddingInviteRepository,
                                WeddingService weddingService,
                                UserRepository userRepository,
                                WeddingParticipantRepository weddingParticipantRepository) {
        this.weddingInviteRepository = weddingInviteRepository;
        this.weddingService = weddingService;
        this.userRepository = userRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
    }

    @Transactional
    public WeddingInviteResponse createInvite(Long weddingId, CreateWeddingInviteRequest request, User currentUser) {
        Wedding wedding = weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);
        
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Optional<WeddingInvite> existingPending = weddingInviteRepository.findByWeddingIdAndEmailAndStatus(weddingId, normalizedEmail, WeddingInviteStatus.PENDING);
        if (existingPending.isPresent()) {
            return toResponse(existingPending.get());
        }

        Optional<WeddingInvite> existingAccepted = weddingInviteRepository.findByWeddingIdAndEmailAndStatus(weddingId, normalizedEmail, WeddingInviteStatus.ACCEPTED);
        if (existingAccepted.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invite already accepted for this email");
        }

        WeddingInvite invite = new WeddingInvite();
        invite.setWeddingId(weddingId);
        invite.setFullName(request.getFullName());
        invite.setEmail(normalizedEmail);
        invite.setStatus(WeddingInviteStatus.PENDING);
        invite.setInvitedByUserId(currentUser.getId());
        
        invite = weddingInviteRepository.save(invite);
        return toResponse(invite);
    }

    public List<WeddingInviteResponse> getInvites(Long weddingId, User currentUser) {
        weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);
        
        List<WeddingInvite> invites = weddingInviteRepository.findByWeddingId(weddingId);
        return invites.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public WeddingInviteResponse cancelInvite(Long weddingId, Long inviteId, User currentUser) {
        weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);
        
        WeddingInvite invite = weddingInviteRepository.findById(inviteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invite not found"));
                
        if (!invite.getWeddingId().equals(weddingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invite does not belong to this wedding");
        }
        
        if (invite.getStatus() != WeddingInviteStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending invites can be cancelled");
        }
        
        invite.setStatus(WeddingInviteStatus.CANCELLED);
        invite = weddingInviteRepository.save(invite);
        return toResponse(invite);
    }

    @Transactional
    public WeddingInviteResponse restoreInvite(Long weddingId, Long inviteId, User currentUser) {
        Wedding wedding = weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);
        
        if (wedding.getStatus() != WeddingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot restore invite for closed or cancelled wedding");
        }

        WeddingInvite invite = weddingInviteRepository.findById(inviteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invite not found"));
                
        if (!invite.getWeddingId().equals(weddingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invite does not belong to this wedding");
        }
        
        if (invite.getStatus() != WeddingInviteStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only cancelled invites can be restored");
        }

        String email = invite.getEmail();

        Optional<WeddingInvite> existingPending = weddingInviteRepository.findByWeddingIdAndEmailAndStatus(weddingId, email, WeddingInviteStatus.PENDING);
        if (existingPending.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending invite already exists for this email");
        }

        Optional<WeddingInvite> existingAccepted = weddingInviteRepository.findByWeddingIdAndEmailAndStatus(weddingId, email, WeddingInviteStatus.ACCEPTED);
        if (existingAccepted.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An accepted invite already exists for this email");
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            Optional<WeddingParticipant> participant = weddingParticipantRepository.findByWeddingIdAndUserId(weddingId, existingUser.get().getId());
            if (participant.isPresent() && participant.get().getStatus() == ParticipantStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already an active participant in this wedding");
            }
        }

        invite.setStatus(WeddingInviteStatus.PENDING);
        invite = weddingInviteRepository.save(invite);
        return toResponse(invite);
    }

    private WeddingInviteResponse toResponse(WeddingInvite invite) {
        WeddingInviteResponse response = new WeddingInviteResponse();
        response.setId(invite.getId());
        response.setWeddingId(invite.getWeddingId());
        response.setFullName(invite.getFullName());
        response.setEmail(invite.getEmail());
        response.setStatus(invite.getStatus());
        response.setInvitedByUserId(invite.getInvitedByUserId());
        response.setAcceptedUserId(invite.getAcceptedUserId());
        response.setCreatedAt(invite.getCreatedAt());
        response.setAcceptedAt(invite.getAcceptedAt());
        return response;
    }
}
