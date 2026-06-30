# BATCH_PLAN.md — Shiduchim MVP

## 1. Purpose

Official implementation plan for Antigravity.

Rules:
- Work one batch at a time.
- Do not merge batches unless approved.
- Do not move forward if build/run fails.
- Do not use old code.
- Each batch must return changed files, work done, tests run, and failures.

---

## Batch 0 — Docs + Project Rules

Goal: put final docs into the new project.

Scope:
- create `docs/`
- add `TECH_SPEC.md`
- add `API_CONTRACT.md`
- add `PROJECT_RULES.md`
- add `BATCH_PLAN.md`
- add `DECISIONS.md`

Do not:
- write business code
- create backend/mobile logic
- copy old code

Expected areas:
- `docs/`

DoD:
- all 5 docs exist
- no business code added

Tests:
- file check only

---

## Batch 1 — Clean Project Skeleton

Goal: create clean repo skeleton.

Scope:
- Spring Boot backend
- Expo React Native TypeScript mobile app
- MySQL `docker-compose.yml`
- basic README

Do not:
- add entities
- add business controllers
- add rejected features
- copy old code

Expected areas:
- `backend/`
- `mobile/`
- `docker-compose.yml`
- `README.md`

DoD:
- backend starts
- mobile starts
- MySQL starts
- no business logic

Tests:
- backend build/run
- mobile start
- docker compose up

---

## Batch 2 — Backend Entities + Enums + DB

Goal: create DB foundation.

Scope:
- 7 entities
- 8 enums
- repositories
- MySQL config
- initial constraints

Do not:
- create business API controllers
- create System Layer
- add rejected fields

Expected areas:
- `backend/.../entity`
- `backend/.../enums`
- `backend/.../repository`
- `application.yml`

DoD:
- all final entities exist
- all final enums exist
- schema is created
- backend runs with MySQL

Tests:
- backend build
- backend run
- schema verification

---

## Batch 3 — Auth + User Base

Goal: registration, login, current user.

Scope:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- password hash
- simple token
- baseline `adminBlocked`

Do not:
- add OTP
- add email verification
- add device tokens
- add complex login attempts

Expected areas:
- `AuthController`
- `AuthService`
- `UserRepository`
- Auth DTOs
- basic security config

DoD:
- user registers
- user logs in
- token returned
- `/api/users/me` works
- duplicate email handled

Tests:
- register
- login
- me
- duplicate email

---

## Batch 4 — Profile Basic / Full

Goal: implement profile status and fields.

Scope:
- `GET /api/profile/me`
- `PUT /api/profile/basic`
- `PUT /api/profile/full`
- validation
- missing fields
- basic `FULL_INCOMPLETE_BLOCKED`

Do not:
- add preferences
- add AI fields
- add maritalStatus
- add extra profile modules

Expected areas:
- `ProfileController`
- `ProfileService`
- Profile DTOs
- User field adjustments if needed

DoD:
- BASIC works
- FULL works
- FULL opens global eligibility
- missing fields handled
- gender cannot change

Tests:
- update basic
- update full
- missing fields
- gender cannot change

---

## Batch 5 — Photos Local Storage

Goal: implement local photo management.

Scope:
- upload image
- get my photos
- set primary
- delete photo
- serve uploads

Do not:
- add Cloudinary
- add image processing
- allow more than 2 photos
- add soft delete or deleted flag

Expected areas:
- `PhotoController`
- `PhotoService`
- `UserPhotoRepository`
- upload config
- static `/uploads`

DoD:
- first upload works and becomes primary
- second upload works
- third upload fails
- set primary works
- deleting primary promotes second
- deleting last blocks Discover/Actions by no primary photo
- delete removes file and DB row

Tests:
- upload first
- upload second
- upload third fails
- set primary
- delete primary
- delete last

---

## Batch 6 — Weddings + Participants

Goal: wedding and participant management.

Scope:
- create wedding
- my weddings
- wedding details
- join by accessCode
- participants list
- add participant by email
- remove participant
- close/cancel wedding

Do not:
- add QR
- add broadcast
- add wedding backgrounds
- add reports

Expected areas:
- `WeddingController`
- `ParticipantController`
- `WeddingService`
- `ParticipantService`
- DTOs

DoD:
- event manager creates wedding
- accessCode manual or auto-generated
- user joins by code
- participants shown
- removal sets REMOVED
- closed/cancelled blocks join
- manager cannot manage other wedding

Tests:
- create wedding
- join valid/invalid
- list participants
- remove participant
- close/cancel
- unauthorized manager access

---

## Batch 7 — Discover Eligibility

Goal: return candidates by pool rules.

Scope:
- WEDDING Discover
- GLOBAL Discover
- eligibility checks
- `PublicUserCardResponse`

Do not:
- add AI
- add scoring
- add advanced filters
- add smart algorithm

Expected areas:
- `DiscoverController`
- `DiscoverService`
- `UserRepository` queries
- simple eligibility helper inside service if needed

DoD:
- wedding returns only eligible candidates
- global returns only FULL candidates
- opposite gender only
- self excluded
- blocked users excluded
- targets with active action excluded
- no phone/email exposed

Tests:
- BASIC in wedding
- BASIC not in global
- FULL in global
- same gender excluded
- existing action excluded
- blocked user excluded

---

## Batch 8 — Actions API

Goal: Like / Dislike / Freeze / Unfreeze.

Scope:
- UserAction upsert
- action replacement
- Unfreeze
- ActionResponse
- Match integration when needed

Do not:
- add action history
- add notifications
- add user-to-user blocking
- add rejected action types

Expected areas:
- `ActionController`
- `ActionService`
- `UserActionRepository`
- `MatchService` integration if needed

DoD:
- Like works
- Dislike works
- Freeze works
- last action wins
- target appears in only one list
- Unfreeze removes Freeze
- invalid target rejected
- same gender rejected

Tests:
- Like then Dislike
- Freeze then Like
- Unfreeze
- invalid target
- same gender target

---

## Batch 9 — Match Logic

Goal: create/block Matches.

Scope:
- create Match on mutual Like
- unique context
- reactivate or safely handle previous BLOCKED Match
- BLOCKED on Dislike/Freeze after Match
- `GET /api/matches`
- `GET /api/matches/{matchId}`

Do not:
- add scoring
- add recommendations
- create duplicate matches
- add realtime

Expected areas:
- `MatchController`
- `MatchService`
- `MatchRepository`
- `ActionService` integration

DoD:
- one-sided Like does not create Match
- mutual Like creates Match
- only one Match per context
- Dislike/Freeze blocks active Match
- BLOCKED not shown as active

Tests:
- one-sided Like
- mutual Like
- duplicate mutual Like
- Dislike after Match
- Freeze after Match

---

## Batch 10 — Lists API

Goal: user lists.

Scope:
- likes
- dislikes
- freezes
- liked-me

Do not:
- show who Froze/Disliked the user
- add complex counters
- expose private fields

Expected areas:
- `ListsController`
- `ListsService`
- `UserActionRepository`

DoD:
- likes list works
- dislikes list works
- freezes list works
- liked-me shows one-sided Likes only
- ACTIVE Matches excluded from liked-me
- no forbidden info exposed

Tests:
- likes list
- dislikes list
- freezes list
- liked-me
- mutual Match excluded from liked-me

---

## Batch 11 — Chat API

Goal: simple chat after ACTIVE Match.

Scope:
- `GET /api/matches/{matchId}/messages`
- `POST /api/matches/{matchId}/messages`
- active Match validation
- ChatMessage storage

Do not:
- add WebSocket
- add realtime
- add readAt
- add unread
- add attachments
- add editing/deletion

Expected areas:
- `ChatController`
- `ChatService`
- `ChatMessageRepository`
- DTOs

DoD:
- messages sent
- messages loaded
- BLOCKED Match returns 403
- non-participant returns 403

Tests:
- send message active
- get messages
- blocked match
- other user access

---

## Batch 12 — Admin API

Goal: basic admin.

Scope:
- create event manager
- list users
- block/unblock users
- list weddings
- assign self to wedding

Do not:
- add logs
- add reports
- add health
- add system settings
- allow admin to create regular USER

Expected areas:
- `AdminController`
- `AdminService`
- `UserRepository`
- `WeddingRepository`

DoD:
- admin creates only event manager
- admin lists users
- admin blocks user
- blocked user cannot use protected features
- admin unblocks user
- admin sees weddings

Tests:
- create event manager
- list users
- block user
- blocked user denied
- unblock user
- list weddings

---

## Batch 13 — Mobile Skeleton + Auth

Goal: mobile base and Auth flow.

Scope:
- navigation
- auth screens
- token storage
- API client
- basic current user state/screen

Do not:
- build all screens
- add Push
- add WebSocket
- add heavy state management

Expected areas:
- `mobile/src/screens/auth`
- `mobile/src/api`
- `mobile/src/navigation`
- `mobile/src/storage`
- `mobile/src/types`

DoD:
- register works from mobile
- login works from mobile
- token stored
- me loads
- logout if implemented

Tests:
- register
- login
- refresh app
- logout if exists

---

## Batch 14 — Mobile Profile + Photos + Wedding Join

Goal: onboarding flow.

Scope:
- basic profile
- full profile
- photo upload
- join wedding
- API calls

Do not:
- add fancy UI that delays MVP
- add extra features
- add Cloudinary
- add QR scanner

Expected areas:
- profile screens
- photo screens
- wedding join screen
- API integration

DoD:
- user completes BASIC
- uploads photo
- joins wedding
- completes FULL
- validation messages clear

Tests:
- user flow to wedding join
- photo upload
- missing fields

---

## Batch 15 — Mobile Discover + Actions + Lists

Goal: core matchmaking flow.

Scope:
- pool selection
- Discover cards
- Like / Dislike / Freeze
- lists
- liked-me

Do not:
- add complex swipe animation if it delays MVP
- add filters
- add scoring
- add realtime updates

Expected areas:
- discover screen
- action buttons
- list screens
- API integration

DoD:
- wedding Discover works
- global Discover works
- actions work
- lists update
- liked-me works
- UI clear and mobile-first

Tests:
- wedding Discover
- global Discover
- Like/Dislike/Freeze
- lists update
- liked-me

---

## Batch 16 — Mobile Matches + Chat + QA

Goal: finish MVP flow and demo.

Scope:
- matches screen
- match details
- chat screen
- basic QA
- demo scenario

Do not:
- add realtime
- add unread
- add attachments
- add read receipts

Expected areas:
- matches screens
- chat screens
- API integration
- QA notes

DoD:
- Match appears after mutual Like
- Chat works
- BLOCKED Match blocks chat
- Dislike/Freeze after Match works
- admin block affects access
- full demo flow works

Tests:
- mutual Like
- send messages
- Dislike after Match
- Freeze after Match
- admin block
- end-to-end demo

---

## Batch 17.0 — Phase 17 Docs + API Contract Lock

Goal: Update core documentation files to define Phase 17 features, limits, and API endpoints.

Scope:
- Update TECH_SPEC.md, API_CONTRACT.md, PROJECT_RULES.md, BATCH_PLAN.md, and DECISIONS.md.

Do not:
- Write or modify backend/mobile source code.

Expected areas:
- `docs/`

DoD:
- All 5 doc files updated and consistent.
- Forbidden boundaries for Phase 17 clearly defined.

Required checks:
- `git status --short` and `git diff` check.

---

## Batch 17.1 — Backend: Unread Messages Foundation

Goal: Add DB field/migrations, entity support, and APIs to track and fetch unread message counts.

Scope:
- Add `readByRecipient` boolean (default false) to ChatMessage entity/DB.
- Add `unreadCount` field to ConversationResponse DTO.
- Implement `GET /api/chats/unread-count` (total unread count).
- Implement `PATCH /api/matches/{matchId}/messages/read` (mark all incoming messages in a match as read).

Do not:
- Add WebSockets, Push notifications, read receipts exposed to the other user, or per-message `readAt` timestamps.

Expected areas:
- `backend/.../entity/ChatMessage.java`
- `backend/.../dto/ConversationResponse.java`
- `backend/.../controller/ChatController.java`
- `backend/.../service/ChatService.java`

DoD:
- Unread counts correctly calculated per conversation and returned in lists.
- Total unread count returns correctly.
- Marking read resets the counts.

Required checks:
- Backend build and unit tests.

---

## Batch 17.2 — Mobile: Unread Messages Badges + Total Count + Reset

Goal: Implement frontend integration to fetch and display unread counts and trigger mark-as-read updates.

Scope:
- Display unread message count badges in conversation list.
- Display total unread count badge on navigation/home screen.
- Call read endpoint (`PATCH /api/matches/{matchId}/messages/read`) when chat screen is opened or focused, resetting counts locally.

Do not:
- Add realtime message notifications or polling faster than current standards.

Expected areas:
- `mobile/src/screens/` (Chat/Matches screens)
- `mobile/src/api/`

DoD:
- Unread counts are visible on chat screen lists and the main navigation badges.
- Badges reset automatically when active chat is opened.

Required checks:
- Mobile compilation / TypeScript lint check.

---

## Batch 17.3 — Backend: User “My Weddings” API

Goal: Implement endpoint to list all weddings joined by the current user.

Scope:
- Implement `GET /api/weddings/my` returning a list of `UserWeddingResponse`.
- DTO fields: `weddingId`, `weddingName`, `city`, `weddingDate`, `weddingStatus`, `participantStatus`, `joinedAt`, `isWeddingPoolEligible`.

Do not:
- Expose other participants, invitations, or management data.

Expected areas:
- `backend/.../controller/WeddingController.java`
- `backend/.../service/WeddingService.java`

DoD:
- Endpoint returns only weddings the authenticated user joined.
- Returns safe data only.

Required checks:
- Backend build and unit tests.

---

## Batch 17.4 — Mobile: “My Weddings” Screen + Clear Join Indication

Goal: Build a screen to view joined weddings and show clear success feedback after joining.

Scope:
- Create "My Weddings" screen listing all joined weddings.
- Show clear confirmation feedback post-join (e.g. "You successfully joined [Wedding Name]").

Do not:
- Bypass basic profile or primary photo requirements for pool eligibility.

Expected areas:
- `mobile/src/screens/` (My Weddings, Join Wedding)
- `mobile/src/navigation/`

DoD:
- "My Weddings" lists joined weddings correctly.
- Post-join message shows wedding name clearly.

Required checks:
- Mobile TypeScript check.

---

## Batch 17.5 — Mobile: Wedding Pool Selection from Joined Weddings

Goal: Replace manual wedding ID typing with selection from joined weddings list.

Scope:
- Pool selection screen retrieves joined weddings and displays them in a picker/dropdown.
- Show only active participation / active weddings.

Do not:
- Bypass onboarding profile requirements.

Expected areas:
- `mobile/src/screens/` (Pool Selection/Discover entry)

DoD:
- User selects from list instead of typing ID.
- Active wedding verification enforced.

Required checks:
- Mobile TypeScript check.

---

## Batch 17.6 — Backend: Restore Cancelled Invite

Goal: Implement endpoint to restore cancelled invite to PENDING.

Scope:
- Implement `PATCH /api/event-manager/weddings/{id}/invites/{inviteId}/restore`.
- Enforce validation rules: only from CANCELLED to PENDING, check if wedding is active, check no duplicate invite, check no active participant.

Do not:
- Send emails, generate QR/tokens, or create a new row.

Expected areas:
- `backend/.../controller/ParticipantController.java` (or invite controllers)
- `backend/.../service/ParticipantService.java`

DoD:
- Cancelled invite status changes back to PENDING.
- All validation checks block restore when rules are violated.

Required checks:
- Backend build and unit tests.

---

## Batch 17.7 — Mobile: Restore Cancelled Invite UI

Goal: Add restore button in the invitation list for Event Managers.

Scope:
- Display restore button next to cancelled invites in the Event Manager's Invite list.
- Hook button to the restore API and refresh list on success.

Do not:
- Add complex UI/dashboard animations.

Expected areas:
- `mobile/src/screens/` (Event Manager Invite list)

DoD:
- Event Manager can restore cancelled invites directly from UI.

Required checks:
- Mobile TypeScript check.

---

## Batch 17.8 — Focused Phase 17 QA + Cleanup + GitHub Push

Goal: End-to-end verification, cleanup, and repository sync.

Scope:
- Test all Phase 17 features.
- Clean up any unused files or debugging lines.
- Git commit and push to main.

Do not:
- Implement any features outside approved scope.

Expected areas:
- Entire repository.

DoD:
- End-to-end flow verified.
- Repo is clean and pushed.

Required checks:
- Backend build + Mobile TypeScript check + Git status check.

---

## Phase 18 — Hebrew UI Localization & RTL Polish

Goal: Localize the mobile UI screens, error messages, and status/role values to Hebrew, supporting right-to-left layout alignment where appropriate. Note: This work was mobile UI only; no backend, API, DTO, entity, or DB changes were made.

### Batch 18.0 — Hebrew Display & Error Helpers
Goal: Create Hebrew display helper displayLabels.ts and error helper errorMessage.ts mapping values and exceptions.

### Batch 18.1 — Entry & Public Screens Localization
Goal: Localize welcome, login, register, staff login, and wedding code screens.

### Batch 18.2 — User Home & Profile Localization
Goal: Localize home, profile screens (basic, full, photos).

### Batch 18.3 — Pool Selection & Discover Localization
Goal: Localize candidate profile, discover feeds, and pool selectors.

### Batch 18.4 — Lists, Matches & Chat Localization
Goal: Localize lists, likes, matches, match details, chat screens, and action buttons.

### Batch 18.5 — User & Event Manager Wedding Screens
Goal: Localize weddings listing and wedding detail management flows.

### Batch 18.6 — Admin UI Screens Localization
Goal: Localize administrative views (users, event managers, weddings).

### Batch 18.7 — Localization QA & Wrap-up
Goal: Run mobile TypeScript checks, perform English user-visible text scans, check RTL/punctuation, clean up, and push verified changes.

---

## Cycle 1 — Session Hardening, Join Flow & Deep Linking

### Batch 1 — Session Persistence Audit & Minimal Fix
- **Goal**: Audit and harden session persistence flow on mobile app bootstrap.
- **Scope**:
  - Ensure user credentials and authentication tokens reload smoothly on application start.
  - Expired or invalid tokens trigger clean client logout redirects without hanging or stalling screens.
- **DoD**: Stable auth bootstrap verified under positive and negative test cases.

### Batch 2 — Wedding Join Landing Flow + Hebrew Guidance
- **Goal**: Design and implement a unified landing flow for joining weddings.
- **Scope**:
  - Unify validation and joining flow under `WeddingJoinLandingScreen.tsx`.
  - Check and display Hebrew guidelines regarding user eligibility (missing profile or primary photo) when successfully joining.
  - Prevent guest/regular user join actions and display warning alerts if a wedding is closed or cancelled.
- **DoD**: Comprehensive entry and join flow validated with clear Hebrew feedback.

### Batch 3 — QR Card + Join Link + Deep Link Wiring
- **Goal**: Enable custom scheme deep linking and QR code share cards.
- **Scope**:
  - Wire custom app deep linking scheme: `shiduchim://join-wedding/:accessCode`.
  - Add client-side QR generation via `react-native-qrcode-svg`.
  - Render active wedding share cards for Admins and Event Managers, and display warning flags for inactive weddings.
- **DoD**: Deep link scheme and QR components verified and functional.

### Batch 4 — Final QA, Documentation, Cleanup
- **Goal**: End-to-end QA validation, document cycle decisions, package consistency checks, and repository verification.
- **Scope**:
  - Review all modified and added files for compliance with project constraints.
  - Compile backend services and check mobile TypeScript compliance.
  - Update decision, tech spec, and batch plans.
- **DoD**: Cycle 1 fully verified, clean, and prepared for commit/push.

---

## Cycle 3 — Safety, Reporting, Blocking & Initial Messages

### Batch 1 — User Reports MVP Backend & Admin Integration
- **Goal**: Implement database entities, repositories, services, controllers, and admin endpoints for recording and managing user reports.
- **Scope**: Create `UserReport` entity and mapping enums. Build `POST /api/reports/users/{reportedUserId}` endpoint for users, and `GET /api/admin/reports`, `GET /api/admin/reports/{reportId}`, `PATCH /api/admin/reports/{reportId}/resolve` for admin.
- **DoD**: Compilation successful, database schema created, report management API operational.

### Batch 2 — UserBlock Backend Core
- **Goal**: Add database entity and endpoints for blocking and unblocking users.
- **Scope**: Create `UserBlock` entity with status enum. Build `POST /api/blocks/{targetUserId}` to block, `PATCH /api/blocks/{targetUserId}/unblock` to unblock, and `GET /api/blocks` to retrieve blocked list.
- **DoD**: UserBlock CRUD operations compile and run successfully.

### Batch 3 — UserBlock Enforcement
- **Goal**: Enforce blocking restrictions across all query, discover, matching, and messaging services.
- **Scope**: Update service query methods and helper functions to dynamically filter out blocked/blocker candidates from feed, liked-me, list views, and chats. Ensure blocking is non-destructive (matches and chats are not deleted, `Match.status` remains unchanged).
- **DoD**: Blocked relationships successfully hidden from all candidate-facing endpoints.

### Batch 4 — UserBlock Mobile UI
- **Goal**: Build mobile screens and interface entry points for blocking and unblocking users.
- **Scope**: Create `blocksApi.ts` client. Add blocking options to `CandidateProfileScreen.tsx` and `MatchDetailsScreen.tsx`. Add `BlockedUsersScreen.tsx` (accessed from `MeScreen.tsx`) to display and manage blocked users in Hebrew.
- **DoD**: TypeScript checks pass; block/unblock actions fully integrated into mobile UI.

### Batch 5 — OpeningMessages Backend Sandbox
- **Goal**: Create entities, repositories, and initial sandbox endpoints for sending single pre-match opening messages.
- **Scope**: Add `OpeningConversation` and `OpeningMessage` entities. Implement `POST /api/opening-messages/{targetUserId}` to send initial message. Enforce eligibility validations.
- **DoD**: Opening messages sent successfully without creating `UserAction` (likes/dislikes) or mutual matches.

### Batch 6 — OpeningMessages Conversion + Discover Filter
- **Goal**: Implement opening message inbox/details endpoints and reply/conversion flows.
- **Scope**: Build `GET /api/opening-messages/inbox`, `/sent`, and `/{conversationId}`. Implement reply flow `POST /api/opening-messages/{conversationId}/messages` supporting `confirmCreateMatch=true`. On conversion, copy messages to standard chat and create an ACTIVE `Match`.
- **DoD**: Replied opening conversations successfully convert to active matches and chats.

### Batch 7 — OpeningMessages Mobile UI
- **Goal**: Add mobile interface for sending and managing opening messages.
- **Scope**: Build `openingMessagesApi.ts` client. Create `OpeningMessagesScreen.tsx` (inbox/sent tabs) and `OpeningConversationDetailsScreen.tsx` with composer. Add "Send message" option to `CandidateProfileScreen.tsx`.
- **DoD**: Opening messages fully interactable on mobile UI; TypeScript compilable.

### Batch 8A — Cycle 3 Hardening, Cleanup, and Docs Review
- **Goal**: Clean up repository junk, run backend compile, run mobile TypeScript compiler check, and update project documentation.
- **Scope**: Run static checks, ensure zero whitespace errors or leftover junk files, and review/update `BATCH_PLAN.md`, `DECISIONS.md`, `TECH_SPEC.md`, and `API_CONTRACT.md`.
- **DoD**: Verified repository build and type sanity; updated 4 doc files.

---

## Cycle 4 — UI Hardening, Polling, Feedback & Wedding Backgrounds

### Batch 1 — Locked Gender UX
- **Goal**: Ensure the gender field is non-editable for regular users on the basic profile screen.
- **Scope**: Disable gender selection inputs in `BasicProfileScreen.tsx`, render a clear Hebrew warning advising that gender cannot be changed, and filter out the gender property from the profile update API request payload.
- **DoD**: Mobile UI displays non-editable gender, shows Hebrew warning, and update API payload omits gender.

### Batch 2 — ChatScreen Lightweight Polling
- **Goal**: Implement simple message polling on the active ChatScreen.
- **Scope**: Set up interval-based polling in `ChatScreen.tsx` using React Native's lifecycle hooks. Clean up polling intervals properly on blur/unmount to avoid memory leaks or concurrent requests.
- **DoD**: Message history refreshes at a lightweight interval while chat is open, and is cleaned up correctly when navigating away.

### Batch 3 — ProductFeedback Backend API
- **Goal**: Build backend infrastructure for registering and managing product feedback.
- **Scope**: Define `ProductFeedback` entity, enums for status/type, repository, service, and controller layers. Provide public user feedback creation endpoints and restricted admin feedback listing/management endpoints.
- **DoD**: Compilation successful; product feedback endpoints verified and secured for Admin/User roles.

### Batch 4 — ProductFeedback Mobile Screens
- **Goal**: Build mobile UI for feedback reporting and admin review.
- **Scope**: Create feedback API client, submission forms (accessible from `MeScreen.tsx`), and admin screens for listing, viewing details, and updating status of reports.
- **DoD**: Users can submit feedback, and admins can view and transition feedback statuses from mobile.

### Batch 5 — Wedding Background Backend API
- **Goal**: Implement background image customization for weddings on the backend.
- **Scope**: Add `backgroundUrl` to the `Wedding` entity, configure a local disk storage upload service, expose background URLs on wedding DTOs, and write endpoints for admins/event-managers to upload and delete backgrounds.
- **DoD**: Background file uploads succeed, file references are correctly stored, and URLs are served in DTOs.

### Batch 6 — Wedding Background Mobile UI
- **Goal**: Enable background image uploading and display on the mobile app.
- **Scope**: Build `WeddingBackgroundManager.tsx` component, integrate it into the Admin and Event Manager wedding details screens, and render the background image on the public Wedding Join landing page.
- **DoD**: Staff can manage backgrounds, and the background image displays successfully on the join screen.

### Batch 7 — Cycle 4 Closeout: QA, Docs, Cleanup, Commit & Push
- **Goal**: Run final compiler, TypeScript, and diff checks, update documentation, remove any junk files, and sync changes to GitHub.
- **Scope**: Verify builds, run `git diff --check`, update tracking docs, commit and push.
- **DoD**: Clean checks, minimal documentation updates, repository committed and pushed.

---

## Cycle 5 — Focused QA-Fix Series

A focused series of QA fixes to stabilize features 1–16 across both the backend and mobile clients.

### Batches 1–7 — Verification and Defect Resolution
- **Goal**: Resolve all critical functional gaps and regression bugs discovered in features 1–16.
- **Completed Areas**:
  - **A1 Active Match Cross-Context**: Excluded users with active matches in any context from discovery feeds, incoming Liked Me lists, outgoing user actions, and opening message initiations.
  - **D1 Full Profile Eligibility Audit**: Ensured profile discovery and global candidate matching fully respect basic profile completions and validations.
  - **B1/F1 Inactive Wedding Safety**: Blocked background image modifications (upload/delete) on inactive weddings in both backend service guards and mobile details screens. Added Hebrew confirmation dialogs for closing or cancelling weddings.
  - **C1–C3 Opening Messages UX**: Retained candidates in the discover feed after sending an opening message, indicating pending/sent statuses correctly. Enforced mutual match creation statuses and blocked pre-match chats.
  - **E1 Admin Reports/ProductFeedback**: Exposed human-readable names and emails for reporters, reported users, and feedback senders on all summary and detail views.
  - **E2 Admin Navigation**: Enabled navigating from admin report detail screens to a focused, highlighted user card view in `AdminUsersScreen`.
- **Deferred Items** (remain unimplemented/out of scope):
  - **C4**: My Weddings Opening indication.
  - **F2**: Restore Wedding.
  - **F3**: Delete Wedding.
  - **E3**: Event Manager reports.
  - **B2**: Deep Link Dev Build verification.
- **DoD**: Stable builds, TypeScript checks pass, no compiler warnings, docs synced, clean git state.

---

## Cycle 6 — Profile & Photos UX improvements

### Batches 1–5 — Implementation & Unified UX Flow
- **Goal**: Implement guided basic/full profile onboarding, enforce profile constraints contextually, and embed a reusable photo manager inside the profile view.
- **Completed Areas**:
  - **Profile Service Guard**: Blocked saving Full Profile questionnaire before Basic Profile is completed on the backend.
  - **Mobile Guided Flow**: Added navigation param safety, status-aware callouts/buttons on `MeScreen.tsx` (for `NONE`/`BASIC`/`FULL` profiles), post-save continuation link in `BasicProfileScreen.tsx`, and a guard warning context on `FullProfileScreen.tsx`.
  - **Status-Aware Profile Display**: Adjusted `ProfileScreen.tsx` layout to hide empty fields for Basic Profile users and display onboarding actions.
  - **Embedded Photo Management**: Extracted photo logic to `ProfilePhotosManager.tsx` and embedded it directly inside the main `ProfileScreen.tsx` view.
  - **PhotosScreen Wrapper**: Preserved `PhotosScreen.tsx` as a functional wrapper around the new manager component to protect existing navigation.
- **DoD**: Compilation successful; mobile TypeScript typechecks pass; unified UX flows operate correctly.

---

## Cycle 7 — Final manual Runtime QA Cycle

### Batches 0–7 — Full Integration Manual Verification
- **Goal**: Run the final manual Runtime QA cycle to verify Shiduchim MVP+ functionality, stability, and UX polish.
- **QA Results**: All batches passed successfully. No blockers, crashes, unexpected permissions, duplicate matches, or duplicate opening messages were found. Inactive wedding rules and cross-context boundaries are fully enforced.
- **Verifications**:
  - **Batch 0**: Database reset, environment startup, and seed QA data generation.
  - **Batch 1**: Profile basic vs full guided onboarding flow, backend profile status checks, and embedded profile photo manager verification.
  - **Batch 2**: Cross-context Like/Dislike/Freeze decisions and active match-hiding behaviors.
  - **Batch 3**: Pre-match opening message sandbox, inbox/sent views, and reply match-conversion confirmation flow.
  - **Batch 4**: Event Manager/Admin participant management dedicated views, non-owner restrictions, and user block rules.
  - **Batch 5**: Closed/Cancelled wedding transition confirmations, background manager modification blocks, and active participant action disables.
  - **Batch 6**: Admin reports (human-readable sender/reporter details, resolve action) and product feedback management, with focused navigation to AdminUsersScreen.
  - **Batch 7**: Sanity check (Me screen loads, active discover pools load, matches/chats operate normally, chat before match blocked).
- **DoD**: All 8 QA batches verified as passed. Backlog of future improvements documented separately.

---

## Development Cycle 8 (Development Cycle 1: Onboarding, Unified Profile and My Weddings CTA)

### Batch 0 — Pre-flight snapshot and baseline checks
- **Goal**: Establish a baseline code and project state compile snapshot.
- **Scope**: Run static analysis, verify Maven compile on backend, and run TypeScript check on mobile.
- **DoD**: Clean compile status, git state snapshotted, all base tests pass.

### Batch 1 — My Weddings CTA Button
- **Goal**: Add Join Wedding CTA to My Weddings screen.
- **Scope**: Add Hebrew "הצטרפות לחתונה" CTA button in both empty and populated states inside `MyWeddingsScreen.tsx` redirecting users to the existing `JoinWedding` route.
- **DoD**: CTA button rendered, functional, and navigates successfully.

### Batch 2 — Post-Registration Onboarding
- **Goal**: Redirect new users to profile guidance after registration.
- **Scope**:
  - Implement a `justRegistered` state in `AuthContext.tsx` set upon registration.
  - Redirect new regular users to `ProfileScreen.tsx` immediately after registration.
  - Render clear Hebrew explanations of eligibility requirements (Basic/Full profile, primary photo) for users with `NONE` profile status.
- **DoD**: New registered users land on profile screen with Israel/Hebrew guidelines.

### Batch 3 — Guided Onboarding Flow
- **Goal**: Implement Basic -> Full -> Photos onboarding flow.
- **Scope**:
  - Add call-to-actions in profile completion screens.
  - Route navigation params (`continueToFullAfterBasic` and `continueToPhotosAfterFull`) to guide user through basic, full, and photo stages.
- **DoD**: Complete sequential onboarding flow validated on mobile screens.

### Batch 4 — Unified Edit Profile UX
- **Goal**: Unify edit profile and photo manager views.
- **Scope**:
  - Embed `ProfilePhotosManager.tsx` directly in `ProfileScreen.tsx`.
  - Disable and explain third photo uploads in mobile UI (limit of exactly 2 photos), maintaining backend validation.
- **DoD**: Photos editable inline on the profile screen with a 2-photo maximum limit check.

### Batch 5 — Final QA, Docs-if-needed, Cleanup
- **Goal**: Run compiler verification, clean repo, update documentation, and prepare user QA reports.
- **Scope**:
  - Verify Maven and TypeScript compilation.
  - Update `DECISIONS.md`, `TECH_SPEC.md`, and `BATCH_PLAN.md`.
  - Check repository for unwanted files and verify git clean state.
- **DoD**: Verification completed successfully; documentation up to date.

---

## Development Cycle 9 (Development Cycle 2: Opening Message Support from Liked Me List)

### Batch 1 — Backend & Mobile DTO Enrichment
- **Goal**: Expose active opening conversation metadata to regular users checking their Liked Me list.
- **Scope**:
  - Enrich `LikedMeItemResponse` backend DTO with fields (hasOpenOpeningConversation, openingConversationId, openingConversationDirection, openingConversationStatus).
  - Update `ListsService` to query `OpeningConversationRepository` and populate metadata.
- **DoD**: Compilation successful; metadata returns correctly in list response.

### Batch 2 — Mobile Liked Me Action Button
- **Goal**: Render an "Opening Message" button in the Liked Me tab.
- **Scope**:
  - Update React Native type interfaces in `api.ts`.
  - Update `ListsScreen.tsx` to render an actionable button navigating to the pre-match chat detail screen.
- **DoD**: TypeScript checks pass; users can open pre-match conversations from the Liked Me list.

### Batch 3 — Final QA & Checkpoint
- **Goal**: Document the changes and perform static checks.
- **Scope**: Update `DECISIONS.md`, `TECH_SPEC.md`, verify backend compilation, and mobile type-checking.
- **DoD**: Safe compile and docs updated.

---

## Development Cycle 10 (Development Cycle 3: Staff Participant Details & Restore)

### Batch 1 — Backend Participant Endpoints & DTOs
- **Goal**: Expose backend endpoints for viewing detailed participant info and restoring removed participants.
- **Scope**:
  - Implement controllers: `ParticipantController.java` (Event Manager) and `AdminParticipantController.java` (Admin).
  - Add `StaffParticipantDetailsResponse` and `StaffParticipantWeddingResponse` DTOs.
  - Implement methods in `ParticipantService.java` to fetch details and restore status. Enforce active-wedding guards blocking updates on closed or cancelled weddings.
- **DoD**: Maven compile passes successfully.

### Batch 2 — Mobile Admin Invite UI
- **Goal**: Add invite form to WeddingParticipantsScreen for admins.
- **Scope**:
  - Implement form visible only for role `ADMIN` and active weddings.
  - Integrate with `adminApi.createInvite`.
- **DoD**: TypeScript check passes.

### Batch 3 — Mobile Participant Details & Restore UI
- **Goal**: Create StaffParticipantDetailsScreen and hook up routing and management actions.
- **Scope**:
  - Create `StaffParticipantDetailsScreen.tsx` to display info and weddings list.
  - Add Admin-only block/unblock actions, and role-and-status-dependent remove/restore actions.
  - Add routing in `MainStack.tsx` and API clients.
- **DoD**: TypeScript check passes.

### Batch 4 — Final QA, Docs, Cleanup & Push
- **Goal**: End-to-end documentation review, code cleanup, technical validation, and pushing changes.
- **Scope**:
  - Run backend clean compile, mobile TypeScript, git diff checks, and git status.
  - Update `API_CONTRACT.md`, `TECH_SPEC.md`, `DECISIONS.md`, and `BATCH_PLAN.md`.
  - Push changes to remote repository.
- **DoD**: Clean compile, zero junk files, docs up-to-date, commit created and pushed.

---

## Development Cycle 11 (Development Cycle 4: Admin Wedding Management Improvements)

### Batch 1 — Backend Admin Wedding Guards
- **Goal**: Implement validation guards in AdminService for owner assignment.
- **Scope**:
  - Prevent owner assignment (both self-assignment and event manager assignment) when the wedding status is not ACTIVE.
  - Prevent assigning the same current owner to the wedding again.
- **DoD**: Maven compile passes successfully.

### Batch 2 — Mobile UI Improvements
- **Goal**: Implement owner display, duplicate selection prevention, and inactive wedding read-only UX.
- **Scope**:
  - Display the owner name/email in AdminWeddingsScreen instead of raw ID.
  - Prevent duplicate assignment in AdminWeddingDetailsScreen by disabling picker selection for the current owner, and disabling self-assign buttons.
  - Render read-only warnings in EventManagerWeddingDetailsScreen and AdminWeddingDetailsScreen for CLOSED/CANCELLED weddings.
  - Render read-only indication in WeddingParticipantsScreen.
- **DoD**: Mobile TypeScript checks pass successfully.

### Batch 3 — Cycle 4 Docs, Technical Checks, Cleanup, Commit and Push
- **Goal**: Technical verification, documentation updates, cleanup, commit, and push.
- **Scope**:
  - Inspect and update BATCH_PLAN.md, TECH_SPEC.md, API_CONTRACT.md, and DECISIONS.md.
  - Verify no junk/artifact files exist in the repository.
  - Commit and push changes to remote repository.
- **DoD**: Clean checks, documentation updated, git status clean, changes committed and pushed.

---

## Development Cycle 12 (Cycle 5: Wedding Lifecycle — Restore + Guarded Hard Delete)

### Batch 5.1 — Backend Restore Wedding Support
- **Goal**: Add REST API and service methods to restore a closed or cancelled wedding to active status.
- **Scope**:
  - Implement `PATCH /api/admin/weddings/{weddingId}/restore` for Admin role.
  - Reject active wedding restore with HTTP 400 Bad Request.
  - Return the updated `WeddingResponse`.
  - Ensure all other wedding relationships and data are fully preserved.
- **DoD**: Maven compile passes; restore endpoint functional.

### Batch 5.2 — Mobile Admin Restore Wedding UI
- **Goal**: Add Restore Wedding UI to the Admin mobile app.
- **Scope**:
  - Add API client wrapper for restore wedding in `adminApi.ts`.
  - Add "Restore" action button in `AdminWeddingDetailsScreen.tsx` visible only for closed or cancelled weddings.
  - Prompt with a Hebrew confirmation dialog before triggering restore.
- **DoD**: TypeScript checks pass; Admin can trigger wedding restoration with full Hebrew prompts and success updates.

### Batch 5.3 — Backend Guarded Hard Delete Wedding
- **Goal**: Implement guarded hard delete for weddings.
- **Scope**:
  - Implement `DELETE /api/admin/weddings/{weddingId}` for Admin role.
  - Reject active wedding deletion with HTTP 400 Bad Request.
  - Check user interactions (UserActions, Matches, OpeningConversations) and block deletion if any exist.
  - Delete only wedding invites, wedding participants, local background image files (best-effort), and the wedding row.
  - Exclude users, photos, global actions/matches/conversations, reports, and feedback from deletion.
- **DoD**: Maven compile passes; guarded deletion logic verified.

### Batch 5.4 — Mobile Admin Hard Delete UI
- **Goal**: Add Hard Delete Wedding UI to the Admin mobile app.
- **Scope**:
  - Add API client wrapper for delete wedding in `adminApi.ts`.
  - Add "Hard Delete" button in `AdminWeddingDetailsScreen.tsx` visible only for closed or cancelled weddings.
  - Display a detailed warning prompt in Hebrew notifying that deletion is irreversible, users are not deleted, and the action will fail if user interactions exist.
- **DoD**: TypeScript checks pass; Admin can trigger guarded delete with warnings.

### Batch 5.5A — Docs, Efficient Technical Closure, and Cleanup Review
- **Goal**: Complete documentation updates, verify clean workspace status, and perform final static/compile validation.
- **Scope**:
  - Update `API_CONTRACT.md`, `TECH_SPEC.md`, `DECISIONS.md`, `PROJECT_RULES.md`, and `BATCH_PLAN.md`.
  - Compile backend using `mvn clean compile` and check mobile TypeScript using `npx tsc --noEmit`.
  - Verify clean git repository status and lack of any temporary junk files.
  - Document a focused Cycle 5 QA checklist.
- **DoD**: Compilation and type checking pass; repository is clean of any junk artifacts; documentation is complete and accurate.

---

## Development Cycle 13 (Development Cycle 6: ProductFeedback / user requests)

### Batch 6.1 — Backend USER Endpoint
- **Goal**: Add a secure backend endpoint for regular users to retrieve their own feedback history.
- **Scope**: Implement `GET /api/feedback/my` returning a list of `MyProductFeedbackResponse`.
- **DoD**: Maven compile passes, endpoint verified.

### Batch 6.2 — Mobile USER Screen
- **Goal**: Add the "My Feedback" history screen in the mobile application.
- **Scope**: Create `MyProductFeedbackScreen.tsx` displaying user's feedback items, and register it in the navigation flow.
- **DoD**: TypeScript checks pass, screen navigateable and displays history correctly.

### Batch 6.3 — Admin ProductFeedback Display Verification & Docs Closure
- **Goal**: Verify Admin feedback screens clearly display sender name and email, and update API/Tech documents.
- **Scope**: Inspect `AdminProductFeedbackScreen.tsx` and `AdminProductFeedbackDetailsScreen.tsx`. Update `API_CONTRACT.md` and `TECH_SPEC.md` to reflect ProductFeedback endpoint definitions and actual schema/enum values.
- **DoD**: Admin display verified, documentation aligned, clean compilation and typechecks pass.

---

## Cycle 1 MVP+ — Auth Separation, Focus Refresh, & Wedding Participants Modal UX

### Batch 1 — Auth Route Separation
- **Goal**: Prevent staff accounts from logging in through the regular user authentication route and map the error message.
- **DoD**: Backend compile success, error mapped correctly in mobile.

### Batch 2 — Wedding Lists Focus Refresh
- **Goal**: Implement focus-based refreshing for My Weddings and Event Manager Weddings screens.
- **DoD**: Stale data is auto-refreshed upon screen focus using `useFocusEffect`.

### Batch 3 — Wedding Participants Modal UI
- **Goal**: Refactor participant management from inline forms to an interactive modal with tab-based routing.
- **DoD**: Forms embedded in modal; active/inactive status handled correctly; typecheck passes.

### Batch 4A — Focused Final Validation & Repo Audit
- **Goal**: Perform compile, typecheck, status, check-diff validations without repo side-effects.
- **DoD**: All automated compilation and type-check steps pass.

### Batch 4B — Docs-if-needed, Cleanup, Commit and Push
- **Goal**: Update status/decisions documentation, execute cleanup, and commit/push changes.
- **DoD**: All changes committed and pushed to remote main branch.

---

## Cycle 2 MVP+ — Onboarding UX, Reusable Forms, & Opening Profile Navigation

### Batch 1 — Profile Form Foundation
- **Goal**: Extract form logic from BasicProfileScreen and FullProfileScreen into reusable components BasicProfileForm and FullProfileForm.
- **Scope**:
  - Unify styling and validation logic into modular components.
  - Maintain all existing input validation and styling behaviors.
- **DoD**: Forms extracted; basic and full screen profile actions operate identical to previous behaviors.

### Batch 2 — Unified ProfileScreen Hub
- **Goal**: Turn ProfileScreen into the central unified edit profile and photo manager hub.
- **Scope**:
  - Render BasicProfileForm, FullProfileForm, and ProfilePhotosManager within a unified layout.
  - Guide users on their onboarding stages without changing the backend API or DB structure.
- **DoD**: Profile Screen acts as a complete profile management dashboard.

### Batch 3 — Opening to CandidateProfile View-Only Navigation
- **Goal**: Implement view-only navigation from Opening messages/details to CandidateProfile.
- **Scope**:
  - Extend MainStack route params for context tracking and banners.
  - Add context banner on CandidateProfileScreen when opened from Opening views.
  - Split touch zones in OpeningMessagesScreen (tapping header opens CandidateProfile, tapping body opens details).
  - Add clickable header in OpeningConversationDetailsScreen fetching the other user's public profile data (name and photo) dynamically, with fallbacks.
- **DoD**: Navigation checks succeed; no matches/likes are created, and chat access remains restricted to active matches.

### Batch 4 — Cycle 2 Docs, Final Validation & Cleanup
- **Goal**: Documentation, code validation, and workspace cleanup.
- **Scope**:
  - Update BATCH_PLAN.md, TECH_SPEC.md, and DECISIONS.md.
  - Run type checks and verify repository status.
- **DoD**: Mobile typescript passes, git diff --check passes, and repository is clean of temporary artifacts.

---

## Cycle 3 MVP+ — Opening / Match / Chat Continuity and Stale Opening Handling

### Batch 1 — Backend Opening-to-Chat bridge after mutual Like Match
- **Goal**: Implement backend logic to bridge existing opening messages into active chat messages when a Match is created.
- **DoD**: Compilation successful; opening messages automatically migrated to chat history on mutual like.

### Batch 2 — Mobile OpeningConversationDetails matched-state banner
- **Goal**: Render a notice and chat redirection button in OpeningConversationDetailsScreen if the opening conversation is already matched.
- **DoD**: Notice and Chat button rendered on matched opening screen; navigation operational.

### Batch 3 — Mobile Discover / Lists Match CTA and stale Opening handling
- **Goal**: Add Chat navigation CTA on Like match creation and handle stale opening attempts gracefully.
- **DoD**: Discover and Lists prompt a direct Chat CTA on new matches, and stale opening attempts show a Hebrew explanation with Chat navigation.

### Batch 4 — Final Validation, Cleanup, Minimal Docs, Commit and Push
- **Goal**: Perform Cycle 3 validation, clean up files, update tracking docs, commit and push.
- **DoD**: Compile and typechecks pass; repository clean; docs updated; changes committed and pushed.
