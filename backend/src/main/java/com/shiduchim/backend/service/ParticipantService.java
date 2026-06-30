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
import com.shiduchim.backend.dto.wedding.StaffParticipantDetailsResponse;
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
        Wedding wedding = weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);

        if (wedding.getStatus() == WeddingStatus.CLOSED || wedding.getStatus() == WeddingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove participant from a closed or cancelled wedding");
        }

        WeddingParticipant participant = participantRepository.findByWeddingIdAndUserId(weddingId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found"));

        participant.setStatus(ParticipantStatus.REMOVED);
        participant.setRemovedAt(LocalDateTime.now());
        participant = participantRepository.save(participant);

        return toResponse(participant);
    }

    @Transactional
    public ParticipantResponse restoreParticipant(Long weddingId, Long userId, User currentUser) {
        Wedding wedding = weddingService.getWeddingEntityAndCheckOwner(weddingId, currentUser);

        if (wedding.getStatus() == WeddingStatus.CLOSED || wedding.getStatus() == WeddingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot restore participant in a closed or cancelled wedding");
        }

        WeddingParticipant participant = participantRepository.findByWeddingIdAndUserId(weddingId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found"));

        if (participant.getStatus() == ParticipantStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Participant is already active");
        }

        participant.setStatus(ParticipantStatus.ACTIVE);
        participant.setRemovedAt(null);
        participant = participantRepository.save(participant);

        return toResponse(participant);
    }

    public StaffParticipantDetailsResponse getParticipantDetails(Long requestedWeddingId, Long userId, User currentUser) {
        // Confirm requested wedding access (this ensures currentUser is owner or admin)
        Wedding requestedWedding = weddingService.getWeddingEntityAndCheckOwner(requestedWeddingId, currentUser);

        // Confirm target user is or was a participant in the requested wedding
        WeddingParticipant requestedParticipant = participantRepository.findByWeddingIdAndUserId(requestedWeddingId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user is not a participant in the requested wedding"));

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return buildStaffParticipantDetailsResponse(targetUser, currentUser);
    }

    public StaffParticipantDetailsResponse getAdminUserDetails(Long userId, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN || Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return buildStaffParticipantDetailsResponse(targetUser, currentUser);
    }

    private StaffParticipantDetailsResponse buildStaffParticipantDetailsResponse(User targetUser, User currentUser) {
        StaffParticipantDetailsResponse response = new StaffParticipantDetailsResponse();
        response.setUserId(targetUser.getId());
        response.setFullName(targetUser.getFullName());
        response.setEmail(targetUser.getEmail());
        response.setGender(targetUser.getGender());
        response.setRole(targetUser.getRole());
        response.setProfileStatus(targetUser.getProfileStatus());
        response.setAdminBlocked(targetUser.getAdminBlocked());
        response.setHasPrimaryPhoto(userPhotoRepository.existsByUserIdAndIsPrimaryTrue(targetUser.getId()));

        List<com.shiduchim.backend.entity.UserPhoto> photos = userPhotoRepository.findByUserIdOrderByOrderIndexAscCreatedAtAsc(targetUser.getId());
        response.setPhotos(photos.stream().map(p -> new com.shiduchim.backend.dto.photo.PhotoResponse(
                p.getId(), p.getImageUrl(), p.getIsPrimary(), p.getOrderIndex(), p.getCreatedAt()
        )).collect(Collectors.toList()));

        response.setAge(targetUser.getAge());
        response.setHeightCm(targetUser.getHeightCm());
        response.setAreaOfResidence(targetUser.getAreaOfResidence());
        response.setReligiousLevel(targetUser.getReligiousLevel());

        response.setPhone(targetUser.getPhone());
        response.setEducation(targetUser.getEducation());
        response.setOccupation(targetUser.getOccupation());
        response.setSelfDescription(targetUser.getSelfDescription());
        response.setHobbies(targetUser.getHobbies());
        response.setLookingFor(targetUser.getLookingFor());
        response.setFamilyDescription(targetUser.getFamilyDescription());
        response.setHeadCovering(targetUser.getHeadCovering());
        response.setHasDrivingLicense(targetUser.getHasDrivingLicense());

        // Manageable weddings
        List<WeddingParticipant> allParticipations = participantRepository.findByUserId(targetUser.getId());
        List<com.shiduchim.backend.dto.wedding.StaffParticipantWeddingResponse> manageableWeddings = allParticipations.stream()
                .map(p -> {
                    try {
                        Wedding w = weddingService.getWeddingEntityAndCheckOwner(p.getWeddingId(), currentUser);
                        com.shiduchim.backend.dto.wedding.StaffParticipantWeddingResponse wr = new com.shiduchim.backend.dto.wedding.StaffParticipantWeddingResponse();
                        wr.setWeddingId(w.getId());
                        wr.setWeddingName(w.getName());
                        wr.setWeddingStatus(w.getStatus());
                        wr.setParticipantStatus(p.getStatus());
                        wr.setJoinedAt(p.getJoinedAt());
                        wr.setRemovedAt(p.getRemovedAt());
                        boolean isActiveWedding = w.getStatus() == WeddingStatus.ACTIVE;
                        wr.setCanRemove(isActiveWedding && p.getStatus() == ParticipantStatus.ACTIVE);
                        wr.setCanRestore(isActiveWedding && p.getStatus() == ParticipantStatus.REMOVED);
                        return wr;
                    } catch (Exception e) {
                        return null; // Not owner/admin of this wedding, skip
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        response.setManageableWeddings(manageableWeddings);

        // Permissions
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN && !Boolean.TRUE.equals(currentUser.getAdminBlocked());
        response.setCanAdminBlock(isAdmin && !Boolean.TRUE.equals(targetUser.getAdminBlocked()) && targetUser.getRole() != UserRole.ADMIN);
        response.setCanAdminUnblock(isAdmin && Boolean.TRUE.equals(targetUser.getAdminBlocked()) && targetUser.getRole() != UserRole.ADMIN);

        return response;
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
