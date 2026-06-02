package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.profile.*;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final UserPhotoRepository userPhotoRepository;
    private final com.shiduchim.backend.repository.WeddingParticipantRepository weddingParticipantRepository;

    public ProfileService(UserRepository userRepository, UserPhotoRepository userPhotoRepository,
                          com.shiduchim.backend.repository.WeddingParticipantRepository weddingParticipantRepository) {
        this.userRepository = userRepository;
        this.userPhotoRepository = userPhotoRepository;
        this.weddingParticipantRepository = weddingParticipantRepository;
    }

    // ─── GET /api/profile/me ──────────────────────────────────────────────────

    public ProfileMeResponse getMyProfile(User user) {
        requireUserRole(user);

        boolean hasPrimaryPhoto = userPhotoRepository.existsByUserIdAndIsPrimaryTrue(user.getId());
        long photoCount = userPhotoRepository.countByUserId(user.getId());

        ProfileMeResponse response = new ProfileMeResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setGender(user.getGender());
        response.setProfileStatus(user.getProfileStatus());
        response.setAdminBlocked(user.getAdminBlocked());
        response.setHasPrimaryPhoto(hasPrimaryPhoto);
        response.setPhotoCount(photoCount);
        response.setAge(user.getAge());
        response.setHeightCm(user.getHeightCm());
        response.setAreaOfResidence(user.getAreaOfResidence());
        response.setReligiousLevel(user.getReligiousLevel());
        response.setPhone(user.getPhone());
        response.setEducation(user.getEducation());
        response.setOccupation(user.getOccupation());
        response.setSelfDescription(user.getSelfDescription());
        response.setHobbies(user.getHobbies());
        response.setLookingFor(user.getLookingFor());
        response.setFamilyDescription(user.getFamilyDescription());
        response.setHeadCovering(user.getHeadCovering());
        response.setHasDrivingLicense(user.getHasDrivingLicense());
        return response;
    }

    // ─── PUT /api/profile/basic ───────────────────────────────────────────────

    public BasicProfileResponse updateBasicProfile(User user, BasicProfileRequest request) {
        requireUserRole(user);

        // Apply the writable basic fields (gender and email are NOT changed here)
        user.setFullName(request.getFullName());
        user.setAge(request.getAge());
        user.setHeightCm(request.getHeightCm());
        user.setAreaOfResidence(request.getAreaOfResidence());
        user.setReligiousLevel(request.getReligiousLevel());
        user.setPhone(request.getPhone());

        // Compute missing fields for BASIC (includes gender & email already on user)
        List<String> missingFields = computeBasicMissingFields(user);

        // Advance profileStatus only if BASIC fields are complete
        if (missingFields.isEmpty()) {
            ProfileStatus current = user.getProfileStatus();
            if (current == ProfileStatus.NONE) {
                user.setProfileStatus(ProfileStatus.BASIC);
            }
            // If BASIC, FULL, or FULL_INCOMPLETE_BLOCKED — do not downgrade
        }

        userRepository.save(user);

        boolean hasPrimaryPhoto = userPhotoRepository.existsByUserIdAndIsPrimaryTrue(user.getId());
        return new BasicProfileResponse(user.getProfileStatus(), missingFields, hasPrimaryPhoto);
    }

    // ─── PUT /api/profile/full ────────────────────────────────────────────────

    public FullProfileResponse updateFullProfile(User user, FullProfileRequest request) {
        requireUserRole(user);

        // Apply full fields
        user.setEducation(request.getEducation());
        user.setOccupation(request.getOccupation());
        user.setSelfDescription(request.getSelfDescription());
        user.setHobbies(request.getHobbies());
        user.setLookingFor(request.getLookingFor());
        user.setFamilyDescription(request.getFamilyDescription());
        user.setHeadCovering(request.getHeadCovering());
        user.setHasDrivingLicense(request.getHasDrivingLicense());

        // Collect all missing fields (basic + full required)
        List<String> missingFields = computeAllMissingFields(user);

        ProfileStatus current = user.getProfileStatus();

        if (missingFields.isEmpty()) {
            // All required fields are present → promote to FULL (covers FULL_INCOMPLETE_BLOCKED → FULL)
            user.setProfileStatus(ProfileStatus.FULL);
        } else {
            // Some required fields are missing
            if (current == ProfileStatus.FULL) {
                // Was FULL and now incomplete → block
                user.setProfileStatus(ProfileStatus.FULL_INCOMPLETE_BLOCKED);
            }
            // If NONE / BASIC / already FULL_INCOMPLETE_BLOCKED → leave status as-is
        }

        userRepository.save(user);

        boolean globalPoolEnabled = user.getProfileStatus() == ProfileStatus.FULL;
        return new FullProfileResponse(user.getProfileStatus(), globalPoolEnabled, missingFields);
    }

    // ─── GET /api/profiles/{userId} ───────────────────────────────────────────

    public PublicProfileResponse getPublicProfile(User currentUser, Long targetUserId) {
        requireUserRole(currentUser);

        if (currentUser.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot view own profile via this endpoint");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (targetUser.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user is not a USER");
        }
        if (Boolean.TRUE.equals(targetUser.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user is blocked");
        }
        if (currentUser.getGender() != null && currentUser.getGender() == targetUser.getGender()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Same-gender viewing is not allowed");
        }

        List<com.shiduchim.backend.entity.UserPhoto> targetPhotos = userPhotoRepository.findByUserIdOrderByOrderIndexAscCreatedAtAsc(targetUserId);
        String primaryPhotoUrl = null;
        String additionalPhotoUrl = null;
        for (com.shiduchim.backend.entity.UserPhoto photo : targetPhotos) {
            if (Boolean.TRUE.equals(photo.getIsPrimary())) {
                primaryPhotoUrl = photo.getImageUrl();
            } else if (additionalPhotoUrl == null) {
                additionalPhotoUrl = photo.getImageUrl();
            }
        }

        if (primaryPhotoUrl == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user has no primary photo");
        }

        boolean eligibleGlobal = (targetUser.getProfileStatus() == ProfileStatus.FULL);
        boolean eligibleWedding = false;

        if (targetUser.getProfileStatus() == ProfileStatus.BASIC || targetUser.getProfileStatus() == ProfileStatus.FULL) {
            eligibleWedding = weddingParticipantRepository.existsSharedActiveWedding(currentUser.getId(), targetUserId);
        }

        if (!eligibleGlobal && !eligibleWedding) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Target user is not eligible in any shared context");
        }

        PublicProfileResponse response = new PublicProfileResponse();
        response.setUserId(targetUser.getId());
        response.setPrimaryPhotoUrl(primaryPhotoUrl);
        response.setAdditionalPhotoUrl(additionalPhotoUrl);
        response.setFullName(targetUser.getFullName());
        response.setAge(targetUser.getAge());
        response.setHeightCm(targetUser.getHeightCm());
        response.setAreaOfResidence(targetUser.getAreaOfResidence());
        response.setReligiousLevel(targetUser.getReligiousLevel());
        response.setEducation(targetUser.getEducation());
        response.setOccupation(targetUser.getOccupation());
        response.setSelfDescription(targetUser.getSelfDescription());
        response.setHobbies(targetUser.getHobbies());
        response.setFamilyDescription(targetUser.getFamilyDescription());
        response.setLookingFor(targetUser.getLookingFor());
        response.setHeadCovering(targetUser.getHeadCovering());
        response.setHasDrivingLicense(targetUser.getHasDrivingLicense());

        return response;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void requireUserRole(User user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        if (user.getRole() != UserRole.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access restricted to USER role");
        }
        if (Boolean.TRUE.equals(user.getAdminBlocked())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is blocked");
        }
    }

    /**
     * Returns the list of BASIC required field names that are blank/null on the user.
     * Note: gender and email are already set during registration.
     */
    private List<String> computeBasicMissingFields(User user) {
        List<String> missing = new ArrayList<>();
        if (isBlank(user.getFullName()))         missing.add("fullName");
        if (user.getGender() == null)            missing.add("gender");
        if (user.getAge() == null)               missing.add("age");
        if (user.getHeightCm() == null)          missing.add("heightCm");
        if (isBlank(user.getAreaOfResidence()))  missing.add("areaOfResidence");
        if (isBlank(user.getReligiousLevel()))   missing.add("religiousLevel");
        if (isBlank(user.getPhone()))            missing.add("phone");
        if (isBlank(user.getEmail()))            missing.add("email");
        return missing;
    }

    /**
     * Returns all missing required fields (basic + full required).
     */
    private List<String> computeAllMissingFields(User user) {
        List<String> missing = computeBasicMissingFields(user);
        if (isBlank(user.getEducation()))        missing.add("education");
        if (isBlank(user.getOccupation()))       missing.add("occupation");
        if (isBlank(user.getSelfDescription()))  missing.add("selfDescription");
        if (isBlank(user.getHobbies()))          missing.add("hobbies");
        if (isBlank(user.getLookingFor()))       missing.add("lookingFor");
        return missing;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
