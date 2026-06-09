# PHASE_15_RUNTIME_QA_PLAN.md — Shiduchim MVP

This document outlines the step-by-step manual runtime QA plan for verifying **Phase 15: Staff Portal + Seed Admin + Event Manager Ownership + Wedding Code Onboarding + Lightweight Invitations** on the Shiduchim MVP platform.

It is designed to be executed manually by developers or QA testers after implementation to guarantee functional correctness, role isolation, and guardrail stability.

---

## Known Pending Runtime Verification & Bugs (from Phase 14)

Before starting the QA process, note the following known behaviors/bugs documented in previous batches:
* **PHOTO-01**: Photos upload and state updates correctly in the database, but images may render as gray placeholders in the UI due to local serving cache/path issues. If this occurs, verify in the database that `storagePath` and `imageUrl` are populated, and do not block the QA flow.
* **PHOTO-02**: Deleting a photo and remaining with exactly 1 primary photo may cause subsequent uploads to fail in certain UI states until the profile is refreshed.
* **PROFILE-REFRESH-02**: Profile and photo status indicators on the Me/Discover screens may display stale data until a manual screen refresh (or app restart) is performed.
* **UX-01**: Error messages throughout the mobile flow may be generic (e.g., "An error occurred"). Verify the HTTP responses in backend logs for precise error reasons.

---

## R0 — Environment

### Test Objective
Verify that the database, backend application, and mobile application can be successfully launched and communicate in the local development environment.

### Prerequisites
* Docker Desktop installed and running.
* Java JDK 21 installed.
* Node.js and npm installed.

### Steps
1. Open a terminal in the project root directory and start the MySQL database:
   ```powershell
   docker compose up -d
   ```
2. Verify the database container is healthy:
   ```powershell
   docker ps
   ```
3. Navigate to the backend directory and launch the Spring Boot application:
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
4. Verify the backend starts successfully on port `8080` (look for `Started BackendApplication in X seconds` in the log).
5. Navigate to the mobile directory and start the Expo dev server:
   ```powershell
   cd mobile
   npm run start
   ```
6. Open the app on an emulator/simulator or physical device via Expo Go.
7. Verify that the mobile app resolves the backend API base URL correctly (normally `http://localhost:8080` or the host local IP).

### Expected Result
* MySQL database container runs successfully.
* Backend starts and connects to the database without throwing SQL exceptions.
* Mobile app builds and displays the Welcome screen.
* No network connectivity errors are shown on startup.

> [!CAUTION]
> **STOP IF FAILED**: If Docker or MySQL fails to run, do not attempt to install MySQL or JDK inside WSL. Do not change the database configuration in `application.yml`. Do not repeatedly restart the backend if it fails. Stop and report the exact environment issue.

---

## R1 — Seed Admin

### Test Objective
Verify that the system automatically seeds a default Admin account upon startup only if no admin user exists in the database, and that registration cannot create admins.

### Prerequisites
* Clean database (run `docker compose down -v` to clear volumes, then restart to get an empty schema).

### Steps
1. Start the backend with an empty database.
2. Observe backend logs for:
   `Seed Admin created successfully.`
3. Connect to the database and query the `users` table:
   ```sql
   SELECT email, role, admin_blocked FROM users WHERE role = 'ADMIN';
   ```
4. Verify that a user exists with email `owner.admin@shiduchim.local` and role `ADMIN`.
5. Restart the backend.
6. Verify no duplicate admin is created and no startup errors occur.
7. Open the mobile app and navigate to the Register screen.
8. Attempt to register a user. Verify that no option exists to select the `ADMIN` role.
9. Send a raw registration POST request to `/api/auth/register` with `"role": "ADMIN"` in the JSON body using Postman/curl.
10. Check the database to confirm the user was created with the `USER` role, ignoring the admin role request.

### Expected Result
* Seed admin is created automatically with credentials `owner.admin@shiduchim.local` / `ShiduchimAdmin!2026`.
* Seeding only runs when no ADMIN exists.
* Standard users cannot elevate their role to ADMIN during registration.
* No manual SQL configuration is required to initialize the admin role.

---

## R2 — Staff Login

### Test Objective
Verify that staff members (Admins and Event Managers) can securely log in via the designated Staff Portal, while unauthorized roles and incorrect credentials are blocked.

### Prerequisites
* Seed admin exists (`owner.admin@shiduchim.local` / `ShiduchimAdmin!2026`).
* An Event Manager account has been created (e.g., `manager1@test.com` / `ManagerPass123!`).

### Steps
1. On the mobile Welcome Screen, tap **Staff Portal (Admin / Event Manager)**.
2. Select **Admin Login**. Enter `owner.admin@shiduchim.local` and `ShiduchimAdmin!2026`. Verify login succeeds and redirects to the Admin Dashboard. Log out.
3. Select **Event Manager Login**. Enter `manager1@test.com` and `ManagerPass123!`. Verify login succeeds and redirects to the Event Manager Home. Log out.
4. Go to **Staff Portal** -> **Admin Login**. Enter `manager1@test.com` and `ManagerPass123!`. Tap Login. Verify a clear role mismatch error is shown.
5. Go to **Staff Portal** -> **Event Manager Login**. Enter `owner.admin@shiduchim.local` and `ShiduchimAdmin!2026`. Tap Login. Verify a clear role mismatch error is shown.
6. Go to **Staff Portal** -> **Admin Login**. Enter a regular user's email and password. Verify a clear error indicating access is denied to regular users is shown.
7. Enter wrong credentials for the admin account. Verify login fails with an invalid credentials error.
8. In the database, set `admin_blocked = true` for `manager1@test.com`. Attempt EM login. Verify it is blocked with a clear deactivation/blocked error.

### Expected Result
* Admin and Event Manager staff logins work when selecting their correct expected roles.
* Mismatched roles (Admin logging in as EM or vice versa) are blocked with a clear message.
* Regular `USER` accounts cannot authenticate through staff endpoints.
* Deactivated/blocked staff accounts cannot log in.
* Credentials are validated correctly and errors are descriptive.

> [!IMPORTANT]
> **STOP IF FAILED**: Staff login is the entry gate for all administrative actions. If logins bypass role checks or fail to authenticate valid users, stop testing.

---

## R3 — Admin Creates Event Manager

### Test Objective
Verify that an Admin can create Event Manager accounts, copy their generated credentials, view the manager list, and deactivate/block them.

### Prerequisites
* Logged in as Admin.

### Steps
1. In the Admin workspace, navigate to the **Event Managers** section.
2. Tap **Create Event Manager**.
3. Fill in the form: Email `em_test@shiduchim.local`, Full Name `EM Test User`, and Password `EMSecurePass99!`.
4. Click **Create**.
5. Verify that a success screen or modal displays showing the created credentials clearly with a "Copy" helper.
6. Return to the Event Managers list. Verify that `EM Test User` is shown as active.
7. Tap on `EM Test User` and select **Block/Deactivate**.
8. Verify the list updates to display their status as blocked/deactivated (uses `adminBlocked` under the hood).
9. Attempt to log in through the Staff Portal as `em_test@shiduchim.local`. Verify login is rejected.
10. In the Admin list, tap `EM Test User` and select **Unblock/Activate**. Verify login is allowed again.

### Expected Result
* Admins can create EMs and copy credentials.
* Event Managers list is accurate and reflects deactivation status.
* Deactivating an EM immediately denies them access.

---

## R4 — Admin/Event Manager Wedding Management

### Test Objective
Verify that Admin and Event Managers can manage weddings, check access codes, copy manual invitation templates, and close/cancel weddings. Ensure Event Managers are restricted to their own weddings.

### Prerequisites
* Logged in as Admin.
* Two Event Managers exist: `Manager A` and `Manager B`.

### Steps
1. As Admin, create a new wedding: Name `White Wedding`, City `Jerusalem`, Date `2026-08-20`.
2. Assign `Manager A` as the owner.
3. Open `White Wedding` details from the Admin weddings list. Verify you can view the auto-generated 6-character `accessCode` (e.g., `WHT123`).
4. Log in as `Manager A`. Navigate to **My Weddings**. Verify `White Wedding` is visible.
5. Open `White Wedding` details. Check that the `accessCode` is visible, the manual invitation text contains the access code and is copyable, and participant counts are shown.
6. Log in as `Manager B`. Navigate to **My Weddings**. Verify `White Wedding` is NOT listed.
7. Attempt to perform a direct API call as `Manager B` to view details or close `White Wedding` (e.g., `GET /api/event-manager/weddings/{id}`). Verify it returns `403 Forbidden`.
8. Log in as `Manager A`. Update the city to `Tel Aviv`. Verify changes save.
9. Tap **Close Wedding**. Verify status transitions to `CLOSED`.
10. Log in as a regular user and try to join using `White Wedding`'s access code. Verify the join is rejected because the wedding is closed.
11. Log in as `Manager A`. Tap **Cancel Wedding**. Verify status transitions to `CANCELLED`.
12. Try to join using the access code. Verify it remains rejected.

### Expected Result
* Admin can assign weddings to Event Managers.
* Event Managers can only access and modify weddings they own.
* Detailed screen shows access codes, copyable invitation templates, and participant stats.
* Closed and Cancelled statuses are successfully saved, blocking new joins.

---

## R5 — Wedding Code Onboarding

### Test Objective
Verify that a guest can enter an active wedding code, preview its details prior to authentication, and automatically join the wedding after completing login or registration.

### Prerequisites
* An active wedding exists with access code `JOIN88`.
* A closed wedding exists with access code `CLOSED99`.

### Steps
1. Launch the mobile app in an unauthenticated state (log out if logged in).
2. On the Welcome Screen, tap **I have a wedding code**.
3. Input an invalid code (e.g., `FAKE00`) and tap Continue. Verify a clear "Wedding code not found" message appears.
4. Input the code `CLOSED99`. Verify details are displayed, but an error message indicates the wedding is closed and cannot be joined.
5. Input the valid active code `JOIN88`.
6. Verify that the wedding details card is displayed (Name, City, Date) *before* any login/register actions.
7. Tap **Login**. Authenticate with an existing regular user who has NOT joined this wedding.
8. Verify that after successful authentication, the user is automatically joined, redirected to the Home screen, and the pending code is cleared from local storage.
9. Log out, go to **I have a wedding code**, enter `JOIN88` again, and tap **Create Account**.
10. Register a new user `new_guest@test.com`.
11. Verify that registration succeeds, the user is automatically logged in and joined to the wedding, and the code is cleared.
12. Attempt to enter `JOIN88` again after joining. Verify the app displays a message stating you have already joined.
13. **Eligibility Check**: Confirm that the auto-joined user cannot browse Discover or match until they complete their Basic Profile and upload a Primary Photo.

### Expected Result
* Code validation retrieves wedding details before authentication.
* Auto-join executes successfully after both login and registration.
* Joining a wedding does not bypass basic profile and primary photo guardrails.
* Closed/cancelled codes display details but block the onboarding flow.

---

## R6 — WeddingInvite

### Test Objective
Verify that lightweight, administrative-only invitations can be created and managed by staff, and that they automatically transition to `ACCEPTED` when the guest joins.

### Prerequisites
* Logged in as Event Manager `Manager A`, owning wedding `A`.
* A test guest email `invitee@guest.com`.

### Steps
1. Navigate to Wedding `A` details.
2. Tap **Invitations** -> **Create Invitation**.
3. Enter name `Invited Guest` and email `invitee@guest.com`. Tap Create.
4. Verify the invitation appears in the list as `PENDING`.
5. Tap **Cancel Invite** on a pending invitation. Verify status changes to `CANCELLED` and it is NOT hard-deleted.
6. Re-create the invitation for `invitee@guest.com` (status `PENDING`).
7. Log in as Admin. Navigate to Wedding `A` details and confirm you can view the invitations list showing `invitee@guest.com` as pending.
8. Log out. Log in or register as a regular user with email `invitee@guest.com`.
9. Join Wedding `A` using its access code.
10. Log back in as `Manager A` or Admin and view invitations.
11. Verify that the invitation for `invitee@guest.com` has automatically transitioned to `ACCEPTED`.
12. Confirm that another user (e.g., `other@guest.com`) can still join Wedding `A` directly by access code without having an invite.

### Expected Result
* Staff can create, view, and cancel invites.
* Cancelled invites remain in the database (soft delete/status update only).
* Admin can view invites in Admin wedding details.
* Invites are purely administrative: no real email, magic links, tokens, or QR codes are created.
* Joining by access code changes the matching pending invitation status to `ACCEPTED`.

---

## R7 — Eligibility Guardrails

### Test Objective
Ensure all core eligibility rules (profile completeness, primary photo requirements, gender filtering, blocking, and participant removal) are strictly enforced and have not regressed.

### Prerequisites
* Logged in as Admin.

### Steps
1. Create a user `no_photo@test.com`. Join them to an active wedding. Do not upload photos or fill in the profile.
2. Verify they are listed under the wedding's participants.
3. Log in as `no_photo@test.com`. Try to browse Discover. Verify feed access is blocked because a primary photo is missing.
4. Log in as a different, eligible user in the same wedding pool. Verify that `no_photo@test.com`'s card is excluded from their Discover feed.
5. Complete Basic Profile and upload a primary photo for `no_photo@test.com`.
6. Verify they can now see Discover cards in the **Wedding Pool** but cannot enter the **Global Pool**.
7. Complete the Full Profile. Verify they can now access the **Global Pool**.
8. Log in as Admin. Navigate to Users and block `no_photo@test.com` (set `adminBlocked = true`).
9. Verify the blocked user is immediately logged out, cannot log back in, and is excluded from all Discover feeds and active matches.
10. Log in as a male user. Verify only female cards appear in Discover.
11. Verify you never see your own card in Discover.
12. Remove a participant from a wedding. Verify they are immediately excluded from that wedding's Discover pool.

### Expected Result
* Guardrails function correctly. No user without a primary photo can browse Discover or be discovered.
* Wedding Pool and Global Pool tiers are strictly separated.
* Blocking a user blocks system access and hides their card immediately.
* Same-gender and self-filtering are intact.

---

## R8 — Phase 14 Regression

### Test Objective
Verify that all core user features from Phase 14 continue to work without regression.

### Steps
1. **Register & Session**: Register a new user. Verify session persists on reload.
2. **Profile Save**: Complete Basic Profile, then Full Profile. Check database fields.
3. **Photo Management**: Upload two photos. Set one as primary. Delete one. Confirm the other becomes primary.
4. **Discover Pools**: Access both Wedding Pool and Global Pool feeds.
5. **Like / Dislike / Freeze**: Tap Like, Dislike, or Freeze on Discover cards. Verify they land in the respective lists.
6. **Liked Me**: Check the Liked Me list.
7. **Match Creation**: Perform a mutual Like. Verify an active match is created.
8. **Match Details**: View the Match Details screen.
9. **Chat Polling**: Send and receive chat messages inside the active match. Confirm they deliver via HTTP.
10. **Lists**: Verify you can unfreeze a user, returning them to Discover.

### Expected Result
* All previously implemented matchmaking features function correctly.
* Chat messages are sent and loaded successfully.
* Photos render (or follow the known gray placeholder bug without breaking backend storage).

---

## R9 — Final Smoke

### Test Objective
Verify that the mobile app provides a premium, glitch-free experience with zero blank screens or broken navigation.

### Steps
1. Navigate through every main screen of the application:
   * Welcome screen
   * Staff Portal login choices
   * Admin Home & Dashboard
   * Event Manager Home
   * Wedding Details
   * Wedding Code entry flow
   * Invitations
   * User Home, Profile, Discover, Lists, Matches, and Chat.
2. Verify that header titles, buttons, and labels are fully readable, capitalized, and clean.
3. Check that no blank screens or infinite loaders appear.
4. Check that no unhandled "Network Error" alerts pop up in a healthy environment.

### Expected Result
* Application behaves smoothly.
* Font hierarchy and theme colors look premium.
* Navigation paths are clean and complete.

---

## Final Verification Checklist

* [ ] R0 Environment: Docker running, backend starting, mobile bundling.
* [ ] R1 Seed Admin: Default admin exists only on empty DB, registration roles secure.
* [ ] R2 Staff Login: Authentic staff access, role enforcement, blocked staff blocked.
* [ ] R3 EM Management: Admin can create, list, copy credentials, and block EMs.
* [ ] R4 Wedding Management: Assign owner, view access code, copy manual invite template, close/cancel.
* [ ] R5 Wedding Code Onboarding: Valid code validates before login/register, auto-joins, eligibility preserved.
* [ ] R6 WeddingInvite: Administrative tracking, cancel (soft delete), auto-transition to ACCEPTED.
* [ ] R7 Eligibility Guardrails: Primary photo gates, pool tiering, same-gender and self-exclusion, admin blocking.
* [ ] R8 Phase 14 Regression: Registration, profiles, photos, actions, matches, HTTP chat.
* [ ] R9 Final Smoke: Premium UX, stable navigation, no blank screens.
