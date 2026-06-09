# Phase 15 Plan — Staff Portal + Seed Admin + Event Manager Ownership + Wedding Code Onboarding + Lightweight Invitations

## 1. Goal Description
Phase 15 introduces backend and mobile support for administrative tasks, staff management, event ownership, structured guest onboarding via wedding codes, and lightweight invite tracking. This will address the product gaps identified during Runtime QA R1.

---

## 2. Locked Batch Sequence
Implementation must be performed surgically, batch by batch, in this exact order:
1. **15.0 — Phase 15 Docs + API Contract Lock** (This batch)
2. **15.1 — Seed Admin + Backend Staff Login**
3. **15.2 — Welcome Screen + Staff Login Mobile**
4. **15.3 — Admin API Stabilization + Event Managers Management**
5. **15.4 — Admin Weddings: Create + Assign Owner + Details**
6. **15.5 — Event Manager Wedding Details Completion**
7. **15.6 — Public Wedding Code Validation Backend**
8. **15.7 — Mobile Wedding Code Onboarding + Auto Join**
9. **15.8 — WeddingInvite Backend**
15. **15.9 — WeddingInvite Mobile + Admin/Event Manager Invitations**
16. **15.10 — Admin Dashboard + UX Polish**
17. **15.11 — Guardrails Regression: Eligibility / Block / Wedding Status**
18. **15.12 — Phase 15 Runtime QA Plan**
19. **15.13 — Final Build / Cleanup / Commit / Push**

---

## 3. MVP Boundaries & Prohibitions
To keep this phase focused and surgical, the following are strictly **out of scope**:
* **No New Deactivation Fields**: Do not add `isActive` or other status flags to users. Use `adminBlocked` for blocking/deactivating users or Event Managers.
* **No Real Email Transmission**: The `WeddingInvite` is purely administrative. No actual SMTP/emails, SMS, or external notifications should be sent.
* **No QR Codes or Magic Links**: Do not implement invite tokens, QR code generation, or login magic links.
* **No Invite Requirement to Join**: Users can still join any active wedding directly using its `accessCode` without having a pre-existing `WeddingInvite`.
* **No Bypassing Core Rules**: Entering a wedding code joins the user to the wedding (creates a `WeddingParticipant` record) but **does not bypass** Profile Completion, Primary Photo requirements, Discover eligibility, or Global Pool rules.
* **No Hard Deletes**: Cancellation, blocking, deactivation, and participant removal must not hard-delete rows from the database. All matches, actions, messages, and invites must remain in the DB for audit trail purposes.
* **No Complex Dashboard Features**: The Admin dashboard must return simple numeric counters. Do not add charts, CSV exports, or reporting logs.
* **No AI, WebSocket, Push Notifications, or Stack Changes**: Auth remains password/email-based; chat remains HTTP polling.

---

## 4. Technical Implementation Concepts

### 4.1 Seed Admin
* A backend startup initializer (e.g. implementing `ApplicationReadyEvent` or `CommandLineRunner`) checks if any user with role `ADMIN` exists.
* If none exists, it seeds a default admin account in the database.
* Default credentials: `admin@shiduchim.com` / `AdminPass123!`.
* Safe for local and production deployment (only runs if table lacks ADMIN).

### 4.2 Backend Staff Login Endpoint
* Expose `POST /api/auth/staff-login` accepting email and password.
* Validates credentials and ensures the user has either `ADMIN` or `EVENT_MANAGER` role.
* Rejects regular `USER` logins with `403 Forbidden` status.

### 4.3 Staff Login Role Validation
* Backend enforces role validation on all staff-related endpoints (reverting `USER` access to `/api/admin/**` and `/api/event-manager/**`).
* Mobile app checks the user role upon login. If the role is `USER`, they are blocked from navigating to staff dashboards or screens. Staff members are correctly routed to their respective workspace.

### 4.4 Welcome Screen / Public Entry Flow
* The first screen shown to unauthenticated users on mobile.
* Options:
  1. Login (routes to regular login or staff login option)
  2. Register (routes to user registration)
  3. Enter Wedding Code (allows entering code before auth)

### 4.5 Admin Event Managers Management
* Admin users can view the list of Event Managers, create new Event Manager accounts (`POST /api/admin/event-managers`), and block/deactivate them using the existing `adminBlocked` flag (setting it to `true`).

### 4.6 Admin Create Wedding
* Admin can create weddings via backend endpoints, specifying name, city, weddingDate, accessCode (optional, auto-generated if blank).

### 4.7 Admin Assign Event Manager to Wedding
* Admin can assign or reassign any Event Manager as the owner of a wedding.
* Endpoint: `PUT /api/admin/weddings/{weddingId}/owner` with request body `{ "ownerUserId": Long }`.

### 4.8 Event Manager Ownership Rules
* Event Managers can only manage, view details, close, cancel, invite, list participants, and view statistics for weddings they own (`ownerUserId == eventManagerId`).
* Accessing or modifying a wedding owned by another Event Manager returns `403 Forbidden`.
* Admins are exempt from ownership rules and can manage any wedding.

### 4.9 Event Manager Wedding Details Completion
* Event Managers can update the name, city, and weddingDate of weddings they own.
* Endpoint: `PUT /api/event-manager/weddings/{id}`.

### 4.10 Public Wedding Code Validation
* Public endpoint `GET /api/weddings/validate-code?code=...` that does not require an auth token.
* Returns validation status (`valid: boolean`), plus basic details like weddingId and weddingName if valid, so that mobile can display a confirmation.

### 4.11 Mobile Wedding Code Onboarding
* User inputs wedding code on the Welcome Screen.
* Mobile app calls `GET /api/weddings/validate-code?code=...`.
* If valid, the app stores the code locally (e.g. in React Native AsyncStorage) as `pendingWeddingCode`.
* User completes login or registration.
* Immediately after successful auth, if a `pendingWeddingCode` exists, the mobile app automatically calls `POST /api/weddings/join` with the pending code, then clears it from local storage.
* Joining the wedding only links the user as a participant. They must still complete basic profile and upload a primary photo before being eligible to view candidates or appear in Discover.

### 4.12 WeddingInvite (Lightweight Administrative Invitations)
* A new entity `WeddingInvite` is introduced to track who has been invited to a wedding.
* Database columns: `id`, `weddingId`, `email`, `invitedByUserId`, `status` (`PENDING`, `ACCEPTED`), `createdAt`.
* Purely administrative: No real emails, QR codes, magic links, or invite tokens are generated.
* When a user joins a wedding (or registers) and their email matches a pending `WeddingInvite` for that wedding, the invite's status is updated to `ACCEPTED`.
* An invite is not required to join a wedding; any user with the correct `accessCode` can join.
* Event Managers can create invites via `POST /api/event-manager/weddings/{id}/invites`, list them via `GET`, and cancel/delete them via `DELETE`.

### 4.13 Admin Basic Dashboard
* Endpoint: `GET /api/admin/dashboard`
* Returns simple aggregate metrics: total regular users, total event managers, total admins, total weddings, total active matches, and total messages.
* Restrict to `ADMIN` role.

### 4.14 Guardrails Regression
* All eligibility rules (profile completion, primary photo required, opposite gender, not self, not blocked) are strictly preserved.
* Blocking a user (setting `adminBlocked = true`) immediately denies access to Discover, actions, active matches, and chat, and hides their card from other users' Discover feeds.
* Deactivation/Cancel/Block operations must use soft flags (e.g., `adminBlocked = true` or `status = CANCELLED`/`REMOVED`) and never execute SQL `DELETE` queries on core transactional entities.

---

## 5. Phase 15 Runtime QA Plan
During Phase 15.12 (Runtime QA), the following scenarios must be verified:
1. **Startup Seeding**: Start empty database, verify that `admin@shiduchim.com` is automatically created.
2. **Staff Login**: Verify that logging in through `/api/auth/staff-login` accepts admin/event manager credentials and rejects regular user credentials.
3. **Staff Access Controls**: Verify that a regular user trying to access staff endpoints receives `403 Forbidden`.
4. **Welcome Screen Validation**: Input an invalid access code, check that it displays an error. Input a valid access code, verify it proceeds to Auth.
5. **Code Auto-Join Flow**: Onboard a guest using a valid access code on the welcome screen. Register a new user. Verify they are automatically added to the wedding participants list.
6. **Eligibility Guardrail Check**: Verify that the auto-joined user cannot see Discover cards or match with anyone until they upload a primary photo and complete basic profile.
7. **Wedding Ownership Validation**: Create two Event Managers. Manager A tries to view participants or edit details of a wedding owned by Manager B. Verify they receive `403 Forbidden`.
8. **Lightweight Invites**: Create an invite for `guest@test.com` in Wedding X. Verify it appears as `PENDING`. Register a user with `guest@test.com` and join Wedding X. Verify the invite status transitions to `ACCEPTED`.
9. **Admin Dashboard**: Access the admin dashboard as Admin and check that metrics correspond to actual DB counts. Access it as User or Event Manager and verify `403 Forbidden` is returned.
10. **Admin Block Event Manager**: Block an Event Manager. Verify they can no longer log in.
