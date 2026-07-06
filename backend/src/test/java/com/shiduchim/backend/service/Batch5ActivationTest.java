package com.shiduchim.backend.service;

import com.shiduchim.backend.dto.admin.AdminCreateWeddingRequest;
import com.shiduchim.backend.dto.admin.AdminUserResponse;
import com.shiduchim.backend.dto.admin.AssignManagerRequest;
import com.shiduchim.backend.dto.admin.CreateEventManagerRequest;
import com.shiduchim.backend.dto.auth.StaffLoginRequest;
import com.shiduchim.backend.dto.auth.LoginRequest;
import com.shiduchim.backend.entity.User;
import com.shiduchim.backend.enums.Gender;
import com.shiduchim.backend.enums.ProfileStatus;
import com.shiduchim.backend.enums.UserRole;
import com.shiduchim.backend.repository.UserRepository;
import com.shiduchim.backend.repository.WeddingRepository;
import com.shiduchim.backend.config.TokenAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class Batch5ActivationTest {

    @Autowired private AdminService adminService;
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private WeddingRepository weddingRepository;
    @Autowired private TokenService tokenService;
    @Autowired private TokenAuthenticationFilter tokenAuthenticationFilter;
    @Autowired private MockMvc mockMvc;

    private User admin;
    private User regularUser;
    private User emLegacyNull;
    private User emBlockedAndActive;
    private User emUnblockedAndInactive;
    private User emBlockedAndInactive;

    @BeforeEach
    void setUp() {
        weddingRepository.deleteAll();
        userRepository.deleteAll();
        SecurityContextHolder.clearContext();

        String dummyHash = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("password");

        admin = new User();
        admin.setEmail("admin@test.com");
        admin.setPasswordHash(dummyHash); // Dummy hash
        admin.setFullName("Admin");
        admin.setRole(UserRole.ADMIN);
        admin.setAdminBlocked(false);
        admin = userRepository.save(admin);

        regularUser = new User();
        regularUser.setEmail("user@test.com");
        regularUser.setPasswordHash(dummyHash);
        regularUser.setFullName("User");
        regularUser.setRole(UserRole.USER);
        regularUser.setAdminBlocked(false);
        regularUser = userRepository.save(regularUser);

        // Legacy EM (eventManagerActive = null)
        emLegacyNull = new User();
        emLegacyNull.setEmail("legacy@test.com");
        emLegacyNull.setPasswordHash(dummyHash);
        emLegacyNull.setFullName("Legacy EM");
        emLegacyNull.setRole(UserRole.EVENT_MANAGER);
        emLegacyNull.setAdminBlocked(false);
        emLegacyNull.setEventManagerActive(null);
        emLegacyNull = userRepository.save(emLegacyNull);

        emBlockedAndActive = new User();
        emBlockedAndActive.setEmail("ba@test.com");
        emBlockedAndActive.setPasswordHash(dummyHash);
        emBlockedAndActive.setFullName("BA EM");
        emBlockedAndActive.setRole(UserRole.EVENT_MANAGER);
        emBlockedAndActive.setAdminBlocked(true);
        emBlockedAndActive.setEventManagerActive(true);
        emBlockedAndActive = userRepository.save(emBlockedAndActive);

        emUnblockedAndInactive = new User();
        emUnblockedAndInactive.setEmail("ui@test.com");
        emUnblockedAndInactive.setPasswordHash(dummyHash);
        emUnblockedAndInactive.setFullName("UI EM");
        emUnblockedAndInactive.setRole(UserRole.EVENT_MANAGER);
        emUnblockedAndInactive.setAdminBlocked(false);
        emUnblockedAndInactive.setEventManagerActive(false);
        emUnblockedAndInactive = userRepository.save(emUnblockedAndInactive);

        emBlockedAndInactive = new User();
        emBlockedAndInactive.setEmail("bi@test.com");
        emBlockedAndInactive.setPasswordHash(dummyHash);
        emBlockedAndInactive.setFullName("BI EM");
        emBlockedAndInactive.setRole(UserRole.EVENT_MANAGER);
        emBlockedAndInactive.setAdminBlocked(true);
        emBlockedAndInactive.setEventManagerActive(false);
        emBlockedAndInactive = userRepository.save(emBlockedAndInactive);
    }

    @Test
    void testEntityAndCompatibility() {
        // Test legacy null is effectively true
        assertTrue(emLegacyNull.isEffectiveEventManagerActive());

        // Test explicitly false is inactive
        assertFalse(emUnblockedAndInactive.isEffectiveEventManagerActive());

        // Test new EM is persisted active
        CreateEventManagerRequest req = new CreateEventManagerRequest();
        req.setEmail("newem@test.com");
        req.setPassword("password");
        req.setFullName("New EM");
        AdminUserResponse response = adminService.createEventManager(req, admin);
        assertTrue(response.getEventManagerActive());

        User dbEm = userRepository.findById(response.getId()).get();
        assertTrue(dbEm.getEventManagerActive());

        // Test AdminUserResponse exposes legacy null as effective true
        AdminUserResponse legacyRes = new AdminUserResponse(emLegacyNull);
        assertTrue(legacyRes.getEventManagerActive());
    }

    @Test
    void testIndependenceOfOperations() {
        // Activate preserves block state
        User u1 = userRepository.save(emBlockedAndInactive);
        adminService.activateEventManager(u1.getId(), admin);
        u1 = userRepository.findById(u1.getId()).get();
        assertTrue(u1.getEventManagerActive());
        assertTrue(u1.getAdminBlocked());

        // Repeated activate is safe
        adminService.activateEventManager(u1.getId(), admin);
        u1 = userRepository.findById(u1.getId()).get();
        assertTrue(u1.getEventManagerActive());

        // Deactivate preserves block state
        User u2 = userRepository.save(emBlockedAndActive);
        adminService.deactivateEventManager(u2.getId(), admin);
        u2 = userRepository.findById(u2.getId()).get();
        assertFalse(u2.getEventManagerActive());
        assertTrue(u2.getAdminBlocked());

        // Repeated deactivate is safe
        adminService.deactivateEventManager(u2.getId(), admin);
        u2 = userRepository.findById(u2.getId()).get();
        assertFalse(u2.getEventManagerActive());

        // Block preserves active state
        User u3 = userRepository.save(emLegacyNull);
        adminService.blockEventManager(u3.getId(), admin);
        u3 = userRepository.findById(u3.getId()).get();
        assertNull(u3.getEventManagerActive());
        assertTrue(u3.getAdminBlocked());

        // Repeated block is safe
        adminService.blockEventManager(u3.getId(), admin);
        u3 = userRepository.findById(u3.getId()).get();
        assertTrue(u3.getAdminBlocked());

        // Unblock preserves active state
        User u4 = userRepository.save(emBlockedAndInactive);
        adminService.unblockEventManager(u4.getId(), admin);
        u4 = userRepository.findById(u4.getId()).get();
        assertFalse(u4.getEventManagerActive());
        assertFalse(u4.getAdminBlocked());

        // Repeated unblock is safe
        adminService.unblockEventManager(u4.getId(), admin);
        u4 = userRepository.findById(u4.getId()).get();
        assertFalse(u4.getAdminBlocked());
    }

    @Test
    void testStaffLoginCombinations() {
        StaffLoginRequest req = new StaffLoginRequest();
        req.setEmail(emBlockedAndActive.getEmail());
        req.setPassword("password");
        req.setExpectedRole(UserRole.EVENT_MANAGER);
        assertThrows(ResponseStatusException.class, () -> authService.staffLogin(req));

        req.setEmail(emUnblockedAndInactive.getEmail());
        assertThrows(ResponseStatusException.class, () -> authService.staffLogin(req));

        req.setEmail(emBlockedAndInactive.getEmail());
        assertThrows(ResponseStatusException.class, () -> authService.staffLogin(req));

        req.setEmail(emLegacyNull.getEmail());
        req.setPassword("password");
        assertDoesNotThrow(() -> authService.staffLogin(req));

        // ADMIN Staff Login remains allowed
        StaffLoginRequest adminReq = new StaffLoginRequest();
        adminReq.setEmail(admin.getEmail());
        adminReq.setPassword("password");
        adminReq.setExpectedRole(UserRole.ADMIN);
        assertDoesNotThrow(() -> authService.staffLogin(adminReq));

        // USER Login behavior remains unchanged
        LoginRequest userReq = new LoginRequest();
        userReq.setEmail(regularUser.getEmail());
        userReq.setPassword("password");
        assertDoesNotThrow(() -> authService.login(userReq));
    }

    @Test
    void testExistingTokenEnforcementViaMockMvc() throws Exception {
        // Create an active EM dynamically
        User dynamicEm = new User();
        dynamicEm.setEmail("dyn@test.com");
        dynamicEm.setPasswordHash("hash");
        dynamicEm.setFullName("Dyn EM");
        dynamicEm.setRole(UserRole.EVENT_MANAGER);
        dynamicEm.setAdminBlocked(false);
        dynamicEm.setEventManagerActive(true);
        dynamicEm = userRepository.save(dynamicEm);

        // Assign a wedding to dynamicEm so they have a valid endpoint to call
        AdminCreateWeddingRequest createReq = new AdminCreateWeddingRequest();
        createReq.setName("Dyn Wedding");
        createReq.setCity("Tel Aviv");
        createReq.setWeddingDate(java.time.LocalDate.now());
        createReq.setOwnerUserId(dynamicEm.getId());
        Long dynWId = adminService.createWedding(createReq, admin).getId();

        String urlDyn = "/api/event-manager/weddings/" + dynWId + "/participants";
        String dynToken = tokenService.generateToken(dynamicEm.getId());

        // While available -> Request succeeds normally (200 OK)
        mockMvc.perform(get(urlDyn).header("Authorization", "Bearer " + dynToken))
                .andExpect(status().isOk());

        // Block the user -> Next request rejected (Filter reads DB on every request)
        adminService.blockEventManager(dynamicEm.getId(), admin);
        mockMvc.perform(get(urlDyn).header("Authorization", "Bearer " + dynToken))
                .andExpect(status().is4xxClientError());

        // Restore unblocked but inactive -> Next request rejected
        adminService.unblockEventManager(dynamicEm.getId(), admin);
        adminService.deactivateEventManager(dynamicEm.getId(), admin);
        mockMvc.perform(get(urlDyn).header("Authorization", "Bearer " + dynToken))
                .andExpect(status().is4xxClientError());

        // Blocked and inactive -> Rejected
        adminService.blockEventManager(dynamicEm.getId(), admin);
        mockMvc.perform(get(urlDyn).header("Authorization", "Bearer " + dynToken))
                .andExpect(status().is4xxClientError());

        // Legacy null and unblocked -> Accepted
        AdminCreateWeddingRequest legacyReq = new AdminCreateWeddingRequest();
        legacyReq.setName("Legacy Wedding");
        legacyReq.setCity("Jerusalem");
        legacyReq.setWeddingDate(java.time.LocalDate.now());
        legacyReq.setOwnerUserId(emLegacyNull.getId());
        Long legacyWId = adminService.createWedding(legacyReq, admin).getId();
        String urlLegacy = "/api/event-manager/weddings/" + legacyWId + "/participants";
        String tokenLegacy = tokenService.generateToken(emLegacyNull.getId());
        mockMvc.perform(get(urlLegacy).header("Authorization", "Bearer " + tokenLegacy))
                .andExpect(status().isOk());

        // USER regression using an actual USER-authorized endpoint
        String urlUser = "/api/profile/me";
        String tokenUser = tokenService.generateToken(regularUser.getId());
        mockMvc.perform(get(urlUser).header("Authorization", "Bearer " + tokenUser))
                .andExpect(status().isOk());

        // ADMIN regression using an actual ADMIN-authorized endpoint
        String urlAdmin = "/api/admin/weddings";
        String tokenAdmin = tokenService.generateToken(admin.getId());
        mockMvc.perform(get(urlAdmin).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk());
    }

    @Test
    void testOwnerAssignment() {
        AdminCreateWeddingRequest createReq = new AdminCreateWeddingRequest();
        createReq.setName("Wedding 1");
        createReq.setCity("City");
        createReq.setWeddingDate(java.time.LocalDate.now());

        // Unblocked + active (Legacy null)
        createReq.setOwnerUserId(emLegacyNull.getId());
        assertDoesNotThrow(() -> adminService.createWedding(createReq, admin));

        // Blocked + active
        createReq.setOwnerUserId(emBlockedAndActive.getId());
        assertThrows(ResponseStatusException.class, () -> adminService.createWedding(createReq, admin));

        // Unblocked + inactive
        createReq.setOwnerUserId(emUnblockedAndInactive.getId());
        assertThrows(ResponseStatusException.class, () -> adminService.createWedding(createReq, admin));

        // Admin
        createReq.setOwnerUserId(admin.getId());
        assertDoesNotThrow(() -> adminService.createWedding(createReq, admin));

        // Existing wedding assignment
        Long wId = adminService.createWedding(createReq, admin).getId();
        AssignManagerRequest assignReq = new AssignManagerRequest();

        assignReq.setManagerId(emUnblockedAndInactive.getId());
        assertThrows(ResponseStatusException.class, () -> adminService.assignManagerToWedding(wId, assignReq, admin));

        assignReq.setManagerId(emLegacyNull.getId());
        assertDoesNotThrow(() -> adminService.assignManagerToWedding(wId, assignReq, admin));
    }

    @Test
    void testActivateEndpointAuthorizationViaMockMvc() throws Exception {
        // Activate endpoint: PATCH /api/admin/event-managers/{id}/activate
        String url = "/api/admin/event-managers/" + emBlockedAndInactive.getId() + "/activate";

        // Admin can activate
        String tokenAdmin = tokenService.generateToken(admin.getId());
        mockMvc.perform(patch(url).header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventManagerActive").value(true));

        // It does not change adminBlocked
        User reloaded = userRepository.findById(emBlockedAndInactive.getId()).get();
        assertTrue(reloaded.getEventManagerActive());
        assertTrue(reloaded.getAdminBlocked());

        // USER cannot call it
        String tokenUser = tokenService.generateToken(regularUser.getId());
        mockMvc.perform(patch(url).header("Authorization", "Bearer " + tokenUser))
                .andExpect(status().is4xxClientError());

        // EVENT_MANAGER cannot call it
        String tokenEM = tokenService.generateToken(emLegacyNull.getId());
        mockMvc.perform(patch(url).header("Authorization", "Bearer " + tokenEM))
                .andExpect(status().is4xxClientError());

        // Nonexistent target
        mockMvc.perform(patch("/api/admin/event-managers/99999/activate")
                .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNotFound());

        // Target not EVENT_MANAGER
        mockMvc.perform(patch("/api/admin/event-managers/" + regularUser.getId() + "/activate")
                .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testExistingWeddingOwnershipPreserved() {
        // Create wedding with owner (emLegacyNull is unblocked and active)
        AdminCreateWeddingRequest createReq = new AdminCreateWeddingRequest();
        createReq.setName("Wedding Preserve");
        createReq.setCity("Jerusalem");
        createReq.setWeddingDate(java.time.LocalDate.now());
        createReq.setOwnerUserId(emLegacyNull.getId());
        Long wId = adminService.createWedding(createReq, admin).getId();

        // Deactivate owner
        adminService.deactivateEventManager(emLegacyNull.getId(), admin);

        // Reload wedding and verify
        com.shiduchim.backend.entity.Wedding wedding = weddingRepository.findById(wId).get();
        assertEquals(emLegacyNull.getId(), wedding.getOwnerUserId());
        assertEquals(com.shiduchim.backend.enums.WeddingStatus.ACTIVE, wedding.getStatus());
        assertNotNull(wedding.getAccessCode());

        // Block owner
        adminService.blockEventManager(emLegacyNull.getId(), admin);

        // Reload wedding and verify again
        wedding = weddingRepository.findById(wId).get();
        assertEquals(emLegacyNull.getId(), wedding.getOwnerUserId());
    }

    @Test
    void testManagementListVisibility() {
        java.util.List<AdminUserResponse> list = adminService.getEventManagers(admin);

        // Verify it includes all states
        assertTrue(list.stream().anyMatch(u -> u.getId().equals(emLegacyNull.getId())));
        assertTrue(list.stream().anyMatch(u -> u.getId().equals(emBlockedAndActive.getId())));
        assertTrue(list.stream().anyMatch(u -> u.getId().equals(emUnblockedAndInactive.getId())));
        assertTrue(list.stream().anyMatch(u -> u.getId().equals(emBlockedAndInactive.getId())));

        // Verify effective value mapping
        AdminUserResponse legacyRes = list.stream().filter(u -> u.getId().equals(emLegacyNull.getId())).findFirst().get();
        assertTrue(legacyRes.getEventManagerActive());

        AdminUserResponse inactiveRes = list.stream().filter(u -> u.getId().equals(emUnblockedAndInactive.getId())).findFirst().get();
        assertFalse(inactiveRes.getEventManagerActive());
    }
}
