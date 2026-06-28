package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.admin.AdminUserResponse;
import com.shiduchim.backend.dto.admin.AdminWeddingResponse;
import com.shiduchim.backend.dto.admin.AdminCreateWeddingRequest;
import com.shiduchim.backend.dto.admin.AssignManagerRequest;
import com.shiduchim.backend.dto.admin.CreateEventManagerRequest;
import com.shiduchim.backend.dto.admin.AdminDashboardResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.enums.WeddingStatus;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final WeddingRepository weddingRepository;
    private final WeddingParticipantRepository weddingParticipantRepository;
    private final MatchRepository matchRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        WeddingRepository weddingRepository,
                        WeddingParticipantRepository weddingParticipantRepository,
                        MatchRepository matchRepository,
                        BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.weddingRepository = weddingRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
        this.matchRepository = matchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void validateAdmin(User currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (currentUser.getRole() != UserRole.ADMIN || Boolean.TRUE.equals(currentUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }
    }

    public AdminUserResponse createEventManager(CreateEventManagerRequest request, User currentUser) {
        validateAdmin(currentUser);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(UserRole.EVENT_MANAGER);
        user.setProfileStatus(ProfileStatus.NONE);
        user.setAdminBlocked(false);

        user = userRepository.save(user);

        return new AdminUserResponse(user);
    }

    public List<AdminUserResponse> getEventManagers(User currentUser) {
        validateAdmin(currentUser);
        return userRepository.findByRole(UserRole.EVENT_MANAGER).stream()
                .map(AdminUserResponse::new)
                .collect(Collectors.toList());
    }

    public AdminUserResponse blockEventManager(Long userId, User currentUser) {
        return toggleEventManagerStatus(userId, currentUser, true);
    }

    public AdminUserResponse unblockEventManager(Long userId, User currentUser) {
        return toggleEventManagerStatus(userId, currentUser, false);
    }

    public AdminUserResponse deactivateEventManager(Long userId, User currentUser) {
        return toggleEventManagerStatus(userId, currentUser, true);
    }

    private AdminUserResponse toggleEventManagerStatus(Long userId, User currentUser, boolean block) {
        validateAdmin(currentUser);
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (target.getRole() != UserRole.EVENT_MANAGER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not an Event Manager");
        }

        target.setAdminBlocked(block);
        return new AdminUserResponse(userRepository.save(target));
    }

    public List<AdminUserResponse> getUsers(User currentUser) {
        validateAdmin(currentUser);
        return userRepository.findAll().stream()
                .map(AdminUserResponse::new)
                .collect(Collectors.toList());
    }

    public AdminUserResponse blockUser(Long userId, User currentUser) {
        validateAdmin(currentUser);
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (!Boolean.TRUE.equals(target.getAdminBlocked()) && target.getRole() == UserRole.ADMIN) {
            long activeAdmins = userRepository.countByRoleAndAdminBlockedFalse(UserRole.ADMIN);
            if (activeAdmins <= 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot block the last active admin");
            }
        }
        
        target.setAdminBlocked(true);
        target = userRepository.save(target);
        return new AdminUserResponse(target);
    }

    public AdminUserResponse unblockUser(Long userId, User currentUser) {
        validateAdmin(currentUser);
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        target.setAdminBlocked(false);
        target = userRepository.save(target);
        return new AdminUserResponse(target);
    }

    public AdminWeddingResponse toAdminWeddingResponse(Wedding wedding) {
        long participants = weddingParticipantRepository.countByWeddingIdAndStatus(wedding.getId(), ParticipantStatus.ACTIVE);
        long matches = matchRepository.countByWeddingIdAndStatus(wedding.getId(), MatchStatus.ACTIVE);
        String ownerName = null;
        String ownerEmail = null;
        if (wedding.getOwnerUserId() != null) {
            User owner = userRepository.findById(wedding.getOwnerUserId()).orElse(null);
            if (owner != null) {
                ownerName = owner.getFullName();
                ownerEmail = owner.getEmail();
            }
        }
        return new AdminWeddingResponse(wedding, participants, matches, ownerName, ownerEmail);
    }

    public List<AdminWeddingResponse> getWeddings(User currentUser) {
        validateAdmin(currentUser);
        return weddingRepository.findAll().stream()
                .map(this::toAdminWeddingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminWeddingResponse createWedding(AdminCreateWeddingRequest request, User currentUser) {
        validateAdmin(currentUser);

        Long ownerId = request.getOwnerUserId();
        if (ownerId != null) {
            User ownerUser = userRepository.findById(ownerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner user not found"));
            if (ownerUser.getRole() != UserRole.EVENT_MANAGER && ownerUser.getRole() != UserRole.ADMIN) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner must be EVENT_MANAGER or ADMIN");
            }
        } else {
            ownerId = currentUser.getId();
        }

        String code = request.getAccessCode();
        if (code != null) {
            code = code.trim();
        }
        if (code == null || code.isEmpty()) {
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
        wedding.setOwnerUserId(ownerId);
        wedding.setStatus(WeddingStatus.ACTIVE);

        wedding = weddingRepository.save(wedding);
        return toAdminWeddingResponse(wedding);
    }

    @Transactional
    public AdminWeddingResponse assignManagerToWedding(Long weddingId, AssignManagerRequest request, User currentUser) {
        validateAdmin(currentUser);

        if (request == null || request.getManagerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Manager ID must not be null");
        }

        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));

        ensureWeddingActiveForOwnerAssignment(wedding);
        ensureDifferentOwner(wedding, request.getManagerId());

        User ownerUser = userRepository.findById(request.getManagerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager user not found"));
        if (ownerUser.getRole() != UserRole.EVENT_MANAGER && ownerUser.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user must be EVENT_MANAGER or ADMIN");
        }

        wedding.setOwnerUserId(ownerUser.getId());
        wedding = weddingRepository.save(wedding);

        return toAdminWeddingResponse(wedding);
    }

    @Transactional
    public AdminWeddingResponse closeWedding(Long weddingId, User currentUser) {
        validateAdmin(currentUser);
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));
        wedding.setStatus(WeddingStatus.CLOSED);
        wedding = weddingRepository.save(wedding);
        return toAdminWeddingResponse(wedding);
    }

    @Transactional
    public AdminWeddingResponse cancelWedding(Long weddingId, User currentUser) {
        validateAdmin(currentUser);
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));
        wedding.setStatus(WeddingStatus.CANCELLED);
        wedding = weddingRepository.save(wedding);
        return toAdminWeddingResponse(wedding);
    }

    @Transactional
    public AdminWeddingResponse assignSelfToWedding(Long weddingId, User currentUser) {
        validateAdmin(currentUser);
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));

        ensureWeddingActiveForOwnerAssignment(wedding);
        ensureDifferentOwner(wedding, currentUser.getId());

        wedding.setOwnerUserId(currentUser.getId());
        wedding = weddingRepository.save(wedding);

        return toAdminWeddingResponse(wedding);
    }

    private void ensureWeddingActiveForOwnerAssignment(Wedding wedding) {
        if (wedding.getStatus() != WeddingStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change the owner of a closed or cancelled wedding");
        }
    }

    private void ensureDifferentOwner(Wedding wedding, Long newOwnerId) {
        if (newOwnerId != null && newOwnerId.equals(wedding.getOwnerUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected manager/admin is already the current owner of this wedding");
        }
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

    public AdminDashboardResponse getDashboard(User currentUser) {
        validateAdmin(currentUser);
        long usersCount = userRepository.countByRole(UserRole.USER);
        long eventManagersCount = userRepository.countByRole(UserRole.EVENT_MANAGER);
        long weddingsCount = weddingRepository.count();
        long activeWeddingsCount = weddingRepository.countByStatus(WeddingStatus.ACTIVE);
        return new AdminDashboardResponse(usersCount, eventManagersCount, weddingsCount, activeWeddingsCount);
    }
}
