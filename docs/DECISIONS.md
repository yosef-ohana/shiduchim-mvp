# DECISIONS.md — Shiduchim MVP

## 1. Purpose

Locked decisions for Shiduchim MVP.

Do not reopen these decisions unless:
- there is a real contradiction in current docs, or
- implementation is blocked, or
- user explicitly approves reopening.

---

## 2. Product Decision

Shiduchim MVP is a mobile-first app for serious matchmaking.

Core pools:
1. Wedding pool — users connected to same wedding/event.
2. Global pool — users who completed full profile.

Goal:
- small
- stable
- impressive enough
- feasible
- not a revival of the old oversized project

---

## 3. Stack Decisions

| Area | Locked decision |
|---|---|
| Main tool | Antigravity |
| Backend | Java 21 + Spring Boot 3.5.x |
| Mobile | React Native + Expo + TypeScript |
| Main DB | MySQL via Docker Compose |
| DB fallback | H2 temporary only |
| Repo | one repo: `backend/`, `mobile/`, `docs/` |
| Work method | API Contract first, small batches |
| Fallback tools | Codex / Claude Code only if Antigravity gets stuck |

No new stack proposals.

---

## 4. Workflow Decisions

- User is entrepreneur.
- ChatGPT is project brain / technical manager.
- Gemini may be auxiliary reviewer only.
- Antigravity is code executor only.
- We think; Antigravity executes.
- Antigravity receives surgical prompts with scope, files, DoD and tests.
- Antigravity does not decide MVP scope.
- Antigravity does not use old code as foundation.

---

## 5. MVP Included

- regular USER
- EVENT_MANAGER
- ADMIN
- email + password Auth
- basic profile
- full profile
- up to two photos, one primary
- local server photo storage + DB URL/path
- wedding pool
- global pool after full profile
- join wedding by accessCode
- manual participant addition
- Like / Dislike / Freeze / Unfreeze
- last action wins
- Like / Dislike / Freeze lists
- liked-me list
- mutual-like Match
- MatchStatus ACTIVE / BLOCKED
- simple chat after ACTIVE Match
- admin blocking through `User.adminBlocked`
- basic wedding and participant management
- basic admin management
- event manager stats: participants count, matches count
- mobile-first clean UI

---

## 6. Explicitly Out of MVP

- AI
- matchmakers
- opening message (Note: Added in Cycle 3)
- real QR
- real OTP
- Push
- device tokens
- WebSocket
- realtime
- read receipts / seen / blue checks / readAt per message (Note: internal unread count per conversation & total unread count are allowed in Phase 17 as internal badges only, no read receipts exposed to the other user)
- heavy dashboards
- heavy reports
- heavy logs
- health monitoring
- jobs
- full SystemRules
- full UserStateEvaluator
- wedding backgrounds (Note: Added in Cycle 4)
- broadcast
- Cloudinary full integration unless later approved
- advanced filters
- match scoring
- profile view counter
- inquiry phone
- user reports (Note: Added in Cycle 3)
- user-to-user blocking (Note: Added in Cycle 3)
- complex permission system
- copying old code

Any old feature in this list is automatically rejected.

---

## 7. Old Code Decision

Old code and old documents are not source of truth.

They are not:
- implementation base
- code to copy
- services/controllers to revive
- architecture to preserve

Stage 3 extracted only clean ideas:
- entities
- fields
- enums
- business rules
- API ideas

Final rule:
```text
Clean ideas may be reused only if already reflected in current docs.
Old code must not be copied.
```

---

## 8. Final Entity Decisions

Final entities:
1. `User`
2. `UserPhoto`
3. `Wedding`
4. `WeddingParticipant`
5. `UserAction`
6. `Match`
7. `ChatMessage`

No extra MVP entities unless approved.

Do not add:
- Notification
- DeviceToken
- LoginAttempt
- SystemLog
- SystemRules
- UserStateEvaluator
- MatchScore

All IDs:
```text
Long auto-increment
```

---

## 9. Final Enum Decisions

1. `UserRole`: `USER`, `EVENT_MANAGER`, `ADMIN`
2. `Gender`: `MALE`, `FEMALE`
3. `ProfileStatus`: `NONE`, `BASIC`, `FULL`, `FULL_INCOMPLETE_BLOCKED`
4. `ActionType`: `LIKE`, `DISLIKE`, `FREEZE`
5. `PoolType`: `WEDDING`, `GLOBAL`
6. `MatchStatus`: `ACTIVE`, `BLOCKED`
7. `WeddingStatus`: `ACTIVE`, `CLOSED`, `CANCELLED`, `DELETED`
8. `ParticipantStatus`: `ACTIVE`, `REMOVED`

`Unfreeze` is not an enum value. It is an endpoint action.

---

## 10. Six Final Stage 4 Decisions

### 10.1 IDs

All entity IDs are `Long` auto-increment, not UUID.

### 10.2 Wedding accessCode

Wedding accessCode supports:
- manual code entered by event manager
- automatic short server-generated code if empty

`accessCode` must be unique.

### 10.3 Gender

Gender is required only for USER participating in matchmaking.

Gender is nullable for EVENT_MANAGER and ADMIN.

### 10.4 Photo deletion

Deleting a photo:
- physically deletes local file
- deletes `UserPhoto` DB row
- no soft delete
- no `deleted` flag

### 10.5 Admin user creation

Admin creates only EVENT_MANAGER users.

Regular USER accounts self-register through the app.

### 10.6 liked-me

liked-me shows only one-sided Likes.

If ACTIVE Match already exists:
- hide from liked-me
- show in Matches

---

## 11. Auth Decisions

- Auth is email + password.
- No OTP.
- No SMS.
- No email verification in MVP.
- No device tokens.
- Password stored as hash.
- Token is simple access token for MVP.
- No complex refresh-token system unless explicitly approved.

---

## 12. Images Decisions

- Local server storage.
- DB stores URL/path.
- Up to two photos.
- One primary photo.
- Primary photo required for Discover/Actions.
- No Cloudinary in MVP unless later approved.
- Delete = file delete + DB row delete.

---

## 13. UserRole / Admin Decisions

- `UserRole` is simple enum.
- No role table.
- No complex permission engine.
- Admin blocking is boolean field: `User.adminBlocked`.
- No separate block entity.
- No user-to-user blocking.

When `adminBlocked=true`:
- no system use
- no Discover
- no Actions
- no Chat
- no join wedding
- not visible to others

---

## 14. UserAction Decisions

- Store only latest active action.
- New action overwrites previous action in same actor-target-context.
- Context = `poolType` + optional `weddingId`.
- Unique constraint on `(actorUserId, targetUserId, poolType, weddingId)`.
- Like / Dislike / Freeze are the only action types.
- Unfreeze removes Freeze.
- No action history.

---

## 15. Match / Chat Decisions

Match:
- created only by mutual Like
- one Match per pair per context
- ACTIVE or BLOCKED
- Dislike/Freeze after Match changes it to BLOCKED
- BLOCKED Match hidden from active Matches
- if mutual Like returns later, prefer reactivating existing BLOCKED Match instead of duplicate

Chat:
- only for ACTIVE Match
- text only
- HTTP GET/POST only
- no WebSocket
- no realtime
- unread counts are allowed only as internal badges (conversation unreadCount & total unreadCount)
- resetting unread count when recipient opens chat is allowed
- no read receipts or read timestamps are exposed to the peer (no blue checks, no "seen" label, no per-message readAt)
- no attachments
- no edit/delete

---

## 16. Build Order Decision

Official order:
1. docs
2. clean skeleton
3. backend entities/enums/db
4. auth
5. profile
6. photos
7. weddings/participants
8. discover
9. actions
10. match
11. lists
12. chat
13. admin
14. mobile auth
15. mobile profile/photos/wedding join
16. mobile discover/actions/lists
17. mobile matches/chat/QA

Do not start with UI before API/backend foundations.
Do not build all backend at once.
Do not build all mobile at once.

---

## 17. Phase 17 Decisions

Phase 17 is officially defined as: **"QA Notes Completion and Missing Feature Completion"**

### 17.1 Unread Message Counts
- Allowed: Internal unread count per conversation (`unreadCount` on `ConversationResponse`) and total unread count across all conversations (`GET /api/chats/unread-count`).
- Reset behavior: Resetting conversation's unread count when the recipient opens the chat/messages (`PATCH /api/matches/{matchId}/messages/read`).
- Backend flag: A backend/internal flag such as `readByRecipient` on `ChatMessage`.
- Forbidden: No blue checks, no "seen" label, no read receipts exposed to the other user, no per-message `readAt` timestamp, no WebSockets, no Push notifications, no heavy realtime or frequent heavy polling.
- Scope: The unread mechanism is internal and exists only to show the current user how many received messages they have not opened yet.

### 17.2 My Weddings for Regular Users
- Regular USER accounts are approved to see weddings they have joined via a dedicated screen.
- Endpoint: `GET /api/weddings/my` (returns user-safe `UserWeddingResponse` objects).
- Exposed fields: `weddingId`, `weddingName`, `city`, `weddingDate`, `weddingStatus`, `participantStatus`, `joinedAt` (if available), and whether this wedding can currently be used as a wedding pool (`isWeddingPoolEligible`).
- Forbidden: Do not expose other participants, invite lists, management/admin data, private emails, or other sensitive admin-only data.

### 17.3 Clear Join Indication
- After a user successfully joins a wedding, a clear success indication is shown (e.g., "You successfully joined [Wedding Name].").
- Onboarding rules: Joining via code does not bypass basic profile and primary photo eligibility requirements for the Wedding Pool.

### 17.4 Wedding Pool Selection
- Regular users should select from weddings they have already joined. Typing wedding IDs manually is no longer needed.
- Filtering rules: Show only weddings the user has joined, allow only ACTIVE participation status, and allow only ACTIVE weddings.

### 17.5 Restore Cancelled Invite
- Admin and Event Managers can restore a cancelled invite from `CANCELLED` status back to `PENDING`.
- Endpoint: `PATCH /api/event-manager/weddings/{id}/invites/{inviteId}/restore`.
- Restrictions: Restore only to `PENDING` (do not create a new invite, do not hard delete, do not send real emails, do not add QR/magic links/invite tokens).
- Prevention rules: Do not allow restore if the wedding is `CLOSED` or `CANCELLED`, if a `PENDING` or `ACCEPTED` invite already exists for the same email/wedding, or if the email owner is already an `ACTIVE` participant.

---

## 18. Phase 18 Decisions (Hebrew UI Localization & RTL Polish)

Phase 18 is officially defined as: **"Hebrew UI Localization & RTL Polish"**

### 18.1 Mobile-Only UI Scope
- Localization is strictly restricted to the mobile frontend UI.
- No backend API endpoints, database schemas, entities, or DTO structures were changed.

### 18.2 UI Localization & Translation Mappings
- Translation mappings are stored in a new untracked local file `mobile/src/utils/displayLabels.ts` containing display helpers to map roles, statuses, gender, yes/no values, and dates to Hebrew.
- Exception and network error strings are caught and mapped locally in the frontend utilizing `mobile/src/utils/errorMessage.ts` to convert technical messages to friendly Hebrew notifications.
- Technical enums, status strings (e.g. `'ACTIVE'`, `'USER'`, `'MALE'`), and route keys remain in English at the code/API level.

### 18.3 Text Alignments & Copy-Paste Integrity
- Hebrew text and labels are right-aligned (`textAlign: 'right'`) and formatted using row-reverse wrappers where appropriate.
- Crucial technical values such as email addresses, password fields, and wedding access codes retain left-alignment (`textAlign: 'left'`) to maintain copy-paste usability and standard mobile interface aesthetics.

### 18.4 No External Internationalization Libraries
- No heavy internationalization packages (e.g., `i18n`, `react-i18next`) or global `I18nManager.forceRTL(true)` logic were introduced, keeping mobile styling lean and using vanilla CSS attributes.

---

## 19. Cycle 1 Decisions: Session Audit, Join Flow, QR Card & Deep Linking

### 19.1 QR Card & Join Link
- **QR/Link as accessCode Wrapper**: The QR code and join link function strictly as wrappers around the existing wedding `accessCode`.
- **No Backend QR Endpoint**: No backend QR code generation endpoints were introduced; QR code rendering is handled entirely on the mobile client.
- **No DB Changes**: No new tables, columns, or schema migrations were added to the database.
- **No Magic Links/Invite Tokens**: We do not use magic links or backend-generated invite tokens for joining.
- **No Camera/Scanner Features**: No internal QR scanner, camera views, or camera permissions were added. Joining via QR code relies on the operating system's native QR scanner triggering the deep link.
- **No Clipboard Dependency**: No Clipboard dependencies or integrations were added to copy the link.

### 19.2 Onboarding and Eligibility
- **No Eligibility Bypass**: Joining via a QR code or deep link does NOT bypass the regular onboarding checks (Basic Profile, Primary Photo, and Eligibility status) required to enter the Discover matching pool.

### 19.3 Deep Linking Scheme & Display Rules
- **Custom Scheme**: The wedding join link uses the custom application scheme: `shiduchim://join-wedding/:accessCode`.
- **Access Control & Warning Labels**:
  - The QR card and shareable join link are shown *only* for weddings in `ACTIVE` status with a valid `accessCode`.
  - Weddings in `CLOSED` or `CANCELLED` status must not encourage sharing and instead show a clear Hebrew warning label indicating that the wedding is not open for joining.

---

## 20. Cycle 3 Decisions: Safety, Reporting, Blocking & Initial Messages

### 20.1 User Reports MVP
- **Backend and Admin only**: Added `UserReport` entity with statuses (`PENDING`, `RESOLVED`) and reasons (`INAPPROPRIATE_PROFILE`, `HARASSMENT`, `SPAM`, `OTHER`). Created admin endpoints to list, detail, and resolve reports.
- **Mobile UI**: Added `ReportUserScreen.tsx` to allow reporting users from candidate profiles or match details with clear Hebrew reasons.
- **Minimal MVP**: Only records reports. Reports do not automatically block/suspend users; decisions are handled manually by admins.

### 20.2 User-to-User Blocking
- **Backend & Enforcement**: Added `UserBlock` entity with statuses (`ACTIVE`, `UNBLOCKED`). Enforced blocks dynamically across all critical queries: candidates do not appear in Discover feed, Likes/Dislikes lists, or Liked-Me.
- **No Data Deletion**: Blocking does NOT delete or alter matches, chats, or historical user actions. The match status does not change to blocked/removed, but the UI filters out conversations and profiles dynamically.
- **Mobile UI**: Users can block/unblock other users from candidate profile, match details, or settings. Added a `BlockedUsersScreen.tsx` accessed from `MeScreen.tsx` to view and manage blocked users.

### 20.3 OpeningMessages before Match
- **Isolated Sandbox**: Added `OpeningConversation` and `OpeningMessage` entities to allow sending a single initial message before a match is established.
- **No Pre-Match Likes**: Sending an opening message does NOT create a `UserAction` (Like/Dislike) or establish a match immediately.
- **Conversion Flow**: When the recipient replies, they can choose to reply normally (retaining the opening message flow) or accept/reply with a match confirmation, converting the opening conversation into a standard `Match` and `ChatMessage` history.
- **Strict Separation**: Kept entirely separate from existing Match/Chat lifecycle until explicit conversion occurs.
- **No Realtime/WebSocket/Read Receipts**: No WebSockets, push notifications, or read receipts were added; chat/messages rely on the standard HTTP request-response flow.

### 20.4 Testing & QA Policy
- **Deferred Manual QA**: In line with project policy, manual regression QA of broader flows is deferred to a later user-run session. Automated compilation and TypeScript checks are used for current verification.

---

## 21. Cycle 4 Decisions: UI Hardening, Polling, Feedback & Wedding Backgrounds

### 21.1 Locked Gender UX
- **Locked Display Only**: The gender field must be completely disabled for editing on the basic profile screen. A visible Hebrew alert is displayed notifying users that gender cannot be changed.
- **API Exclusions**: The mobile app must exclude the `gender` field from profile update JSON payloads to prevent any unauthorized/accidental updates. The backend must enforce that a user's gender remains constant.

### 21.2 ChatScreen Polling
- **Lightweight Interval Polling**: Implemented standard client-side `setInterval` polling in `ChatScreen.tsx` (every few seconds) to query the messages GET endpoint.
- **Focus & Request Guardrails**: Polling intervals must be properly registered and cleared during navigation events (focus/blur) and component unmounts to prevent leaks, running in the background, or duplicate concurrent network requests.
- **Forbidden**: No WebSockets, no push notifications, and no read receipt indicators are displayed to peers.

### 21.3 ProductFeedback System
- **Strict Isolation from User Reports**: Product Feedback (bug reports and feature suggestions) must remain completely independent of the candidate/User Report safety system. Separate entities, controllers, and services are used.
- **MVP Dashboard Limits**: Only admin and user-level CRUD operations are supported (list, detail view, status update, creation). No heavy ticket queues, admin reply systems, or email notifications are added.

### 21.4 Wedding Background Images
- **Local Disk Storage**: Custom wedding backgrounds are saved to the server's local storage directory `/uploads` using the project's existing upload serving pattern.
- **DTO Sharing**: The background URL is included in all standard wedding DTO responses (Admin, User, Validate Access Code) to ensure styling consistency.
- **Forbidden**: No Cloudinary, Amazon S3, or third-party image hosting services may be used.

---

## 22. Cycle 6 Decisions: Profile and Photos UX improvements

### 22.1 Profile Service Guard
- **Strict Order Enforcement**: Enforced on the backend that a user cannot save or update their Full Profile questionnaire unless they have already completed and saved their Basic Profile.

### 22.2 Mobile Guided Flow & Onboarding Navigation
- **Navigation Safety**: Maintained TypeScript safety in main navigation params and state structures.
- **Guidance Elements**: Added dynamic helper boxes and profile setup instructions on the `MeScreen.tsx` contextually driven by the user's status (`NONE`, `BASIC`, `FULL`).
- **Flow Progression**: Basic Profile save transitions seamlessly to offer guided options for completing the Full Profile.
- **Guard and Caution Context**: Added a warning overlay or redirection check on `FullProfileScreen.tsx` to prevent users with `NONE` or `BASIC` status from accessing the full questionnaire prematurely.

### 22.3 Status-Aware ProfileScreen Display
- **Condition-Based Fields**: Basic profile users must not see empty full profile fields. The display adapts dynamically to the current completion status.

### 22.4 Reusable Profile Photos Manager
- **Extraction to Reusable Component**: Extracted the profile photo grids, add/delete mechanisms, and primary photo settings into a reusable `ProfilePhotosManager.tsx` component.
- **Embedding**: Embedded the component directly in the main `ProfileScreen.tsx` to provide a unified editing experience.
- **PhotosScreen Wrapper**: Preserved `PhotosScreen.tsx` as a functional wrapper around `ProfilePhotosManager.tsx` to prevent breaking existing navigation paths (e.g. from wedding join flows).

### 22.5 Profile Screen Integration & QA
- **Unified Profile UX**: ProfileScreen is now the center of the USER profile experience. Basic profile, full profile, and photos are presented as one clear user experience. Behind the scenes, the existing BasicProfileScreen, FullProfileScreen, and PhotosScreen flows remain available so existing navigation is not broken. Full Profile is treated as an extension of Basic Profile, and the backend prevents saving Full Profile before Basic Profile is completed. The final manual Runtime QA for this profile UX merge has now passed.

---

## 23. Final manual Runtime QA Cycle & Backlog Decisions

### 23.1 Final manual Runtime QA Cycle Status
The final manual Runtime QA cycle for the recent Shiduchim MVP+ additions and polish work has been completed. All batches (0–7) passed exactly as expected:
- **Batch 0 — DB reset, environment startup, and QA data creation**: PASSED
- **Batch 1 — Profile / Basic / Full / Photos / Eligibility Runtime**: PASSED
- **Batch 2 — cross-context UserAction + Match + Lists**: PASSED
- **Batch 3 — Opening Messages from Discover and from Lists**: PASSED
- **Batch 4 — Admin / Event Manager Participants**: PASSED
- **Batch 5 — CLOSED / CANCELLED Wedding + Background + Confirmation**: PASSED
- **Batch 6 — Admin Reports / ProductFeedback / Admin Navigation**: PASSED
- **Batch 7 — final Sanity**: PASSED

**QA Status Summary:**
- All batches passed.
- No blockers were found.
- No crashes were found.
- No unexpected permissions were found.
- No Chat before Match.
- No duplicate Match.
- No inconsistent Discover behavior.
- No duplicate Opening Message.
- No inactive wedding behaving as active.

**Verified QA Wedding Access Codes:**
- Active QA wedding: "חתונת QA ליטושים פעילה" — accessCode 1111
- Closed/cancelled QA wedding: "חתונת QA ליטושים לסגירה" — accessCode 5555

### 23.2 Backlog & Future UX Improvements (Out of MVP Scope)
These are collected future improvements and are NOT implemented at this stage. They remain in the backlog:
- **Opening Messages**:
  - Allow sending an Opening Message from "Liked Me" to a user who already liked me, before deciding whether to return Like and create Match.
- **Participants / Wedding Users**:
  - Allow Admin to invite a new wedding participant by full name and email, like Event Manager can.
  - Add that invite option inside the Wedding Participants management screen.
  - Allow Admin / Event Manager to click a participant and view the full user profile.
  - From participant details, allow block/remove from a wedding.
  - Allow choosing which wedding to remove the user from.
  - Allow undoing that block/removal.
- **Admin / Event Manager User Visibility**:
  - Wherever Admin / Event Manager can see users, they should be able to click a user and see the full profile/details.
  - From that user detail view, allow blocking/removing from a wedding with a specific wedding selector.
  - Allow cancelling that block/removal.
- **Wedding Admin UX**:
  - Show the responsible Event Manager name in Admin wedding screens instead of only ownerId.
  - In wedding details, clearly show which Event Manager owns the wedding.
  - Disable assigning the same Event Manager again to the same wedding.
  - Allow assigning a different Event Manager or the Admin itself where the current product supports it.
  - Allow restoring CLOSED / CANCELLED weddings back to ACTIVE with all data and participants.
  - For CLOSED / CANCELLED weddings, show a clear status message and disable actions until restored.
  - Add a permanent delete option for closed/cancelled weddings, where the wedding disappears from all lists, while users remain in the system.
- **Reports / ProductFeedback**:
  - Add a "My Requests" screen for users, showing submitted feedback/history and status such as NEW / IN_PROGRESS / RESOLVED.
  - In Admin feedback screens, show the user's name, not only userId.

---

## 24. Development Cycle 1 Decisions: Enhanced Onboarding and Profile UX

### 24.1 Post-Registration Onboarding
- **Auto-Redirect to Profile**: Upon successful registration, the mobile application sets a temporary `justRegistered` state in `AuthContext` and automatically redirects the new regular user to the `ProfileScreen`.
- **Pre-Onboarding Guidance**: Users with a profile status of `NONE` are presented with a clear Hebrew explanation on `ProfileScreen` details, explaining the requirements and differences between Basic and Full profile tiers, and highlighting the primary photo requirement to be eligible for matchmaking pools.

### 24.2 Guided Onboarding Flow
- **Basic -> Full -> Photos Flow**: A continuous guided flow is established.
  - Basic Profile creation features a conditional call-to-action button to transition to the Full Profile.
  - Full Profile creation features a conditional call-to-action to proceed directly to Photo Uploads.
  - Route navigation parameters (`continueToFullAfterBasic` and `continueToPhotosAfterFull`) ensure the flow is focused and sequential.

### 24.3 Unified Edit Profile UX
- **Merged Profile Screen**: Photos are presented as an integral part of the profile screen via the embedded `ProfilePhotosManager` component.
- **Two-Photo UI Enforcement**: The upload button is disabled/hidden and a message is displayed when two photos are uploaded, explaining the two-photo limit, while preserving backend enforcement.

### 24.4 My Weddings CTA
- **Clear Join Action**: Added a clear "הצטרפות לחתונה" CTA button in both empty and populated states of the My Weddings screen that navigates to the existing `JoinWedding` route.

---

## 25. Development Cycle 2 Decisions: Opening Message Support from Liked Me List

### 25.1 Allow Opening Messages from "Liked Me" List
- **Product Flow Decisions**:
  - Regular users can view candidates who liked them (under the "Liked Me" list).
  - Instead of performing an immediate Like/Dislike, a user can initiate or view an existing Opening Message conversation with the candidate directly from the "Liked Me" list.
  - This allows pre-match communication to occur while still preserving the Liked Me relationship, prior to deciding whether to return the Like (which would form a Match) or Dislike/Freeze/etc.
  - Exposing this existing Opening Message capability on the Liked Me tab improves the core match-making lifecycle.

### 25.2 Core Invariants Retained
- **Like vs. Opening Message**: Sending an Opening Message from "Liked Me" does NOT create an action (Like/Dislike/Freeze).
- **Opening Message vs. Chat**: The Opening Message interface exists as a distinct pre-match sandboxed list/conversation. A standard Chat conversation remains locked and is only created after a formal mutual Match.
- **No DB/Entity Modifications**: This feature is implemented purely by exposing the existing pre-match `OpeningConversation` relationships on the mobile Liked Me UI tab and enriching the `GET /api/lists/liked-me` DTO. No database table, schema, or entity definitions were changed.

### 25.3 QA and Checkpoint Status
- **Technical Checks**: Backend compile, mobile TypeScript, and git diff checks have successfully passed.
- **Runtime QA Deferred**: Due to local environment limitations (Docker/Database and mobile emulator runtime unavailable), manual runtime verification was not performed.
- **Project Status**: This release is committed as a technical development checkpoint. Manual QA is explicitly deferred to the final QA phase following the completion of the broader set of 17 features.

---

## 26. Development Cycle 3 Decisions: Staff Participant Details & Restore

### 26.1 API & Detail Exposure Strategy
- **Role-Based Details Response**: The details of a participant are returned via `StaffParticipantDetailsResponse`, which exposes both Basic and Full profiles and photos of the participant.
- **Manageable Weddings List**: The response contains a list of weddings the participant belongs to, but only those weddings that the currently authenticated staff user (Event Manager or Admin) has permission to manage. This prevents unauthorized staff from discovering weddings they do not own or manage.
- **Separate Endpoints for EM and Admin**: Consistent with the API routing strategy in the codebase, separate controller endpoints under `/api/event-manager` and `/api/admin` handle routing for Event Managers and Admins respectively.

### 26.2 Active Wedding Guards Enforced
- **Operations Blocked for Closed/Cancelled Weddings**: Inviting, removing, and restoring participants is strictly prohibited on `CLOSED` or `CANCELLED` weddings.
- **Consistent Response Codes**: If a request to add/remove/restore is made on a closed/cancelled wedding, the API returns a clean HTTP 400 Bad Request or HTTP 403 Forbidden with appropriate error messages.

### 26.3 Mobile UI Access Control
- **Admin Invite Section**: The invitation form inside `WeddingParticipantsScreen.tsx` is visible only for the `ADMIN` role. Event Managers do not see this form.
- **Admin Block/Unblock Actions**: The Block/Unblock buttons on `StaffParticipantDetailsScreen.tsx` are visible and active only for the `ADMIN` role.
- **Action Guardrails**: Event Managers and Admins can only remove or restore participants if the backend returns `canRemove: true` or `canRestore: true` in the list of manageable weddings, preventing invalid action attempts.
- **No DB, Entity, or Email Changes**: No database schemas, entities, migrations, or email sending logic were introduced.

---

## 27. Development Cycle 4 Decisions: Admin Wedding Management Improvements

### 27.1 Backend Assignment Validation Guards
- **Active Wedding Check**: Assigning a new owner (via self-assignment or event manager assignment) is strictly restricted to `ACTIVE` weddings. Closed or cancelled weddings cannot have their owner changed, returning HTTP 400 Bad Request.
- **Duplicate Owner Prevention**: Assigning the same owner who is already the current owner of the wedding is rejected with HTTP 400 Bad Request.

### 27.2 Mobile UI Owner Management & Prevention
- **Display Friendly Identifier**: The Admin Weddings list and detail screens show the owner's human-readable name or email, falling back to the user ID if not loaded.
- **Visual & UI Selection Block**: The current owner card displays a marked "Current Owner" badge and is disabled in the picker list to prevent selecting them. The self-assign button displays "Wedding already assigned to you" and is disabled if the logged-in admin is the current owner.

### 27.3 Inactive Wedding Read-only UX
- **Details Banners**: Detail screens for Event Managers and Admins show a persistent top banner indicating that the wedding is `CLOSED` or `CANCELLED` and is read-only.
- **Participants List Banner**: The participant management screen shows a read-only notification banner when the wedding is inactive.

### 27.4 Exclusions & MVP Boundaries
- **No Structural Changes**: No database schemas, entities, DTOs, or new API endpoints were created or modified.
- **Out of Scope Features**: "Restore Wedding" and "Hard Delete" operations were not implemented or supported.
- **QA Exclusions**: Runtime manual QA is deferred / pending. Only compile and static type verification checks were executed.

---

## 28. Cycle 5 Decisions: Restore Wedding & Guarded Hard Delete

### 28.1 Admin-Only Lifecycle Control
- **Authorization Enforcement**: Restoring and deleting weddings are high-privilege operations reserved strictly for the `ADMIN` role. Event Managers and regular Users cannot perform or access these features. Enforced on the backend via role validation and hidden on the frontend for non-admin users.

### 28.2 Guarded Deletion Safety Invariant
- **Guarded Delete Superseded**: This older guarded delete policy (where deletion was blocked if user interactions existed and physically deleted the Wedding row) was superseded/updated by the Cycle 7 Wedding Hard Delete Tombstone policy. Under the current policy, deletion does not block on user interactions, and the Wedding row itself is preserved as an internal tombstone with status `DELETED` instead of being physically deleted.
- **Non-Destructive for Core Entities**: Even when a wedding delete is executed, it never deletes Users, UserPhotos, UserActions, Matches, Chats, OpeningConversations, OpeningMessages, UserReports, ProductFeedback, UserBlocks, or global data. Under the Cycle 7 policy, only `WeddingParticipant` rows, `WeddingInvite` rows, and the local background image file (best-effort) are physically removed, while the wedding row is kept as a tombstone.

### 28.3 Active Status Gates
- **Status Validation**: Both restore and delete require the wedding to be in an inactive status (`CLOSED` or `CANCELLED`). Active weddings cannot be restored (rejected as bad request) and cannot be deleted (rejected as bad request). Under Cycle 7, restore is also strictly blocked for `DELETED` weddings, as `DELETED` is a terminal state.

### 28.4 Best-Effort Disk Cleanup
- **Background Image Deletion**: When a wedding is successfully hard deleted, the local background image file stored on the server disk is deleted on a best-effort basis, preventing disk space leaks.

---

## 29. Development Cycle 6 Decisions: ProductFeedback User History & Admin Display Verification

### 29.1 User History Endpoint & UI
- **GET /api/feedback/my**: Added a secure endpoint returning only the logged-in user's submitted feedback history (using `MyProductFeedbackResponse`), preserving isolation from other users.
- **Mobile screen (“הפניות שלי”)**: Created a dedicated user feedback history list screen showing the type, text, status, and creation date, with a link to navigate there from the settings.

### 29.2 Admin Display Verification
- **Human-Readable Sender**: Verified that Admin feedback screens display `senderName` and `senderEmail` as the primary human-readable sender details.
- **Secondary Technical Info**: Retained `senderUserId` as secondary/technical metadata. No UI modifications were required since these fields were already displayed.

---

## 30. Cycle 1 MVP+ Decisions: Auth Route Separation, Wedding Lists Focus Refresh, and Wedding Participants Modal UI

### 30.1 Auth Route Separation
- **Endpoint Protection**: Added a role-based validation check to the regular user login endpoint (`AuthService.login`). Regular users log in as before, but staff accounts (`EVENT_MANAGER`, `ADMIN`) attempting to log in via this flow are rejected with an HTTP 403 Forbidden status and the message `"Staff account must use staff portal"`.
- **Hebrew Error Mapping**: The mobile application translates this backend error in `errorMessage.ts` to `חשבון צוות צריך להיכנס דרך פורטל צוות`.

### 30.2 Wedding Lists Focus Refresh
- **Active Navigation Listener**: Refactored `EventManagerWeddingsScreen.tsx` and `MyWeddingsScreen.tsx` to use React Navigation's `useFocusEffect` combined with `useCallback`. This triggers an automatic fetch of the latest wedding and participant status whenever the user returns to these screen views, preventing stale lists.

### 30.3 Wedding Participants Modal UX
- **Modal Add/Invite**: Refactored `WeddingParticipantsScreen.tsx` so the inline input forms for adding existing members or inviting new guests are consolidated into a bottom modal screen. The modal features a tab selector ("הוספת משתמש קיים" / "הזמנת משתמש חדש") and is launched by a single primary button. Closed or cancelled weddings render in a read-only state.

---

## 31. Cycle 2 MVP+ Decisions: Unified Onboarding Hub & Opening Profile Navigation

### 31.1 Code Reusability and Client-Side Separation
- **Form UI Extraction**: Decided to isolate input form presentation and validations from screen component state. Creating reusable `BasicProfileForm` and `FullProfileForm` simplifies future UI adjustments and avoids duplicating form validation logic.
- **Contract Safety**: Retained existing screen navigation wrappers and API endpoints to ensure changes are completely isolated to UI components, requiring zero API changes.

### 31.2 Central Profile Dashboard Hub
- **ProfileScreen.tsx Consolidation**: Combined the basic form, full profile form, and photo manager into a single edit profile hub. This provides users with a cohesive workspace to manage their presence, rather than requiring them to jump across separate standalone screens.

### 31.3 View-Only Navigation from Opening Messaging Contexts
- **Strictly View-Only Isolation**: Decided to enable viewing another user's candidate profile from opening lists and details without changing the underlying lifecycles. Opening remains opening; no like/dislike actions are recorded, no match is created, and pre-match chats are not bypassed.
- **RTL Context Banner**: Decided to pass a context label in route params to CandidateProfile to inform the user how they navigated to the profile. This is rendered in a subtle banner.
- **Split Touch zones (No Nesting)**: Decided to split the conversation summary card into sibling Touchables to prevent nested touch bugs.
- **Dynamic Header Loading with Fallbacks**: Decided to fetch the public profile inside the conversation details screen only. If the API fails, the screen falls back gracefully to passed parameters or generic Hebrew text without showing errors.

---

## 32. Cycle 3 MVP+ Decisions: Opening / Match / Chat Continuity and Stale Opening Handling

### 32.1 Backend Match Continuity
- **Message Migration**: When a Match is created via mutual Like, any existing pre-match OpeningConversation between the two users is automatically processed. Its messages are attached/migrated directly to the newly created Chat history.
- **State Deactivation**: The OpeningConversation's active status is set to inactive to prevent duplicate processing.

### 32.2 Mobile Chat CTA for Matched Openings
- **Matched Opening Detail screen**: In `OpeningConversationDetailsScreen.tsx`, when an opening conversation's matched state is active (i.e. already converted to a Match), the user is presented with a clear banner/status indicating the match exists, along with a "Chat" CTA to navigate directly to the corresponding active Chat screen.

### 32.3 Discover / Lists Match CTA
- **Mutual Like CTA**: Tapping "Like" on the Discover screen or Lists screen which results in a mutual Like Match now prompts a clear feedback/CTA allowing the user to navigate directly to the new Chat.

### 32.4 Stale Opening Handling
- **Hebrew Guard Explanation**: If a user attempts to send an opening message to a user they are already matched with, the system handles the conflict gracefully with a clear Hebrew explanation and provides immediate navigation to Chat when the matchId is available.

### 32.5 Boundary Isolation
- **No Schema/API Contract Changes**: No database schemas, entities, DTOs, migrations, or public API endpoints were created or modified in this cycle.
- **QA Exclusions**: Runtime manual QA is deferred per project process.

---

## 33. Cycle 4 MVP+ Decisions: User Reports History & Recent Updates Aggregation

### 33.1 User Reports History Endpoint
- **GET /api/reports/my**: Implemented a secure backend endpoint for regular users to retrieve the status and history of user reports they have submitted, returning `MyUserReportResponse`.
- **MyProductFeedbackResponse Timestamp**: Added `updatedAt` field to `MyProductFeedbackResponse` to support sorting and auditing.

### 33.2 Mobile Unified Requests History
- **Unified Screen ("הפניות שלי")**: Refactored the screen to load and present both product feedback and user reports in a single chronological view, displaying status, type/reason, date, and detail fields in Hebrew.

### 33.3 Mobile "My Notifications" / Recent Updates Screen
- **Updates Screen ("ההתראות שלי")**: Added a lightweight, mobile-only recent updates screen that aggregates recent likes received, matches, opening messages, product feedback status changes, and user report status changes.
- **Strict Exclusions**: There is no Notification database table, entity, backend service, or backend endpoint. No read/unread state tracking, push notifications, websockets, polling, or local persistence was added. Normal chat messages are not displayed.
- **Navigation Shortcuts**:
  - Likes → CandidateProfile
  - Matches → MatchDetails
  - Opening Messages → OpeningConversationDetails
  - Feedback / Reports status updates → MyProductFeedback
- **Role Limits**: The notifications center button on the "Me" screen is only shown to regular users (USER) and hidden for admins and event managers.
- **QA Exclusions**: Runtime manual QA is deferred per project process. TypeScript and static analysis verify navigation parameter safety.

---

## 34. Cycle 5 MVP+ Decisions: Admin/Staff Unified User Details Foundation

### 34.1 Backend Unified User Details API
- **GET /api/admin/users/{userId}/details**: Added a direct, wedding-independent user details endpoint for Admins.
- **Authorization Guard**: Restricts access strictly to the `ADMIN` role. Regular users or event managers calling it are rejected with HTTP 403 Forbidden.
- **Response Structure**: Reuses the flat `StaffParticipantDetailsResponse` DTO structure, which contains both basic/full profile questionnaire fields and user photo lists. It does not expose `passwordHash` or `storagePath`.

### 34.2 Mobile StaffParticipantDetails Screen Enhancements
- **Direct Fetch Support**: Updated `StaffParticipantDetailsScreen` to support fetching user details when `weddingId` is absent in navigation params.
- **Conditional Dispatch**:
  - Admin mode + `weddingId` present: Calls the existing wedding-scoped endpoint `/api/admin/weddings/{weddingId}/participants/{userId}/details`.
  - Admin mode + `weddingId` absent: Calls the new direct endpoint `/api/admin/users/{userId}/details`.
  - Event Manager mode: Requires `weddingId` and uses Event Manager wedding-scoped API.
- **Flat Mobile Types**: Aligned `StaffParticipantDetailsResponse` mobile type to be a flat object, mirroring the backend DTO structure.
- **Basic/Full Grouping**: Groups and displays profile details sections using the flat fields of the response.

### 34.3 Mobile AdminUsers Entry Point
- **Navigate on Card Press**: Allowed clicking user cards in `AdminUsersScreen` to navigate to `StaffParticipantDetails` in `ADMIN` mode, passing `userId` and `source: 'ADMIN_USERS'` but omitting `weddingId`.
- **Accidental Navigation Prevention**: Maintained separate click targets for block/unblock actions so that tapping them does not trigger navigation.
- **State Preservation**: Preserved `focusUserId` filter and highlight behaviors.

### 34.4 Exclusions & MVP Boundaries
- **No DB Schema Changes**: No database tables, schemas, or migrations were modified or created.
- **No Cascade Changes**: Reports (`AdminReportDetailsScreen`) and Product Feedback (`AdminProductFeedbackDetailsScreen`) screens were intentionally left unchanged and not connected.
- **No Event Manager Global Access**: Event managers still require a valid `weddingId` to view participant details.
- **QA Exclusions**: Runtime manual QA is deferred per project process.

---

## 35. Cycle 6 MVP+ Decisions: Admin Reports and ProductFeedback Profile Navigations

### 35.1 Mobile Admin Reports Direct Profile Navigation
- **Sender/Reported User Navigation**: Updated `AdminReportDetailsScreen` to allow admins to navigate to `StaffParticipantDetailsScreen` by clicking on the sender's or reported user's card/header (in `ADMIN` direct mode, passing `userId` and omitting `weddingId`).

### 35.2 Mobile Admin ProductFeedback Sender Profile Navigation
- **Sender Navigation**: Updated `AdminProductFeedbackScreen` and `AdminProductFeedbackDetailsScreen` to allow admins to navigate to `StaffParticipantDetailsScreen` when clicking on the feedback submitter's card/header in `ADMIN` direct mode.

### 35.3 Event Manager Restrictions & Boundary Preservation
- **Restricted Access**: Existing Event Manager restrictions were fully preserved. Event Managers do not gain access to global Admin Reports, Admin Product Feedback, or direct wedding-independent profiles.
- **ProductFeedback and UserReport Separation**: `ProductFeedback` and `UserReport` remain separate workflows.
- **No Backend/API/DB Changes**: No backend changes, database schema updates, or API endpoint updates were required for Cycle 6.

---

## 36. Cycle 7 MVP+ Decisions: Wedding Hard Delete Tombstone Policy

### 36.1 Wedding Status DELETED & Tombstone Policy
- **Tombstone Instead of Physical Row Delete**: The backend no longer physically deletes the `Wedding` row during an Admin hard delete. Instead, the wedding is marked with status `WeddingStatus.DELETED`.
- **Terminal State**: `DELETED` is a hidden terminal state. A wedding marked as `DELETED` can never be restored.
- **Staff Access restrictions**: `DELETED` weddings are hidden from normal backend wedding lists (event manager list, admin list) and active/normal lists.
- **Cascade Deletion Boundaries**:
  - **Physically Deleted**: `WeddingParticipant` rows, `WeddingInvite` rows, and the local wedding background image file (best-effort disk cleanup).
  - **Preserved**: Users, UserPhotos, UserActions, Matches, ChatMessages, OpeningConversations, OpeningMessages, UserReports, ProductFeedback, UserBlocks, and all global/transactional data.

### 36.2 Entry Gates & Validation Blocking
- **Access Code invalidation**: A `DELETED` wedding retains its `accessCode` internally to prevent orphan references, but the code is not reusable. Endpoint validation (`validate-code`) and joining (`join-wedding`) reject `DELETED` weddings as invalid / not joinable.
- **Discover Invalidation**: Discover matching/feed fetches exclude `DELETED` weddings.

### 36.3 Relationship Safety & Chat Continuity
- **Blocked Opening Replies**: Tapping "Reply" or sending messages in an opening conversation context of a `DELETED`, missing, or non-active wedding is blocked.
- **Match-Creation Block**: An older opening conversation in a `DELETED` or non-active wedding context cannot create a new match.
- **Lists / Liked Me Filtering**: User lists (e.g., Liked Me, Match list, etc.) filter out candidate items or actions tied to `DELETED` or missing weddings.
- **Chat Accessibility**: Existing matches and chats remain accessible to users as historical records.

### 36.4 Restore Restrictions
- **CLOSED/CANCELLED Restore Only**: The restore wedding action is allowed only for `CLOSED` and `CANCELLED` weddings under standard permission rules.
- **Blocked for DELETED**: Restoring is strictly blocked for `DELETED` weddings (returns HTTP 400 Bad Request).

### 36.5 Admin Delete Eligibility
- **Active Blocked**: Active weddings remain blocked from Admin hard delete (returns HTTP 400 Bad Request).
- **Closed/Cancelled Allowed**: Closed or cancelled weddings are eligible for deletion even if historical user-to-user interactions exist.

---

## 37. Cycle 8 MVP+ Decisions: Profile Unification and Single Save

### 37.1 Single Profile Level Concept
- **Unified Profile Representation**: Basic and Full profile fields represent completion levels and eligibility thresholds of a single user profile. They are not two separate entity objects.
- **Content Requirements**: Full profile includes all Basic profile fields. Basic-before-Full is a content hierarchy requirement, not a requirement to persist BASIC first.
- **Direct NONE to FULL Transition**: The backend allows moving a profile directly from `NONE` status to `FULL` status without a persisted intermediate `BASIC` state.

### 37.2 Atomic and Transactional Operation
- **Single Save Endpoint**: An additive unified endpoint (`PUT /api/profile/me`) was chosen to handle saving profile text in one request.
- **Service-Level Transactional boundaries**: The method `updateUnifiedProfile` is annotated with `@Transactional` at the method level to ensure atomicity.
- **Validation Before Mutation**: Validations are fully completed before modifying the user object. An invalid FULL request causes no partial mutation or save of Basic fields.
- **No Downgrades on targetLevel BASIC**: Updating a profile with target level `BASIC` does not downgrade the user status if the user is already `FULL` or `FULL_INCOMPLETE_BLOCKED`, nor does it erase existing Full fields.

### 37.3 Photo APIs Independence
- **Photos API Separation**: Photo uploads/deletions remain outside the textual profile save transaction. They are independently and immediately persisted via the existing Photo API.

### 37.4 Compatibility Preservation
- **Legacy Endpoints Retained**: The existing endpoints `GET /api/profile/me`, `PUT /api/profile/basic`, and `PUT /api/profile/full` are retained for backward compatibility with external/legacy flows.

---

## 38. Batch 9A Decisions: Notifications, Event Manager Lifecycle, and Reassignment

### 38.1 Match & Chats UI Polish
- **Hebrew Banner**: A Match details screen banner (`נוצרה התאמה — אפשר להמשיך את השיחה בצ׳אט`) was chosen to indicate match continuity. The existing Chat CTA remains the primary interaction point.
- **Compact Chat Rows**: WhatsApp-style compact list rows displaying candidate photo, name, last-message preview, timestamp, and unread state were adopted.
- **Split Touch Targets**: In the Chats list and header, clicking the user photo/name or the chat header navigates to the Candidate Profile, while clicking the row body opens the Chat screen.

### 38.2 Persistent Notifications Architecture
- **UserNotification Entity**: A dedicated database entity `UserNotification` was introduced.
- **No Cascades**: The entity uses scalar IDs (`userId`, `actorUserId`, `referenceId`) instead of JPA cascades to source entities (such as Matches, reports, etc.) to ensure database decoupling and prevent cascade deletion anomalies.
- **Deduplication**: Key-based transition semantics ensure duplicate events (e.g. rapid feedback transitions) are deduplicated.
- **Notification Types**: Supported type enums are `LIKE_RECEIVED`, `MATCH_CREATED`, `OPENING_RECEIVED`, `PRODUCT_FEEDBACK_STATUS_CHANGED`, and `USER_REPORT_STATUS_CHANGED`.
- **Invariants**: No push notifications, email, WebSocket, background jobs, or standard chat message notifications. Persistent history is read-only (no deletion). No historical Backfill; notifications start post-deployment.

### 38.3 Event Manager State & Access Rules
- **Independent State Values**: `adminBlocked` and `eventManagerActive` are independent attributes. Access requires `!adminBlocked && eventManagerActive`.
- **Active-by-Default Policy**: Newly created Event Managers have `eventManagerActive` set to true. Null/legacy values are treated as active.
- **Token Invalidation**: Deactivation or blocking rejects active authentication tokens on subsequent requests.
- **No Automatic Transfer**: Block or Deactivate does not trigger automatic wedding ownership transfer. Inactive managers are visible for admin auditing but cannot be assigned to new weddings.

### 38.4 Event Manager Admin Reassignment
- **Endpoint Structure**: Endpoints `/api/admin/event-managers/{managerId}` (details) and `/api/admin/event-managers/{managerId}/weddings/reassign-to-current-admin` (reassign) were implemented.
- **Request Format**: The reassignment accepts a flat `{ weddingIds: number[] }` shape.
- **Safety**: Checked and validated before mutation. Executed transactionally (all-or-nothing). Only `ACTIVE`, `CLOSED`, and `CANCELLED` weddings can be reassigned; `DELETED` tombstones are excluded. Reassignment preserves participants, invitations, matches, codes, status, and history. The wedding remains single-owner (no many-to-many manager model).

### 38.5 Event Manager Mobile Hub Design
- **Entry Points**: The Event Manager Mobile Hub serves as a central dashboard with six clear entry points: Event Manager list, Admin Users list (EVENT_MANAGER), Wedding list owner section, Wedding details owner section, Create Wedding manager picker, and Wedding details manager picker.
- **Touch Zone Separation**: Separated picker selection card touch zones from manager details touch zones to prevent accidental activations.
- **Form State Preservation**: Navigating to the Hub and back preserves the create/edit wedding form inputs.

### 38.6 QA Release Decisions
- **Manual QA Deferred**: Manual verification of the runtime environment is explicitly deferred to post-checkpoint. Release status remains "Manual QA Pending". Do not claim production-readiness or runtime-verified status. Any regression found during deferred manual QA will be resolved in a subsequent focused fix.
