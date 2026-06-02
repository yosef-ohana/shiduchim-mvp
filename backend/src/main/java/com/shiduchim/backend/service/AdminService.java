package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.admin.AdminUserResponse;
import com.shiduchim.backend.dto.admin.AdminWeddingResponse;
import com.shiduchim.backend.dto.admin.CreateEventManagerRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

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

    public List<AdminWeddingResponse> getWeddings(User currentUser) {
        validateAdmin(currentUser);
        return weddingRepository.findAll().stream()
                .map(wedding -> {
                    long participants = weddingParticipantRepository.countByWeddingIdAndStatus(wedding.getId(), ParticipantStatus.ACTIVE);
                    long matches = matchRepository.countByWeddingIdAndStatus(wedding.getId(), MatchStatus.ACTIVE);
                    return new AdminWeddingResponse(wedding, participants, matches);
                })
                .collect(Collectors.toList());
    }

    public AdminWeddingResponse assignSelfToWedding(Long weddingId, User currentUser) {
        validateAdmin(currentUser);
        Wedding wedding = weddingRepository.findById(weddingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wedding not found"));

        wedding.setOwnerUserId(currentUser.getId());
        wedding = weddingRepository.save(wedding);

        long participants = weddingParticipantRepository.countByWeddingIdAndStatus(wedding.getId(), ParticipantStatus.ACTIVE);
        long matches = matchRepository.countByWeddingIdAndStatus(wedding.getId(), MatchStatus.ACTIVE);

        return new AdminWeddingResponse(wedding, participants, matches);
    }
}
