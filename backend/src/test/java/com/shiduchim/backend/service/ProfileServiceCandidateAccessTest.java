package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.profile.*;
import com.shiduchim.backend.entity.*;
import com.shiduchim.backend.enums.*;
import com.shiduchim.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceCandidateAccessTest {

    @Mock private UserRepository userRepository;
    @Mock private UserPhotoRepository userPhotoRepository;
    @Mock private WeddingParticipantRepository weddingParticipantRepository;
    @Mock private UserBlockService userBlockService;
    @Mock private CandidateRelationshipService candidateRelationshipService;

    @InjectMocks
    private ProfileService profileService;

    private User viewer;
    private User target;

    @BeforeEach
    void setUp() {
        viewer = new User();
        viewer.setId(1L);
        viewer.setRole(UserRole.USER);
        viewer.setGender(Gender.MALE);
        viewer.setProfileStatus(ProfileStatus.FULL);

        target = new User();
        target.setId(2L);
        target.setRole(UserRole.USER);
        target.setGender(Gender.FEMALE);
        target.setProfileStatus(ProfileStatus.FULL);
    }

    @Test
    void testActiveUserToUserBlock_RejectsAccess() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userBlockService.existsActiveBlockBetween(1L, 2L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> 
            profileService.getPublicProfile(viewer, 2L, null, null, null, null)
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(candidateRelationshipService);
    }

    @Test
    void testTargetAdminBlocked_RejectsAccess() {
        target.setAdminBlocked(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> 
            profileService.getPublicProfile(viewer, 2L, null, null, null, null)
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(candidateRelationshipService);
    }

    @Test
    void testViewerAdminBlocked_RejectsAccess() {
        viewer.setAdminBlocked(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> 
            profileService.getPublicProfile(viewer, 2L, null, null, null, null)
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(userRepository);
        verifyNoInteractions(candidateRelationshipService);
    }

    @Test
    void testSameGenderRestriction_RejectsAccess() {
        target.setGender(Gender.MALE); // Viewer is MALE
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> 
            profileService.getPublicProfile(viewer, 2L, null, null, null, null)
        );

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(candidateRelationshipService);
    }

    @Test
    void testAllowedExtendedAccess_DelegatesToRelationshipService() {
        // Setup existing public access to false
        target.setProfileStatus(ProfileStatus.BASIC);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(weddingParticipantRepository.existsSharedActiveWedding(1L, 2L)).thenReturn(false);

        UserPhoto photo = new UserPhoto();
        photo.setIsPrimary(true);
        photo.setImageUrl("url");
        when(userPhotoRepository.findByUserIdOrderByOrderIndexAscCreatedAtAsc(2L)).thenReturn(List.of(photo));

        CandidateRelationshipResponse relResp = new CandidateRelationshipResponse();
        when(candidateRelationshipService.getRelationship(
                eq(viewer), eq(target), any(), any(), any(), any(), eq(false)
        )).thenReturn(relResp);

        PublicProfileResponse response = profileService.getPublicProfile(viewer, 2L, null, null, null, null);

        assertNotNull(response);
        assertEquals(relResp, response.getRelationship());
        verify(candidateRelationshipService).getRelationship(viewer, target, null, null, null, null, false);
    }
}
