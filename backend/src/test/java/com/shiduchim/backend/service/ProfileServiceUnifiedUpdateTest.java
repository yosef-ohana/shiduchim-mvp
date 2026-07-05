package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.profile.ProfileMeResponse;
import com.shiduchim.backend.dto.profile.ProfileUpdateTarget;
import com.shiduchim.backend.dto.profile.UnifiedProfileUpdateRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.Gender;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserPhotoRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceUnifiedUpdateTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserPhotoRepository userPhotoRepository;

    @Mock
    private WeddingParticipantRepository weddingParticipantRepository;

    @Mock
    private UserBlockService userBlockService;

    @InjectMocks
    private ProfileService profileService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setRole(UserRole.USER);
        user.setGender(Gender.MALE);
        user.setProfileStatus(ProfileStatus.NONE);
        user.setAdminBlocked(false);
    }

    private UnifiedProfileUpdateRequest createValidBasicRequest() {
        UnifiedProfileUpdateRequest req = new UnifiedProfileUpdateRequest();
        req.setTargetLevel(ProfileUpdateTarget.BASIC);
        req.setFullName("John Doe");
        req.setAge(25);
        req.setHeightCm(180);
        req.setAreaOfResidence("Jerusalem");
        req.setReligiousLevel("Orthodox");
        req.setPhone("1234567890");
        return req;
    }

    private UnifiedProfileUpdateRequest createValidFullRequest() {
        UnifiedProfileUpdateRequest req = createValidBasicRequest();
        req.setTargetLevel(ProfileUpdateTarget.FULL);
        req.setEducation("Yeshiva");
        req.setOccupation("Student");
        req.setSelfDescription("Good guy");
        req.setHobbies("Learning");
        req.setLookingFor("Good girl");
        return req;
    }

    @Test
    void testNoneToBasic() {
        UnifiedProfileUpdateRequest req = createValidBasicRequest();

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.BASIC, user.getProfileStatus());
        assertEquals("John Doe", user.getFullName());
        verify(userRepository).save(user);
    }

    @Test
    void testNoneToFull() {
        UnifiedProfileUpdateRequest req = createValidFullRequest();

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.FULL, user.getProfileStatus());
        assertEquals("John Doe", user.getFullName());
        assertEquals("Yeshiva", user.getEducation());
        verify(userRepository).save(user);
    }

    @Test
    void testBasicToFull() {
        user.setProfileStatus(ProfileStatus.BASIC);
        UnifiedProfileUpdateRequest req = createValidFullRequest();

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.FULL, user.getProfileStatus());
        verify(userRepository).save(user);
    }

    @Test
    void testFullToFullUpdatesBasicAndFullData() {
        user.setProfileStatus(ProfileStatus.FULL);
        UnifiedProfileUpdateRequest req = createValidFullRequest();
        req.setFullName("Updated Name");
        req.setEducation("Updated Education");

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.FULL, user.getProfileStatus());
        assertEquals("Updated Name", user.getFullName());
        assertEquals("Updated Education", user.getEducation());
        verify(userRepository).save(user);
    }

    @Test
    void testFullIncompleteBlockedToFullAfterRepair() {
        user.setProfileStatus(ProfileStatus.FULL_INCOMPLETE_BLOCKED);
        UnifiedProfileUpdateRequest req = createValidFullRequest();

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.FULL, user.getProfileStatus());
        verify(userRepository).save(user);
    }

    @Test
    void testInvalidFullRequest() {
        UnifiedProfileUpdateRequest req = createValidFullRequest();
        req.setEducation(""); // Invalid

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            profileService.updateUnifiedProfile(user, req);
        });

        assertEquals(400, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("education"));
        
        // Ensure no mutation occurred
        assertNull(user.getFullName());
        assertNull(user.getEducation());
        assertEquals(ProfileStatus.NONE, user.getProfileStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testFullPlusTargetBasicStaysFullAndPreservesFullFields() {
        user.setProfileStatus(ProfileStatus.FULL);
        user.setEducation("Original Education");
        
        UnifiedProfileUpdateRequest req = createValidBasicRequest();
        req.setFullName("New Name");

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.FULL, user.getProfileStatus());
        assertEquals("New Name", user.getFullName());
        assertEquals("Original Education", user.getEducation()); // Preserved
        verify(userRepository).save(user);
    }

    @Test
    void testFullIncompleteBlockedPlusTargetBasicStaysBlockedAndPreservesFields() {
        user.setProfileStatus(ProfileStatus.FULL_INCOMPLETE_BLOCKED);
        user.setEducation("Original Education");

        UnifiedProfileUpdateRequest req = createValidBasicRequest();
        req.setFullName("New Name");

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.FULL_INCOMPLETE_BLOCKED, user.getProfileStatus());
        assertEquals("New Name", user.getFullName());
        assertEquals("Original Education", user.getEducation()); // Preserved
        verify(userRepository).save(user);
    }

    @Test
    void testPhotoNotRequiredForSaving() {
        // userPhotoRepository mock is not instructed to return anything, so count is 0
        UnifiedProfileUpdateRequest req = createValidFullRequest();

        ProfileMeResponse res = profileService.updateUnifiedProfile(user, req);

        assertEquals(ProfileStatus.FULL, user.getProfileStatus());
        verify(userRepository).save(user);
    }
}
