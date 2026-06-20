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
- opening message
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
- wedding backgrounds
- broadcast
- Cloudinary full integration unless later approved
- advanced filters
- match scoring
- profile view counter
- inquiry phone
- user reports
- user-to-user blocking
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
- UserReport
- LoginAttempt
- SystemLog
- SystemRules
- UserStateEvaluator
- MatchScore
- WeddingBackground
- OpeningMessage

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
7. `WeddingStatus`: `ACTIVE`, `CLOSED`, `CANCELLED`
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
