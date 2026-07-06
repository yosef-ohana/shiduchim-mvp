package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.admin.AdminEventManagerDetailsResponse;
import com.shiduchim.backend.dto.admin.ManagedWeddingSummaryResponse;
import com.shiduchim.backend.dto.admin.ReassignManagedWeddingsRequest;
import com.shiduchim.backend.entity.Match;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.entity.Wedding;
import com.shiduchim.backend.entity.WeddingParticipant;
import com.shiduchim.backend.enums.MatchStatus;
import com.shiduchim.backend.enums.ParticipantStatus;
import com.shiduchim.backend.enums.PoolType;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.enums.WeddingStatus;
import com.shiduchim.backend.repository.MatchRepository;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingParticipantRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class Batch6EventManagementTest {

    @Autowired private AdminService adminService;
    @Autowired private UserRepository userRepository;
    @Autowired private WeddingRepository weddingRepository;
    @Autowired private WeddingParticipantRepository weddingParticipantRepository;
    @Autowired private MatchRepository matchRepository;
    @Autowired private TokenService tokenService;
    @Autowired private MockMvc mockMvc;

    private User admin;
    private User regularUser;
    private User emLegacyNull;
    private User emBlocked;
    private User emInactive;
    private User otherEm;

    private Wedding activeWedding;
    private Wedding closedWedding;
    private Wedding cancelledWedding;
    private Wedding deletedWedding;
    private Wedding otherEmWedding;
    private Wedding adminWedding;

    @BeforeEach
    void setUp() {
        matchRepository.deleteAll();
        weddingParticipantRepository.deleteAll();
        weddingRepository.deleteAll();
        userRepository.deleteAll();

        String dummyHash = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("password");

        admin = saveUser("admin@test.com", "Admin", UserRole.ADMIN, false, true);
        regularUser = saveUser("user@test.com", "User", UserRole.USER, false, true);
        emLegacyNull = saveUser("legacy@test.com", "Legacy EM", UserRole.EVENT_MANAGER, false, null);
        emBlocked = saveUser("blocked@test.com", "Blocked EM", UserRole.EVENT_MANAGER, true, true);
        emInactive = saveUser("inactive@test.com", "Inactive EM", UserRole.EVENT_MANAGER, false, false);
        otherEm = saveUser("otherem@test.com", "Other EM", UserRole.EVENT_MANAGER, false, true);

        activeWedding = saveWedding(emLegacyNull.getId(), WeddingStatus.ACTIVE, "code1");
        closedWedding = saveWedding(emLegacyNull.getId(), WeddingStatus.CLOSED, "code2");
        cancelledWedding = saveWedding(emLegacyNull.getId(), WeddingStatus.CANCELLED, "code3");
        deletedWedding = saveWedding(emLegacyNull.getId(), WeddingStatus.DELETED, "code4");
        otherEmWedding = saveWedding(otherEm.getId(), WeddingStatus.ACTIVE, "code5");
        adminWedding = saveWedding(admin.getId(), WeddingStatus.ACTIVE, "code6");

        // Add participants and matches to activeWedding
        saveParticipant(activeWedding.getId(), regularUser.getId());
        saveMatch(activeWedding.getId(), regularUser.getId(), admin.getId());
    }

    private User saveUser(String email, String name, UserRole role, boolean blocked, Boolean emActive) {
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash("hash");
        u.setFullName(name);
        u.setRole(role);
        u.setAdminBlocked(blocked);
        u.setEventManagerActive(emActive);
        return userRepository.save(u);
    }

    private Wedding saveWedding(Long ownerId, WeddingStatus status, String code) {
        Wedding w = new Wedding();
        w.setName("Test Wedding");
        w.setCity("Test City");
        w.setWeddingDate(java.time.LocalDate.now());
        w.setAccessCode(code);
        w.setOwnerUserId(ownerId);
        w.setStatus(status);
        return weddingRepository.save(w);
    }

    private void saveParticipant(Long wId, Long uId) {
        WeddingParticipant wp = new WeddingParticipant();
        wp.setWeddingId(wId);
        wp.setUserId(uId);
        wp.setStatus(ParticipantStatus.ACTIVE);
        weddingParticipantRepository.save(wp);
    }

    private void saveMatch(Long wId, Long u1, Long u2) {
        Match m = new Match();
        m.setWeddingId(wId);
        m.setUser1Id(u1);
        m.setUser2Id(u2);
        m.setPoolType(PoolType.WEDDING);
        m.setStatus(MatchStatus.ACTIVE);
        matchRepository.save(m);
    }

    @Test
    void testGetEventManagerDetails() {
        AdminEventManagerDetailsResponse details = adminService.getEventManagerDetails(emLegacyNull.getId(), admin);

        assertEquals(emLegacyNull.getId(), details.getId());
        assertEquals("Legacy EM", details.getFullName());
        assertEquals(UserRole.EVENT_MANAGER, details.getRole());
        assertTrue(details.getEventManagerActive());
        assertFalse(details.getAdminBlocked());

        List<ManagedWeddingSummaryResponse> weddings = details.getWeddings();
        assertEquals(3, weddings.size()); // ACTIVE, CLOSED, CANCELLED

        assertTrue(weddings.stream().anyMatch(w -> w.getId().equals(activeWedding.getId())));
        assertTrue(weddings.stream().anyMatch(w -> w.getId().equals(closedWedding.getId())));
        assertTrue(weddings.stream().anyMatch(w -> w.getId().equals(cancelledWedding.getId())));
        assertFalse(weddings.stream().anyMatch(w -> w.getId().equals(deletedWedding.getId())));

        ManagedWeddingSummaryResponse activeSummary = weddings.stream().filter(w -> w.getId().equals(activeWedding.getId())).findFirst().get();
        assertEquals(1, activeSummary.getParticipantsCount());
        assertEquals(1, activeSummary.getMatchesCount());
    }

    @Test
    void testGetEventManagerDetailsValidations() {
        assertThrows(ResponseStatusException.class, () -> adminService.getEventManagerDetails(999L, admin));
        assertThrows(ResponseStatusException.class, () -> adminService.getEventManagerDetails(regularUser.getId(), admin));
        assertThrows(ResponseStatusException.class, () -> adminService.getEventManagerDetails(admin.getId(), admin));

        // Blocked and inactive still accessible
        assertDoesNotThrow(() -> adminService.getEventManagerDetails(emBlocked.getId(), admin));
        assertDoesNotThrow(() -> adminService.getEventManagerDetails(emInactive.getId(), admin));
    }

    @Test
    void testDetailsEndpointPermissions() throws Exception {
        String tokenAdmin = tokenService.generateToken(admin.getId());
        String tokenUser = tokenService.generateToken(regularUser.getId());
        String tokenEm = tokenService.generateToken(emLegacyNull.getId());

        String url = "/api/admin/event-managers/" + emLegacyNull.getId();

        mockMvc.perform(get(url).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());

        mockMvc.perform(get(url).header("Authorization", "Bearer " + tokenUser))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(get(url).header("Authorization", "Bearer " + tokenEm))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testReassignmentValidations() {
        ReassignManagedWeddingsRequest req = new ReassignManagedWeddingsRequest();

        // Target not found
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(999L, req, admin));

        // Target not EM
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(regularUser.getId(), req, admin));

        // Null body, handled by controller usually, but we test service null
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), null, admin));

        // Null list
        req.setWeddingIds(null);
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Empty list
        req.setWeddingIds(Collections.emptyList());
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Null ID
        req.setWeddingIds(Arrays.asList(activeWedding.getId(), null));
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Duplicate
        req.setWeddingIds(Arrays.asList(activeWedding.getId(), activeWedding.getId()));
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Nonexistent
        req.setWeddingIds(Arrays.asList(999L));
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Foreign owned
        req.setWeddingIds(Arrays.asList(otherEmWedding.getId()));
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Owned by Admin
        req.setWeddingIds(Arrays.asList(adminWedding.getId()));
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // DELETED
        req.setWeddingIds(Arrays.asList(deletedWedding.getId()));
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Mixed invalid (Atomicity)
        req.setWeddingIds(Arrays.asList(activeWedding.getId(), otherEmWedding.getId()));
        assertThrows(ResponseStatusException.class, () -> adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin));

        // Verify zero mutations after failure
        Wedding activeReloaded = weddingRepository.findById(activeWedding.getId()).get();
        assertEquals(emLegacyNull.getId(), activeReloaded.getOwnerUserId());
        Wedding otherReloaded = weddingRepository.findById(otherEmWedding.getId()).get();
        assertEquals(otherEm.getId(), otherReloaded.getOwnerUserId());
    }

    @Test
    void testReassignmentSuccess() {
        ReassignManagedWeddingsRequest req = new ReassignManagedWeddingsRequest();
        req.setWeddingIds(Arrays.asList(activeWedding.getId(), closedWedding.getId(), cancelledWedding.getId()));

        AdminEventManagerDetailsResponse res = adminService.reassignManagedWeddingsToCurrentAdmin(emLegacyNull.getId(), req, admin);

        // Response should not contain transferred weddings
        assertTrue(res.getWeddings().isEmpty());

        // Verify transfer
        Wedding w1 = weddingRepository.findById(activeWedding.getId()).get();
        assertEquals(admin.getId(), w1.getOwnerUserId());
        assertEquals(WeddingStatus.ACTIVE, w1.getStatus());
        assertEquals("code1", w1.getAccessCode());

        Wedding w2 = weddingRepository.findById(closedWedding.getId()).get();
        assertEquals(admin.getId(), w2.getOwnerUserId());
        assertEquals(WeddingStatus.CLOSED, w2.getStatus());

        Wedding w3 = weddingRepository.findById(cancelledWedding.getId()).get();
        assertEquals(admin.getId(), w3.getOwnerUserId());
        assertEquals(WeddingStatus.CANCELLED, w3.getStatus());
    }

    @Test
    void testReassignmentEndpointPermissions() throws Exception {
        String tokenAdmin = tokenService.generateToken(admin.getId());
        String tokenUser = tokenService.generateToken(regularUser.getId());
        String tokenEm = tokenService.generateToken(emLegacyNull.getId());

        String url = "/api/admin/event-managers/" + emLegacyNull.getId() + "/weddings/reassign-to-current-admin";
        String body = "{\"weddingIds\":[" + activeWedding.getId() + "]}";

        mockMvc.perform(patch(url).contentType(MediaType.APPLICATION_JSON).content(body).header("Authorization", "Bearer " + tokenUser))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(patch(url).contentType(MediaType.APPLICATION_JSON).content(body).header("Authorization", "Bearer " + tokenEm))
                .andExpect(status().is4xxClientError());

        mockMvc.perform(patch(url).contentType(MediaType.APPLICATION_JSON).content(body).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());
    }
}
