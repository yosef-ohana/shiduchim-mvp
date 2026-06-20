# CURRENT_STATUS_AND_PHASE_14_PLAN.md — Shiduchim MVP

## 1. Current Project Status & Summary of QA Results
Phase 14 implementation batches 14.0–14.13 are complete at the code/build level. Final automated checks (Batch 14.14) have been run:
* **Backend package compilation (`.\mvnw.cmd clean package -DskipTests`)**: PASS
* **Mobile TypeScript verification (`npx tsc --noEmit`)**: PASS
* **Expo/Metro startup (`npx expo start`)**: PASS
* **Docker/MySQL runtime startup**: FAIL (Docker Desktop daemon was not running)

Manual runtime QA is still pending. The implementation has NOT been marked as fully runtime-verified or production-ready in this environment. The next required step is user manual runtime QA with Docker Desktop running.

### Confirmed Working Features (at Code/Build level):
* **Auth/Register/Login/Session**: Secure authentication and persistent user sessions.
* **Basic Profile**: Completion of basic personal details.
* **Full Profile**: Completion of extended profile questionnaire.
* **Operational Photo Upload/State**: Ability to upload and manage photos with correct state persistence in the backend.
* **Demo Wedding**: Creation and verification of demo weddings.
* **Join Wedding**: Joining weddings via access codes.
* **Discover / Candidate Profile**: Viewing potential candidates' cards.
* **Like / Dislike / Freeze / Unfreeze**: Expressing matchmaking actions on candidate cards.
* **Liked Me**: View users who liked the current user.
* **Mutual Likes**: Creating matches upon mutual likes.
* **My Matches**: Viewing list of current matches.
* **Match Details**: Viewing detail page of a match.
* **Simple HTTP Chat**: Communication via HTTP after an ACTIVE match is established.
* **Core Eligibility Checks**: Access controls for pools.
* **Final UX Smoke**: Visual walkthrough of primary flows.

---

## 2. Open Bugs and Phase 14 Gaps

### Known Bugs
* **PHOTO-01**: Photos upload and state updates correctly, but images render as gray placeholders.
* **PHOTO-02**: After deleting a photo and remaining with `Photo Count = 1` and `Primary Photo Set = Yes`, uploading another photo fails even though the maximum limit is 2.
* **PROFILE-REFRESH-02**: Certain screens continue to display stale profile/photo status until a manual refresh is triggered.
* **UX-01**: Generic error messages throughout the mobile flow are too vague for end-users.
* **UX-02**: Wedding Pool UX contains confusion between `accessCode` and `weddingId`.
* **UX-03**: Liked Me response flow lacks convenient Like/Dislike actions on the card/list view.
* **FLOW-01**: After a match is successfully created, users may still erroneously appear in Discover/Likes/Liked Me lists.
* **WARN-01**: Low-priority `SafeAreaView` and `expo-image-picker` deprecation/layout warnings exist.

### Phase 14 Gaps (Missing Features)
* **Return to Feed**: Missing navigation options to return to feed from various detail/list screens.
* **Post-Match Dislike UI**: No interface to Dislike (unmatch) a user once a match is active.
* **Matches Label**: "My Matches" list label is too generic.
* **Action Explanation Modals**: Users lack modal explanations on what actions (like/dislike/freeze) do.
* **Role-Based Home & Navigation**: Absence of customized landing screens and navigation based on `UserRole` (`USER`, `EVENT_MANAGER`, `ADMIN`).
* **Minimal Admin Mobile Screens**: Missing basic administrative management on mobile.
* **Minimal Event Manager Mobile Screens**: Missing basic wedding/participant metrics and overview on mobile.
* **Independent Chats Screen**: Lack of a centralized chats list screen.
* **Conversations Endpoint**: Missing backend endpoint for listing chats sorted by newest-first and displaying a last-message preview.

---

## 3. Approved Phase 14 Fixes/Features
To resolve the bugs and gaps, the following items are approved for implementation:
* Fix photo rendering issues (gray placeholders).
* Fix photo upload failure after a deletion occurs.
* Implement profile/photo refresh logic.
* Implement backend cleanup to remove matched users from Discover, Likes, and Liked Me lists.
* Add Post-Match Dislike UI (unmatch capability).
* Add "Return to Feed" functionality and "Remove Action" endpoints.
* Add list-view actions for mobile (Like/Dislike directly from lists).
* Implement action explanation modals.
* Implement role-based navigation and home screen routing.
* Add minimal screens for Admin and Event Manager on mobile.
* Build the independent Chats screen and conversations list view.
* Implement the conversations endpoint supporting newest-first sorting and last message previews on the backend.
* General UX polish and improved client-side error handling.
* Final Regression QA.

---

## 4. Explicitly Rejected / Non-MVP Items
As per locked project decisions (`PROJECT_RULES.md` and `DECISIONS.md`), the following items are **out of scope** and must **not** be proposed, designed, or implemented during Phase 14:
* **No AI or Match Scoring**: No automated recommendation algorithms.
* **No Real OTP / SMS / Phone Verification**: Auth remains simple email/password.
* **No Push Notifications**: Avoid device tokens or push services.
* **No WebSocket / Realtime Chat**: Chat remains polling/HTTP-driven.
* **No Cloudinary**: Images are served using local storage.
* **No Advanced Filtering**: Keep search/discovery pools basic.
* **No User-to-User Blocking**: Use the system-level `adminBlocked` flag instead.
* **No Complex Permissions**: Role enforcement relies strictly on user roles.
* **No Heavy Dashboards/Reports/Logs**: Metrics are simple counters.
* **No Stack Changes**: Maintain Java 21 / Spring Boot 3.5 and Expo React Native / TypeScript.

---

## 5. Official Phase 14 Batch Order
This plan must be executed in order. Do not skip or combine batches:

1. **14.0 — Phase 14 Status Document** (This batch)
2. **14.1A — Photo Rendering Diagnosis**
3. **14.1B — Fix Photo Rendering**
4. **14.2 — Fix Photo Upload After Deletion**
5. **14.3 — Fix Profile/Photo Refresh**
6. **14.4 — Backend Match/List Cleanup**
7. **14.5 — Post-Match Dislike UI**
8. **14.6A — Backend Return to Feed / Remove Action**
9. **14.6B — Mobile List Actions**
10. **14.7 — Action Explanation Modals**
11. **14.8 — Role-Based Home / Navigation**
12. **14.9 — Admin Mobile Minimal Screens**
13. **14.10 — Event Manager Mobile Minimal Screens**
14. **14.11A — Chats Screen Basic**
15. **14.11B — Conversations Endpoint + Newest-First Sorting**
16. **14.12 — Chats Screen Upgrade**: last message + light refresh
17. **14.13 — UX Polish + Error Messages**
18. **14.14 — Final Regression QA**
19. **14.15 — Commit / Push / Docs Readiness**

---

## 6. Antigravity Execution Rules
All agents and developers executing Phase 14 tasks must adhere to these rules:
1. **API Contract Driven**: Any backend endpoints or mobile requests must align with `docs/API_CONTRACT.md`.
2. **Zero Code Changes in Batch 14.0**: No code, routing, config, database, or API contract modifications may be made during Batch 14.0.
3. **Small Batches Only**: Only work on the current active batch. Never implement future features or refactor unrelated code.
4. **Legacy Code Ban**: Never copy or reuse old code/documents from previous project versions. Use only the Stage 3/4 guidelines.
5. **Build and Test Verification**: Every code-modifying batch must compile successfully. Verify via `git status` that only expected files have been modified.
6. **Stop Conditions**: Immediately pause and query the user if:
   * A requirement is ambiguous.
   * The API Contract or DB Schema must change.
   * Build fails and the fix lies outside the current batch.
   * You encounter conflicts in role handling (`USER` vs `EVENT_MANAGER` vs `ADMIN`).

---

## 7. Eligibility Regression / Profile-Photo-Pool Access
The core business logic governing user access and candidate pools is already verified by central manual Runtime QA. These eligibility rules must be protected from regression and must not be altered during Phase 14 unless a regression test in Phase 14.14 explicitly proves a bug has been introduced.

### Protected Rules:
* **Pre-Onboarding Join**: A `USER` may join a wedding before completing their profile details or photo upload.
* **Primary Photo View Constraint**: A `USER` without a primary photo must **not** be allowed to view the Discover/feed.
* **Primary Photo Discovery Constraint**: A `USER` without a primary photo must **not** appear to other users in their Discover/feed.
* **Wedding Pool Eligibility**:
  * Basic Profile completed.
  * Primary Photo exists.
  * `USER` belongs to the relevant wedding (has joined via access code).
  * `USER` is not admin-blocked (`adminBlocked = false`).
  * Opposite-gender filtering applies.
* **Global Pool Eligibility**:
  * Full Profile completed.
  * Primary Photo exists.
  * `USER` is not admin-blocked (`adminBlocked = false`).
  * Opposite-gender filtering applies.
* **Onboarding Pool Tiering**:
  * Basic Profile + Primary Photo allows entry into the **Wedding Pool only**.
  * Full Profile + Primary Photo allows entry into the **Global Pool** (and the Wedding Pool, if joined).

> [!IMPORTANT]
> Do not open any new development tasks or modify any backend/frontend code related to eligibility logic unless Phase 14.14 regression testing indicates a failure.

---

## 8. Required QA / Regression Checklist
During Phase 14.14 (Final Regression QA), developers must manually verify all core flows to confirm no features were broken:
* [ ] **Auth Flow**: Register a new user, log in, resume session, and log out.
* [ ] **Profile Completion**: Complete Basic Profile, verify Pool access, complete Full Profile, verify Global Pool access.
* [ ] **Photo Upload**: Upload 2 photos, verify primary photo is correctly set, delete one photo, upload another, delete both, and verify Discover is blocked.
* [ ] **Weddings**: Create wedding as Event Manager, copy access code, join as User, verify user is visible in participants.
* [ ] **Discover**: Confirm opposite-gender filter is enforced, no blocked users appear, and no self-card is displayed.
* [ ] **Match and Chat**: Mutual like creates an active match, chat messages send and receive over HTTP, post-match dislike blocks the match and disables chat.
* [ ] **Admin Blocks**: Verify that blocking a user via admin immediately denies access to Discover, Actions, and Chats, and hides their card from other users.

---

## 9. Phase 15 Transition, Planning & Verification Notes

* **Phase 15 Overview**: Phase 15 (Staff Portal + Seed Admin + Event Manager Ownership + Wedding Code Onboarding + Lightweight Invitations) addresses administrative gaps and guest onboarding needs identified during initial QA halts.
* **Phase 15 Status**:
  - **Batch 15.0 (Docs + API Contract Lock)**: COMPLETE.
  - **Batch 15.1 (Seed Admin + Backend Staff Login)**: COMPLETE at code/build level.
  - **Batch 15.2 (Welcome Screen + Staff Login Mobile)**: COMPLETE.
  - **Batch 15.3 (Admin API Stabilization + Event Managers Management)**: COMPLETE.
  - **Batch 15.4 (Admin Weddings: Create + Assign Owner + Details)**: COMPLETE.
  - **Batch 15.5 (Event Manager Wedding Details Completion)**: COMPLETE.
  - **Batch 15.6 (Public Wedding Code Validation Backend)**: COMPLETE.
  - **Batch 15.7 (Mobile Wedding Code Onboarding + Auto Join)**: COMPLETE.
  - **Batch 15.8 (WeddingInvite Backend)**: COMPLETE.
  - **Batch 15.9 (WeddingInvite Mobile + Admin/Event Manager Invitations)**: COMPLETE.
  - **Batch 15.10 (Admin Dashboard + UX Polish)**: COMPLETE.
  - **Batch 15.11 (Guardrails Regression Audit)**: COMPLETE (no regressions found, no code changes).
  - **Batch 15.12 (Phase 15 Runtime QA Plan)**: COMPLETE (This batch).
* **Manual Verification Plan**:
  - The complete manual verification plan is documented in [PHASE_15_RUNTIME_QA_PLAN.md](file:///c:/Projects/shiduchim-mvp/docs/PHASE_15_RUNTIME_QA_PLAN.md).
  - This plan contains test scenarios R0 through R9 to manually verify the full Phase 15 product flow.
  - Automated backend API runtime QA is COMPLETE and passed.
  - Mobile visual runtime and final manual verification remain pending.

## 10. Wedding UX Upgrades (Features 4-9) Status
* **Status after Batches 1-5 and final QA**: All code changes implemented and compiled successfully.
* **Changes Made**: Implemented wedding readiness utility, Universal Wedding Hub with direct Discover navigation, Return flow from Profile/Photos to Hub, detailed My Weddings status tracking, and Staff manual invitation text.
* **Backend Status**: Explicitly NO backend, API, DB, Entity, or DTO changes were made during this cycle.
* **QA Status**: Code inspection and static checks pass (TypeScript, Git diff). Manual Expo QA deferred as runtime was not performed in this session.

---

## 11. Cycle 4 Status & Verification (Features 13–16)
* **Status**: Cycle 4 implementation is complete at the code/build level.
* **Features Implemented (Features 13–16)**:
  * **Feature 13: Locked Gender UX**: Implemented display-only gender representation on the Basic Profile screen. Gender selection is disabled, a clear Hebrew warning message is displayed, and the update API payload excludes the gender field to ensure no backend updates can occur.
  * **Feature 14: ChatScreen Polling**: Added lightweight, focus-managed `setInterval` polling in the mobile `ChatScreen` to retrieve new messages and mark them as read. Includes proper cleanup on screen blur or unmount to prevent overlapping requests or memory leaks.
  * **Feature 15: ProductFeedback**: Implemented an independent product feedback reporting system (backend API, database entity, and mobile UI screens) supporting Admin-only listing, viewing, and status updates, and User-level submissions. Kept strictly isolated from the `UserReport` feature. No heavy ticketing or admin reply systems were introduced.
  * **Feature 16: Wedding Background**: Added backend and mobile support for custom wedding backgrounds. Allows Admins and Event Managers to upload, replace, or delete background images (stored locally in `/uploads` on the server). Wedding background URLs are returned in wedding responses and rendered on the Join Wedding landing screen. Uses local storage and existing upload serving conventions; no Cloudinary or S3 integration was added.
* **Automated/Static Checks Status**:
  * **Backend Package Compilation (`.\mvnw.cmd clean compile`)**: PASS
  * **Mobile TypeScript Verification (`npx tsc --noEmit`)**: PASS
  * **Git Diff Formatting Check (`git diff --check`)**: PASS
* **Manual Runtime QA Status**: Still pending for the user (not performed in this session; no manual QA is claimed as passed).
* **Architecture Constraints Enforced**:
  * No WebSockets, Push notifications, visible read receipts, seen labels, blue checks, Cloudinary/S3, heavy ticketing systems, or admin replies were added.
