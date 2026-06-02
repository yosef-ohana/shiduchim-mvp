package com.shiduchim.backend.controller;

import com.shiduchim.backend.dto.user.MeResponse;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.repository.UserPhotoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserPhotoRepository userPhotoRepository;

    public UserController(UserPhotoRepository userPhotoRepository) {
        this.userPhotoRepository = userPhotoRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        if (Boolean.TRUE.equals(user.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is blocked");
        }

        boolean hasPrimaryPhoto = userPhotoRepository.existsByUserIdAndIsPrimaryTrue(user.getId());
        long photoCount = userPhotoRepository.countByUserId(user.getId());

        MeResponse response = new MeResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getGender(),
                user.getProfileStatus(),
                user.getAdminBlocked(),
                hasPrimaryPhoto,
                photoCount
        );

        return ResponseEntity.ok(response);
    }
}
