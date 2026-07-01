# TECH_SPEC.md — Shiduchim MVP

## 1. Purpose

Short technical working spec for the new Shiduchim MVP project.

Use this file to understand:
- stack
- repo structure
- backend architecture
- final entities/enums
- core DB relationships
- key business rules
- mobile screen structure

Do not use this file as API Contract. Use `API_CONTRACT.md` for endpoints and DTOs.

---

## 2. Locked Stack

| Area | Decision |
|---|---|
| Main tool | Antigravity |
| Backend | Java 21 + Spring Boot 3.5.x |
| Mobile | React Native + Expo + TypeScript |
| Main DB | MySQL via Docker Compose |
| DB fallback | H2 only if MySQL blocks progress temporarily |
| Repo | One repo: `backend/`, `mobile/`, `docs/` |
| Method | API Contract first, then small batches |

No stack replacement. No React Web. No Spring Boot 4. No Cloudinary unless later approved.

---

## 3. Repo Structure

```text
shiduchim-mvp/
  backend/
  mobile/
  docs/
```

### Backend architecture

```text
controller/
service/
repository/
entity/
dto/
enums/
config/
```

Rules:
- Controllers expose endpoints, accept requests, return responses, delegate to services.
- Services contain business logic: auth, profile, photos, weddings, eligibility, actions, match, chat, admin.
- Repositories are Spring Data JPA repositories with simple queries.
- Entities map DB only. No heavy business logic inside entities.
- DTOs separate API from entities and prevent leaking private fields.
- Config is only for security, CORS, DB, file upload/static serving.

Do not add System Layer, jobs, health monitoring, heavy logs, reports, AI, Push, WebSocket, notifications, OTP or device tokens.

### Mobile architecture

Expected folders:

```text
mobile/src/screens/
mobile/src/components/
mobile/src/api/
mobile/src/navigation/
mobile/src/types/
mobile/src/storage/
mobile/src/theme/
```

Rules:
- Mobile is API-driven.
- Simple navigation.
- Simple local state unless approved otherwise.
- Mobile-first, clean, respectful UI.
- No Push, WebSocket, realtime or heavy state management.

---

## 4. Final Entities

All entity IDs are `Long` auto-increment.

### 4.1 User

Represents USER, EVENT_MANAGER, ADMIN. There is no separate `UserProfile` entity in MVP.

Main fields:
- `id: Long`
- `fullName: String?`
- `gender: Gender?`
- `age: Integer?`
- `heightCm: Integer?`
- `areaOfResidence: String?`
- `religiousLevel: String?`
- `phone: String?`
- `email: String`
- `passwordHash: String`
- `role: UserRole`
- `profileStatus: ProfileStatus`
- `adminBlocked: Boolean`
- `education: String?`
- `occupation: String?`
- `selfDescription: Text?`
- `hobbies: Text?`
- `lookingFor: Text?`
- `familyDescription: Text?`
- `headCovering: String?`
- `hasDrivingLicense: Boolean?`
- `createdAt: LocalDateTime`
- `updatedAt: LocalDateTime`

Constraints:
- `email` unique.
- `role`, `profileStatus`, `adminBlocked` not null.
- `adminBlocked` default false.
- `gender` required only for USER participating in matchmaking; nullable for EVENT_MANAGER and ADMIN.
- `gender` locked after USER creation.
- `fullName` locked after basic profile confirmation.
- No phone exposure to other users.
- No email exposure to public profiles.

Do not add: AI fields, device token, OTP, login attempts, profile view counter, inquiry phone, user reports, user-to-user blocking.

---

### 4.2 UserPhoto

Represents up to two local photos for a user.

Fields:
- `id: Long`
- `userId: Long`
- `storagePath: String`
- `imageUrl: String`
- `isPrimary: Boolean`
- `orderIndex: Integer`
- `createdAt: LocalDateTime`

Constraints:
- Max 2 photos per user.
- One primary photo when user has photos.
- First photo becomes primary.
- Primary photo is required for Discover and Actions.
- Delete photo = physically delete local file + delete DB row.
- No soft delete. No `deleted` flag.
- If primary is deleted and another photo exists, remaining photo becomes primary.
- If last photo is deleted, user has no primary photo and is blocked from Discover/Actions.

---

### 4.3 Wedding

Represents a wedding/event pool.

Fields:
- `id: Long`
- `name: String`
- `city: String`
- `weddingDate: LocalDate`
- `accessCode: String`
- `ownerUserId: Long`
- `status: WeddingStatus`
- `createdAt: LocalDateTime`
- `updatedAt: LocalDateTime`

Constraints:
- `accessCode` unique.
- Event manager may enter accessCode manually.
- If empty, server generates a short random code.
- Owner must be EVENT_MANAGER or ADMIN.
- Only owner or ADMIN can manage wedding.
- CLOSED/CANCELLED wedding blocks new joins, participant management, and background management (Event Manager and Admin cannot upload/delete backgrounds on inactive weddings). Regular users do not receive an active wedding experience for inactive weddings (no Join, no Discover, no active QR/link/invitation text).

---

### 4.4 WeddingParticipant

Connects User to Wedding.

Fields:
- `id: Long`
- `weddingId: Long`
- `userId: Long`
- `status: ParticipantStatus`
- `joinedAt: LocalDateTime`
- `removedAt: LocalDateTime?`

Constraints:
- Unique `(weddingId, userId)`.
- User can participate in multiple weddings.
- REMOVED does not appear in that wedding pool.
- Removal changes status; it does not physically delete the row.
- Admin can view and manage wedding participants globally. Event Manager owner can view and manage participants for owned weddings. Non-owner Event Manager cannot manage another manager's wedding. Regular users cannot access participant management.
- Participants are shown in a dedicated screen, not inline inside wedding details. Invites remain in the wedding details screen and are not broken. Participant management is blocked/unavailable for inactive weddings.

---

### 4.5 UserAction

Stores the last active action from actor to target in a context.

Fields:
- `id: Long`
- `actorUserId: Long`
- `targetUserId: Long`
- `actionType: ActionType`
- `poolType: PoolType`
- `weddingId: Long?`
- `createdAt: LocalDateTime`
- `updatedAt: LocalDateTime`

Constraints:
- `actorUserId != targetUserId`.
- Unique `(actorUserId, targetUserId, poolType, weddingId)`.
- Upsert behavior: create if missing, update `actionType` if exists.
- Last action wins.
- Target can be in only one list per actor per context: Like / Dislike / Freeze.
- Unfreeze is not an ActionType; it removes Freeze.
- No action toward same gender.
- No action if actor or target is blocked or not eligible.

---

### 4.6 Match

Represents mutual-like match in a context.

Fields:
- `id: Long`
- `user1Id: Long`
- `user2Id: Long`
- `poolType: PoolType`
- `weddingId: Long?`
- `status: MatchStatus`
- `createdAt: LocalDateTime`
- `updatedAt: LocalDateTime`
- `blockedAt: LocalDateTime?`

Constraints:
- `user1Id != user2Id`.
- Store users in stable order, recommended smaller ID first.
- Unique `(user1Id, user2Id, poolType, weddingId)`.
- Match created only by mutual Like.
- Starts as ACTIVE.
- Dislike/Freeze after Match changes it to BLOCKED.
- BLOCKED Match is not shown as active.
- Chat is allowed only on ACTIVE Match.
- If BLOCKED Match later becomes mutual Like again, prefer reactivating existing Match instead of creating duplicate.

---

### 4.7 ChatMessage

Simple text message after ACTIVE Match.

Fields:
- `id: Long`
- `matchId: Long`
- `senderId: Long`
- `content: Text`
- `sentAt: LocalDateTime`
- `readByRecipient: Boolean`

Constraints:
- `content` not blank.
- sender must be one side of the Match.
- Match must be ACTIVE.
- `readByRecipient` default false; tracks if the message has been read by the recipient.
- No read receipts or per-message read timestamps exposed to the other user, no WebSocket, no Push.

---

### 4.8 WeddingInvite

Lightweight administrative invitation.

Fields:
- `id: Long`
- `weddingId: Long`
- `fullName: String`
- `email: String`
- `invitedByUserId: Long`
- `acceptedUserId: Long?`
- `status: WeddingInviteStatus`
- `createdAt: LocalDateTime`
- `acceptedAt: LocalDateTime?`

Constraints:
- `email` not blank.
- `status` default `PENDING`.
- No real emails are sent. No invite token, magic links, or QR codes.
- Joining a wedding or registering with the same email updates status to `ACCEPTED`.
- Any user can join by `accessCode` without a pre-existing invite.

---

## 5. Final Enums

| Enum | Values |
|---|---|
| `UserRole` | `USER`, `EVENT_MANAGER`, `ADMIN` |
| `Gender` | `MALE`, `FEMALE` |
| `ProfileStatus` | `NONE`, `BASIC`, `FULL`, `FULL_INCOMPLETE_BLOCKED` |
| `ActionType` | `LIKE`, `DISLIKE`, `FREEZE` |
| `PoolType` | `WEDDING`, `GLOBAL` |
| `MatchStatus` | `ACTIVE`, `BLOCKED` |
| `WeddingStatus` | `ACTIVE`, `CLOSED`, `CANCELLED`, `DELETED` |
| `ParticipantStatus` | `ACTIVE`, `REMOVED` |
| `WeddingInviteStatus` | `PENDING`, `ACCEPTED`, `CANCELLED` |

Notes:
- No role table.
- No complex permission system.
- `Unfreeze` is an endpoint action, not an enum value.

---

## 6. DB Relationships

| Relationship | Implementation |
|---|---|
| User 1:N UserPhoto | `UserPhoto.userId` |
| User N:M Wedding | through `WeddingParticipant` |
| Wedding 1:N WeddingParticipant | `WeddingParticipant.weddingId` |
| UserAction actor/target | `actorUserId`, `targetUserId` |
| Match between two Users | `user1Id`, `user2Id` |
| Match 1:N ChatMessage | `ChatMessage.matchId` |
| Wedding context for UserAction | `weddingId` only when `poolType=WEDDING` |
| Wedding context for Match | `weddingId` only when `poolType=WEDDING` |
| Wedding 1:N WeddingInvite | `WeddingInvite.weddingId` |
| User 1:N WeddingInvite (inviter) | `WeddingInvite.invitedByUserId` |

---

## 7. Core Eligibility Rules

### System usage

User can use protected features only if:
- authenticated
- `adminBlocked=false`
- role matches endpoint

For matchmaking features:
- suitable `profileStatus`
- primary photo exists
- not `FULL_INCOMPLETE_BLOCKED`

*Note on Wedding Code Onboarding*: Joining a wedding via accessCode (either during onboarding or later) only links the user as a participant. It does **not** bypass basic profile completion or primary photo requirements. The user remains ineligible for Discover and Actions until basic profile and primary photo are uploaded.

### Wedding pool candidate

Candidate appears in wedding Discover if:
- `adminBlocked=false`
- `profileStatus` is BASIC or FULL
- has primary photo
- active participant in the wedding
- wedding is ACTIVE
- not the viewer
- opposite gender
- viewer has no active UserAction toward candidate in the same wedding context

### Global pool candidate

Candidate appears in global Discover if:
- `adminBlocked=false`
- `profileStatus=FULL`
- has primary photo
- not the viewer
- opposite gender
- viewer has no active UserAction toward candidate in GLOBAL

No global approval. FULL profile opens global automatically.

---

## 8. Like / Dislike / Freeze Rules

- Every action belongs to a context: `poolType` + optional `weddingId`.
- One active action per actor-target-context.
- Last action wins.
- Like replaces Dislike/Freeze.
- Dislike replaces Like/Freeze.
- Freeze replaces Like/Dislike.
- Unfreeze removes Freeze.
- Discover excludes targets with active UserAction in the same context.
- After Unfreeze, target may return to Discover if still eligible.
- If there is ACTIVE Match, Dislike/Freeze blocks it.
- Target is not told whether the user chose Dislike or Freeze.
- **Cross-Context Actions**: Like, Dislike, and Freeze decisions are treated as user-to-user decisions across contexts. For example, if a user Likes/Dislikes/Freezes someone in a Wedding Discover pool context, that target user is excluded from the viewer's Global Discover pool, and vice versa. Return to Feed removes the user-to-user action and allows the candidate to return to discover feeds according to eligibility.

---

## 9. Match Rules

- Match is created only by mutual Like.
- First Like is one-sided.
- Second opposite Like creates Match.
- Match belongs to context: WEDDING or GLOBAL.
- No duplicate Match in same context.
- ACTIVE Match opens Chat.
- BLOCKED Match is hidden from active Matches.
- Dislike/Freeze after Match blocks Match and Chat.
- liked-me hides users who already became ACTIVE Match.
- **Cross-Context Matches**: An active Match in any context hides both users from each other in both Discover Wedding and Discover Global. It also prevents another Like or Opening Message initiation against the same user. Liked Me does not show a relationship after it has converted into a Match. No duplicate Match can be created.

---

## 10. Chat Rules

- Chat opens only after ACTIVE Match.
- HTTP GET/POST only.
- Text messages only.
- No WebSocket.
- No realtime.
- Unread counts are allowed as internal badges only (conversation unreadCount & total unreadCount).
- Resetting unread count when recipient opens chat is allowed.
- No read receipts or read timestamps are exposed to the peer (no blue checks, no "seen" label, no per-message readAt).
- No attachments.
- No edit/delete in MVP.
- BLOCKED Match blocks sending and active chat display.

---

## 11. Mobile Screens

### USER

- Register/Login
- My Profile (ProfileScreen: unified onboarding and profile center where basic profile, full profile, and photo uploads are managed inline. PhotosScreen exists as a functional wrapper for specific return flows like missing-photo / returnToWedding, but there is no separate "My Photos" button on MeScreen)
- Join Wedding
- Pool Selection
- Discover Cards
- Public Candidate Profile
- My Likes
- My Dislikes
- My Freezes + Unfreeze
- Liked Me
- Matches
- Chat

### EVENT_MANAGER

- My Weddings
- Create Wedding
- Wedding Details + Access Code
- Participants Management
- Add Participant by Email
- Basic Stats: participants count, matches count

### ADMIN

- Users
- Weddings
- Create Event Manager
- Block/Unblock User
- Assign Self to Wedding

---

## 12. Critical Edge Cases

- No basic profile: no Discover, no Actions.
- No primary photo: no Discover, no Actions.
- FULL user missing required field: `FULL_INCOMPLETE_BLOCKED`.
- `adminBlocked=true`: no system use, no Discover, no Actions, no Chat, no join wedding.
- Invalid accessCode: 400 or 404.
- CLOSED/CANCELLED wedding: no join.
- REMOVED participant: not shown in that wedding pool.
- Like ineligible target: 403 and no UserAction created.
- Duplicate Match: prevented by unique constraint/service.
- Chat without ACTIVE Match: 403.
- Event manager managing other wedding: 403 unless ADMIN assigned.
- User changing gender after creation: 400 or 403.
- Public profile never exposes email/phone.

---

## 13. Phase 14 MVP Additions

* **Return to Feed / Action Removal**: Supports `DELETE /api/actions/{targetUserId}` to remove an existing action (Like, Dislike, Freeze) so that the user may return to Discover if eligible, provided no active match exists.
* **Chats List & Conversations Endpoint**: Supports `GET /api/chats/conversations` to list active matches/conversations for the user, sorted newest-first by the latest message timestamp, with a preview of the last message.
* **Role-Based Home Navigation**: `MeScreen.tsx` dynamically displays navigation options for `USER`, `EVENT_MANAGER`, and `ADMIN` depending on the authenticated user's role.
* **Minimal Admin Mobile Screens**: Added screens to manage users (list and block/unblock), view weddings list, and create Event Manager accounts.
* **Minimal Event Manager Mobile Screens**: Added screens to list weddings, create a wedding, view access codes, manage participants (add by email, remove), and view basic stats.
* **Eligibility Rule Protection**: Stricter validation ensuring users without a primary photo cannot access Discover feeds or appear in other users' pools.

---

## 14. Phase 15 MVP Additions

* **Seed Admin**: An automatic backend seeder creates a default admin account (`admin@shiduchim.com` / `AdminPass123!`) if no users with the `ADMIN` role exist in the database upon startup. Seeder is backend-only, preventing manual SQL setup.
* **Staff Login & Role Validation**: Staff (Event Managers and Admins) authenticate via `POST /api/auth/staff-login`. The backend strictly validates that the user's role is `ADMIN` or `EVENT_MANAGER`. The mobile app restricts user navigation accordingly.
* **Welcome Screen / Public Entry Flow**: A mobile-side public entry screen allows users to input a wedding code before logging in or registering.
* **Event Manager Wedding Ownership**: Event Managers can only manage and edit weddings they own. Enforced strictly at the backend service layer. Admins can manage any wedding.
* **Wedding Code Onboarding with Auto-Join**: If a user enters a valid wedding code on the Welcome Screen, the mobile app holds the code locally as a `pendingWeddingCode` and automatically executes the join wedding request post-authentication.
* **Lightweight Invitations (`WeddingInvite`)**: Administrative-only entity tracking invites via email. No real email or SMS transmissions, no magic links, and no QR codes. Any user can join by `accessCode` without a pre-existing invite.
* **Deactivation / Block Rule**: Do not add `isActive` or new deactivate fields. Default MVP behavior relies on setting `adminBlocked = true` on the `User` entity to block/deactivate both regular users and Event Managers.
* **Administrative Operations Safety**: Deactivation, cancellation, blocking, and participant removal must be safe and soft operations. No hard deletes of transactional data (users, matches, chats, actions, reports, feedback, or blocks) are permitted. For wedding hard delete, see the internal tombstone policy (invites and participants are physically deleted, but the wedding row itself is preserved as status `DELETED` and never physically deleted).

---

## 15. Phase 17 Additions

Phase 17 is officially defined as: **"QA Notes Completion and Missing Feature Completion"**

* **Chat Unread Counts**:
  * Add a `readByRecipient: Boolean` flag (default false) to `ChatMessage`.
  * Conversation unread count calculation rules: count messages in a match context where `senderId != currentUserId` and `readByRecipient = false`.
  * Total unread count behavior: sum of unread counts across all active conversations. Expose via `GET /api/chats/unread-count`.
  * Reset unread counts: opening a conversation triggers `PATCH /api/matches/{matchId}/messages/read`, which sets `readByRecipient = true` for all messages in that match where `senderId != currentUserId`.
  * No read receipts, "seen" label, blue checks, per-message read timestamps, WebSockets, or Push notifications.
* **Regular User “My Weddings” Screen**:
  * Exposes simple user-safe data via `GET /api/weddings/my` using `UserWeddingResponse`.
  * Contains fields: `weddingId`, `weddingName`, `city`, `weddingDate`, `weddingStatus`, `participantStatus`, `joinedAt` (if available), and `isWeddingPoolEligible` (indicates whether this wedding can currently be used as a wedding pool, which requires both ACTIVE wedding status and ACTIVE participant status).
  * Does not expose other participants, invite lists, management/admin data, private emails, or other sensitive admin-only data.
* **Clear Join Indication**:
  * After joining a wedding via accessCode, display a clear success indication (e.g., “You successfully joined [Wedding Name].”).
  * Joining a wedding only links the user to the wedding. It does not bypass basic profile and primary photo eligibility requirements for the Wedding Pool.
* **Wedding Pool Selection from Joined Weddings**:
  * User selects from list of joined weddings instead of typing access codes manually.
  * Rules: show only weddings the current user has joined, allow only ACTIVE participation status, and allow only ACTIVE weddings. Does not bypass onboarding eligibility requirements.
* **Restore Cancelled Invite**:
  * Admin and Event Managers can restore a cancelled invite from `CANCELLED` status back to `PENDING` only.
  * Endpoint: `PATCH /api/event-manager/weddings/{id}/invites/{inviteId}/restore`.
  * Rules: Do not create a new invite instead of restoring, do not hard delete, do not send real email, do not add QR, magic links, or invite tokens.
  * Do not allow restore if:
    * the wedding is `CLOSED` or `CANCELLED`,
    * a `PENDING` or `ACCEPTED` invite already exists for the same email and wedding,
    * a user with that email is already an `ACTIVE` participant in the wedding.

---

## 16. Phase 18 Additions: Hebrew UI Localization & RTL Polish

Phase 18 is officially defined as: **"Hebrew UI Localization & RTL Polish"**

* **Mobile-Only UI Scope**:
  * All user-facing mobile frontend screens, buttons, navigation headers, placeholders, messages, dialogs, loading states, and error alerts are translated to Hebrew.
  * No backend, API, DTO, entity, or database files were modified or added.
* **UI Translation Strategy**:
  * Mappings are encapsulated in display-only helper functions within `mobile/src/utils/displayLabels.ts` (e.g., mapping `WeddingStatus`, `ParticipantStatus`, roles, pool types, gender, yes/no values, and formatting dates to `DD/MM/YYYY`).
  * Backend and validation error messages are caught locally in the frontend and mapped into friendly Hebrew display prose using `mobile/src/utils/errorMessage.ts` (mapping network timeouts, missing fields, validation failures, and HTTP status codes).
  * Avoids enum/internal database value translations (e.g., `'ACTIVE'`, `'USER'`, `'MALE'` remain in LTR in code and API payloads).
* **RTL & Layout Polish**:
  * Punctuation alignment: Hebrew sentences ending with question marks or exclamation marks are kept in logical syntax order.
  * Text and Layout Alignment: User-visible labels, headers, and descriptions are aligned right using `textAlign: 'right'` and `flexDirection: 'row-reverse'`.
  * Technical/System Values: Inputs and fields containing technical, copyable, or non-prose values (e.g. Email addresses, password entries, numeric codes, and wedding access codes) bypass right-alignment and are left-aligned (`textAlign: 'left'`) to preserve copy-paste stability and input usability.
  * Libraries: No external internationalization (i.e. `i18n`) dependencies or global `I18nManager.forceRTL(true)` overrides were added, ensuring pure vanilla CSS compatibility.

---

## 17. Cycle 1 Additions: Session Hardening, Join Flow & Deep Linking

### 17.1 Session Persistence Hardening
- **Authentication Resilience**: Strengthened frontend credentials restore on app startup. Invalidated tokens or unauthorized API states safely clear authentication states and redirect users back to the entry credentials screen without stalling the client.

### 17.2 Wedding Join Flow
- **Unified Landing Flow**: Combined access-code validation, login redirection for guest users, registration support for new users, and automatic/manual join execution into a single screen (`WeddingJoinLandingScreen.tsx`).
- **Readiness Guidance**: Upon successfully joining a wedding, regular users are evaluated for profile readiness. If the basic profile or primary photo are missing, appropriate Hebrew warning guidelines are shown advising them on missing steps to qualify for the wedding pool.

### 17.3 QR & Deep Linking Wiring
- **Mobile QR Cards**: Added client-side rendering of QR codes representing join links for ACTIVE weddings using `react-native-qrcode-svg`.
- **Custom App Scheme**: Configured React Navigation and Expo configuration to handle incoming custom URI scheme URLs:
  `shiduchim://join-wedding/:accessCode`
- **Dynamic Access Checks**:
  - Displays QR card and selectable link on Admin and Event Manager wedding details screens only if status is `ACTIVE` and access code exists.
  - Displays a Hebrew warning banner and prevents QR card generation if wedding status is `CLOSED` or `CANCELLED`.

---

## 18. Cycle 3 Additions: Safety, Reporting, Blocking & Initial Messages

### 18.1 User Reports MVP
- **Backend Schema**: Added `UserReport` entity with columns: `id` (Long, PK), `reporter_id` (FK to `User`), `reported_id` (FK to `User`), `reason` (Enum: `ReportReasonType`), `explanation` (Text), `status` (Enum: `ReportStatus`), `created_at` (Timestamp), `resolved_at` (Timestamp).
- **Enforcement & Admin Flow**:
  - Regular users can submit a report via `POST /api/reports/users/{reportedUserId}`.
  - Admins can retrieve reports using `GET /api/admin/reports` and `GET /api/admin/reports/{reportId}`.
  - Admins can mark a report as resolved using `PATCH /api/admin/reports/{reportId}/resolve`.
- **Mobile UI Integration**: Added `ReportUserScreen.tsx` where users can select a pre-defined reason and submit their complaint.

### 18.2 User-to-User Blocking
- **Backend Schema**: Added `UserBlock` entity with columns: `id` (Long, PK), `blocker_id` (FK to `User`), `blocked_id` (FK to `User`), `status` (Enum: `UserBlockStatus` - `ACTIVE`/`UNBLOCKED`), `created_at` (Timestamp), `updated_at` (Timestamp).
- **Dynamic Queries Integration**:
  - Modified query helpers in `UserRepository`, `MatchRepository`, `ListsService`, and `ActionService` to exclude blocked/blocker relations.
  - Blocked users are dynamically filtered out of Discover feed, Liked-Me list, Likes/Dislikes lists, and Chats/Conversations list view.
  - Blocking is non-destructive: it does not hard delete matches, messages, or actions, and does not alter `Match.status`.
- **Endpoints**:
  - `POST /api/blocks/{targetUserId}`: Creates or activates a block.
  - `PATCH /api/blocks/{targetUserId}/unblock`: Deactivates a block (changes status to `UNBLOCKED`).
  - `GET /api/blocks`: Retrieves list of blocked users for the current user.
- **Mobile Screens**: Added `BlockedUsersScreen.tsx` for listing and unblocking users. Integrated blocking actions on `CandidateProfileScreen.tsx` and `MatchDetailsScreen.tsx`.

### 18.3 OpeningMessages before Match
- **Backend Schema**:
  - Added `OpeningConversation` entity with columns: `id` (PK), `opener_id` (FK to `User`), `recipient_id` (FK to `User`), `status` (Enum: `OpeningConversationStatus` - `OPEN`, `MATCH_CREATED`), `created_at` (Timestamp), `updated_at` (Timestamp).
  - Added `OpeningMessage` entity with columns: `id` (PK), `conversation_id` (FK to `OpeningConversation`), `sender_id` (FK to `User`), `content` (Text), `created_at` (Timestamp).
- **Core Rules**:
  - Allows sending a single initial message to a candidate before a match is made.
  - Does not create `UserAction` (Like/Dislike).
- **Conversion Flow**:
  - `POST /api/opening-messages/{conversationId}/messages`: Allows recipient to reply.
  - If request body specifies `confirmCreateMatch=true`, the conversation converts to a standard mutual `Match`.
  - Upon conversion, a `Match` record is created, and the opening message history is copied over as standard `ChatMessage` records in order. The `OpeningConversation` status changes to `MATCH_CREATED`.
- **Endpoints**:
  - `POST /api/opening-messages/{targetUserId}`: Send initial message.
  - `POST /api/opening-messages/{conversationId}/messages`: Send reply or convert to match.
  - `GET /api/opening-messages/inbox`: Get received conversations.
  - `GET /api/opening-messages/sent`: Get sent conversations.
  - `GET /api/opening-messages/{conversationId}`: Get detailed message history.
- **Mobile Screens**: Added `OpeningMessagesScreen.tsx` (inbox/sent tabs) and `OpeningConversationDetailsScreen.tsx` with composer. Integrated "Send Message" action on `CandidateProfileScreen.tsx`.

---

## 19. Cycle 4 Additions: UI Hardening, Polling, Feedback & Wedding Backgrounds

### 19.1 Locked Gender UX
- **Mobile Display**: Gender inputs in `BasicProfileScreen.tsx` are disabled for regular users. A Hebrew caution label warns users that gender editing is locked.
- **API Payload Exclusion**: The client excludes the `gender` field from the profile update requests. The backend maintains database consistency by not altering the gender value during profile updates.

### 19.2 Chat Polling
- **Lightweight React Native Polling**: In `ChatScreen.tsx`, React Native `useFocusEffect` hooks register a `setInterval` that polls `GET /api/matches/{matchId}/messages` every 3 seconds.
- **Polled Read Triggers**: Each poll execution triggers the read API `PATCH /api/matches/{matchId}/messages/read` to clear recipient unread counts for that active match.
- **Resource Management**: The polling interval is automatically cleared when the screen loses focus (e.g. user navigates back or opens another tab) and when the component unmounts.

### 19.3 Product Feedback Reporting
- **Backend Schema**: Added `ProductFeedback` entity with columns: `id` (Long, PK), `sender_user_id` (FK to `User`), `type` (Enum: `FeedbackType` - `BUG`, `IMPROVEMENT`, `OTHER`), `text` (Text), `status` (Enum: `FeedbackStatus` - `NEW`, `IN_PROGRESS`, `RESOLVED`), `created_at` (Timestamp), `updated_at` (Timestamp).
- **Controller Rules**:
  - Users submit feedback using `POST /api/feedback`.
  - Users view their own feedback history using `GET /api/feedback/my`.
  - Admins list feedback via `GET /api/admin/feedback`, view single feedback via `GET /api/admin/feedback/{feedbackId}`, and update status using `PATCH /api/admin/feedback/{feedbackId}/status`.
- **Mobile UI**:
  - Added feedback form accessible from `MeScreen.tsx` (`ProductFeedbackScreen.tsx`).
  - Added Admin-only feedback review screen (`AdminProductFeedbackScreen.tsx` and `AdminProductFeedbackDetailsScreen.tsx`) for managing reported feedback items.

### 19.4 Wedding Background Images
- **Backend Storage & Schema**:
  - Added `background_url` (VARCHAR) to `Wedding` entity.
  - Implemented `WeddingBackgroundService` to handle saving background image files to local server directories (`/uploads/backgrounds`).
  - Added file size/type validation to ensure compatibility.
- **Background API Endpoints**:
  - `POST /api/admin/weddings/{id}/background` (Admin background upload).
  - `DELETE /api/admin/weddings/{id}/background` (Admin background deletion).
  - `POST /api/event-manager/weddings/{id}/background` (Event Manager background upload).
  - `DELETE /api/event-manager/weddings/{id}/background` (Event Manager background deletion).
- **Mobile Integration**:
  - Extracted DTO updates to expose `backgroundUrl` in all wedding details and validation responses.
  - Implemented `WeddingBackgroundManager.tsx` enabling staff to upload, replace, or delete backgrounds.
  - Rendered background image as screen backdrop on the public `WeddingJoinLandingScreen.tsx`.

## 20. Cycle 6 Additions: Profile and Photos UX improvements

### 20.1 Profile Service Guard
- **Backend Order Validation**:
  - Implemented validation in `ProfileService.java` to prevent saving a Full Profile questionnaire before the corresponding Basic Profile has been created/saved.

### 20.2 Mobile Guided Flow & Onboarding Navigation
- **Navigation Safety & Param Updates**:
  - Updated screen navigation parameter structures to pass necessary state context safely.
- **Guidance & Callouts**:
  - Added dynamic, status-aware helper callout components in `MeScreen.tsx` (for users with `NONE`, `BASIC`, or `FULL` profile states) directing them on their next onboarding steps.
  - Implemented a post-save continuation button in `BasicProfileScreen.tsx` redirecting to the full questionnaire flow.
  - Implemented a warning notice and navigation check in `FullProfileScreen.tsx` to prevent access to the full profile if the basic profile is missing.

### 20.3 Status-Aware ProfileScreen Display
- **Layout Adaptations**:
  - Updated `ProfileScreen.tsx` to dynamically hide empty full profile questionnaire details for users who have only completed their basic profile.
  - Rendered intuitive setup calls to action based on user completion state.

### 20.4 Reusable Profile Photos Manager
- **Component Isolation**:
  - Extracted the profile photo grids, add/delete mechanisms, and primary photo settings into a reusable `ProfilePhotosManager.tsx` component.
- **Profile Integration**:
  - Embedded `ProfilePhotosManager.tsx` directly into the unified `ProfileScreen.tsx` layout.
- **PhotosScreen Compatibility Wrapper**:
  - Re-routed `PhotosScreen.tsx` to serve as a wrapper around the `ProfilePhotosManager.tsx` component to retain backward-compatible navigation from wedding join and other flows.

---

## 21. Final manual Runtime QA Cycle Status

The final manual Runtime QA cycle has passed successfully for the recent Shiduchim MVP+ features (Batches 0–7).

### 21.1 QA Verification Summary
- **Profile / Photos UX**: Unified Profile UX, onboarding warnings, backend validation order, and embedded photo manager are fully verified. PhotosScreen wrapper is functional.
- **Cross-Context Actions & Matches**: Like, Dislike, and Freeze are treated as user-to-user decisions globally across contexts. Active matches hide users dynamically in both pools, block opening messages, and prevent new actions.
- **Opening Messages**: Pre-match isolated sandbox verified. Opener/recipient flow supports inbox/sent list. Message response rules (first reply doesn't create match; second reply/message requires confirmation; confirmation status creates match) are verified. Duplicate messages are blocked.
- **Participants Management**: Role-based access verified (Admin global; Event Manager owner-only; regular user blocked). Displayed in dedicated screen.
- **Inactive Weddings**: Inactive status (CLOSED/CANCELLED) blocks joins, participant management, and background updates. Public join cards and invitations warn users.
- **Admin Reports & Feedback**: Reporter and reported-user details display name and email. ProductFeedback displays sender name/email. Report resolution, feedback status updates, and AdminUsersScreen navigation targeting works as expected. Event Manager cannot access these screens.

---

## 22. Development Cycle 1: Onboarding, Unified Profile and My Weddings CTA

### 22.1 Post-Registration Onboarding
- **AuthContext and Redirect**:
  - Implemented `justRegistered` state in `AuthContext.tsx` when a user registers successfully.
  - The login/onboarding flow checks `justRegistered` to perform an immediate navigation redirect to the `Profile` screen.
- **Israel/Hebrew Guidance**:
  - Added structured Hebrew guidance to `ProfileScreen.tsx` specifically tailored for new users (`NONE` profile status) to clarify eligibility conditions for Basic and Full tiers, emphasizing that a primary photo is mandatory for the global pool.

### 22.2 Guided Onboarding Flow
- **Basic -> Full -> Photos Flow**:
  - Wired `BasicProfileScreen.tsx` to check route params for `continueToFullAfterBasic` and render a clear progression call-to-action button to navigate directly to the Full Profile questionnaire.
  - Wired `FullProfileScreen.tsx` to check route params for `continueToPhotosAfterFull` and render a clear call-to-action to navigate directly to the unified `ProfileScreen` photo upload area.

### 22.3 Unified Profile & Photo Management
- **Integrated View**:
  - Integrated `ProfilePhotosManager.tsx` directly into the bottom of `ProfileScreen.tsx` so users can edit their questionnaire fields and view/manage their photos on a single unified screen.
- **Two-Photo Cap**:
  - Updated the mobile photo manager UI to limit users to exactly two photos. When two photos exist, the photo upload controls are hidden/disabled, showing a Hebrew tip text explaining the limit.

### 22.4 My Weddings CTA
- **Clear Join Action**:
  - Added a prominent Hebrew "הצטרפות לחתונה" CTA button in both empty and populated states inside `MyWeddingsScreen.tsx` directing the user to the existing `JoinWedding` route.

---

## 23. Development Cycle 2: Opening Message Support from Liked Me List

### 23.1 Liked Me Metadata Enrichment
- **Backend Changes**:
  - Extended [LikedMeItemResponse](file:///c:/Projects/shiduchim-mvp/backend/src/main/java/com/shiduchim/backend/dto/list/LikedMeItemResponse.java) with opening conversation metadata: `hasOpenOpeningConversation` (Boolean), `openingConversationId` (Long), `openingConversationDirection` (String), and `openingConversationStatus` (String).
  - Updated [ListsService](file:///c:/Projects/shiduchim-mvp/backend/src/main/java/com/shiduchim/backend/service/ListsService.java) to populate this metadata for each "Liked Me" item, checking if there is an active `OpeningConversation` between the user and the liker in either direction (`SENT` or `RECEIVED`).
  - Implemented lookup logic that queries the `OpeningConversationRepository` to find the correct active pre-match conversation.

### 23.2 Mobile Liked Me Tab Opening Button
- **Mobile Changes**:
  - Updated `LikedMeItemResponse` type in [api.ts](file:///c:/Projects/shiduchim-mvp/mobile/src/types/api.ts) to include the opening conversation metadata fields.
  - Updated the "Liked Me" tab in [ListsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/lists/ListsScreen.tsx) to render the existing "Opening Message" button using the existing `renderOpeningMessageButton(item)` helper.
  - Clicking the button opens the standard pre-match conversation view (`OpeningConversationDetails`), allowing the user to initiate or respond to an opening conversation.
  - Opening Message is still NOT a Like, and does NOT automatically create a Match or standard Chat until mutual Likes or explicit Match creation/confirmation occurs.

---

## 24. Development Cycle 3: Staff Participant Details & Restore

### 24.1 Backend Endpoints & Service Logic
- **New Endpoints**:
  - `GET /api/event-manager/weddings/{id}/participants/{userId}/details` (Event Managers, if owner)
  - `GET /api/admin/weddings/{weddingId}/participants/{userId}/details` (Admins, global)
  - `PATCH /api/event-manager/weddings/{id}/participants/{userId}/restore` (Event Managers, if owner)
  - `PATCH /api/admin/weddings/{weddingId}/participants/{userId}/restore` (Admins, global)
- **Active-Wedding Guards**:
  - Hardened checks inside `ParticipantService.java` to prevent invites, removals, or restorations on `CLOSED` or `CANCELLED` weddings.
- **Backend DTOs**:
  - `StaffParticipantDetailsResponse.java`: Exposes basic profile details, full profile questionnaire details, photo responses, role/status, block state, permissions (`canAdminBlock`/`canAdminUnblock`), and a list of manageable weddings.
  - `StaffParticipantWeddingResponse.java`: Represents a wedding the user participates in, with fields `weddingId`, `weddingName`, `weddingStatus`, `participantStatus`, `joinedAt`, `removedAt`, `canRemove`, and `canRestore`.

### 24.2 Mobile Staff Management Views
- **WeddingParticipantsScreen.tsx**:
  - Added an invite form at the top, visible only for users with role `ADMIN` and active weddings (`ACTIVE`).
  - Hooked up navigation to the participant details screen when clicking on a participant.
- **StaffParticipantDetailsScreen.tsx**:
  - Displays detailed participant information (Basic profile, Full profile, Photos list, and joined weddings list).
  - Admin-only block/unblock actions.
  - Remove/restore actions based on backend permissions (`canRemove`/`canRestore`).
- **MainStack.tsx & types/api.ts**:
  - Registered `StaffParticipantDetails` route in mobile navigation.
  - Added API client Fetch and Restore methods for Admin/Event Managers.

---

## 25. Development Cycle 4: Admin Wedding Management Improvements

### 25.1 Backend Service Guards
- **File**: [AdminService.java](file:///c:/Projects/shiduchim-mvp/backend/src/main/java/com/shiduchim/backend/service/AdminService.java)
- **Modifications**:
  - Added private helper `ensureWeddingActiveForOwnerAssignment(Wedding wedding)` to throw `HttpStatus.BAD_REQUEST` if the wedding status is not `ACTIVE`.
  - Added private helper `ensureDifferentOwner(Wedding wedding, Long newOwnerId)` to throw `HttpStatus.BAD_REQUEST` if `newOwnerId` equals `wedding.getOwnerUserId()`.
  - Integrated both helper methods at the entry point of `assignManagerToWedding(...)` and `assignSelfToWedding(...)` to guard against unauthorized state changes.

### 25.2 Mobile UI Enhancements
- **Admin Wedding List**:
  - **File**: [AdminWeddingsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/admin/AdminWeddingsScreen.tsx)
  - Updated screen layout to display the owner's `ownerName` and `ownerEmail` instead of a raw ID, falling back to ID if not loaded.
- **Admin Details Owner Assignment**:
  - **File**: [AdminWeddingDetailsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/admin/AdminWeddingDetailsScreen.tsx)
  - Added a visual `מנהל נוכחי` (Current Owner) badge inside the event manager selection list.
  - Disabled the selection card of the current owner to prevent duplicate selection.
  - Disabled the assignment and self-assignment buttons if the selected manager or the logged-in admin is already the owner.
- **Read-Only UX Warnings**:
  - **Files**: [AdminWeddingDetailsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/admin/AdminWeddingDetailsScreen.tsx) and [EventManagerWeddingDetailsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/eventManager/EventManagerWeddingDetailsScreen.tsx)
  - Embedded a high-visibility warning banner at the top of the detail screen indicating when a wedding is `CLOSED` or `CANCELLED` and explaining that modification actions are disabled.
  - **File**: [WeddingParticipantsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/weddings/WeddingParticipantsScreen.tsx)
  - Added a Hebrew read-only warning message at the top of the list for inactive weddings.

---

## 28. Cycle 5 Additions: Restore Wedding & Guarded Hard Delete

### 28.1 Restore Wedding (Admin Only)
- **Backend Service Logic**:
  - Endpoint: `PATCH /api/admin/weddings/{weddingId}/restore`
  - Restores a CLOSED or CANCELLED wedding back to ACTIVE status.
  - Active weddings cannot be restored; requests return HTTP 400 Bad Request.
  - All existing wedding relationships (participants, invites, matches, actions, chats, reports, feedback) are fully preserved.
- **Mobile Integration**:
  - The Admin wedding details screen shows a "Restore" button only for CLOSED or CANCELLED weddings.
  - Restoring triggers a confirmation dialog in Hebrew and makes the API call, refreshing the screen to active state.

### 28.2 Guarded Hard Delete Wedding (Admin Only)
- **Superseded by Cycle 7 Policy**: Note that the older guarded delete policy (which blocked deletion if any user interactions existed, and physically deleted the Wedding row) was superseded/updated by the Cycle 7 Wedding Hard Delete Tombstone policy.
- **Backend Service Logic (Current Policy)**:
  - Endpoint: `DELETE /api/admin/weddings/{weddingId}`
  - Only closed or cancelled weddings can be deleted; active deletion is rejected with HTTP 400 Bad Request.
  - **No Blocking on Interactions**: Deletion is allowed even if historical user-to-user interactions exist (UserActions, Matches, OpeningConversations).
  - **Internal Tombstone**: The Wedding row itself is preserved in the database with status `DELETED` to prevent orphan references. It is never physically deleted.
  - **Cascade Boundaries**: Physically deletes `WeddingInvite` and `WeddingParticipant` rows. Local background image files are deleted on a best-effort basis. Preserves users, photos, user actions, matches, chats, opening conversations, messages, reports, feedback, blocks, and global data.
- **Mobile Integration**:
  - The Admin wedding details screen shows a "Delete" button only for CLOSED or CANCELLED weddings.
  - Deleting warns the admin in Hebrew that the action is irreversible and users will not be deleted (the old warning about deletion failing if user interactions exist was removed).

---

## 29. Cycle 5 Manual QA Checklist (Manual QA Pending)

This section contains the focused Cycle 5 QA checklist. Note: Manual QA has not been performed yet (status: **Manual QA Checklist Prepared / Pending**).

### 29.1 Admin Restore Wedding Checks
- [ ] **Admin restores CLOSED wedding to ACTIVE**: Verify that an Admin can restore a closed wedding to active.
- [ ] **Admin restores CANCELLED wedding to ACTIVE**: Verify that an Admin can restore a cancelled wedding to active.
- [ ] **Restore to ACTIVE wedding is blocked**: Verify that attempting to restore an already active wedding returns HTTP 400.
- [ ] **Event Manager cannot restore**: Verify that Event Managers receive HTTP 403 when trying to restore.
- [ ] **USER cannot restore**: Verify that regular users receive HTTP 403 when trying to restore.

### 29.2 Admin Hard Delete Wedding Checks (Updated for Cycle 7 Tombstone)
- [ ] **Admin delete to ACTIVE wedding is blocked**: Verify that attempting to delete an active wedding returns HTTP 400.
- [ ] **Admin deletes CLOSED/CANCELLED wedding with or without interactions**: Verify that an Admin can delete an inactive wedding, and the operation does not fail even if user actions, matches, or opening conversations exist in that wedding context.
- [ ] **Wedding row is preserved as DELETED**: Verify that the Wedding row is NOT physically deleted, and its status is updated to `DELETED`.
- [ ] **Users are preserved**: Verify that after a wedding is deleted, the participants' User accounts remain in the database.
- [ ] **Global and historical data is preserved**: Verify that global user actions, matches, chats, reports, feedback, and blocks are untouched and matches/chats remain accessible.
- [ ] **Deleted wedding no longer appears**: Verify the deleted wedding disappears from normal Admin / Event Manager / USER active/normal lists.
- [ ] **Deleted wedding accessCode no longer works**: Verify that trying to join or validate the accessCode of the deleted wedding fails.
- [ ] **Restore is blocked for DELETED**: Verify that calling the restore endpoint on a `DELETED` wedding returns HTTP 400.

### 29.3 Staff & User UI Checks
- [ ] **Event Manager does not see Restore/Delete buttons**: Verify EM detail screens do not display restore/delete buttons.
- [ ] **USER does not see staff actions**: Verify regular users cannot see restore/delete buttons or options.
- [ ] **No crashes in Admin details screen**: Navigate to AdminWeddingDetailsScreen after restore/delete and verify no crashes.

---

## 30. Cycle 2 MVP+ Additions: Unified Onboarding Hub & Opening Profile Navigation

### 30.1 Reusable Profile Forms
- **BasicProfileForm & FullProfileForm**: Extracted input fields, validations, and states from `BasicProfileScreen.tsx` and `FullProfileScreen.tsx` into standalone reusable components located at `@mobile/src/components/profile/`.
- **Contract Integrity**: Retained identical update API payloads matching backend expectations.

### 30.2 Unified Profile Screen Hub
- **ProfileScreen.tsx**: Refactored to act as a unified dashboard.
- **Embedded Manager**: Displays `BasicProfileForm`, `FullProfileForm`, and `ProfilePhotosManager` contextually on a single screen layout.

### 30.3 Opening to CandidateProfile View-Only Navigation
- **Navigation parameters**:
  - `CandidateProfile`: Supports `userId`, optional `sourceContext` ('OPENING_LIST' | 'OPENING_DETAILS'), and optional `contextLabel`.
  - `OpeningConversationDetails`: Supports `conversationId` and optional `otherUserName`.
- **Subtle Context Banner**: `CandidateProfileScreen.tsx` displays a Hebrew banner (`contextLabel`) at the top of the details view if navigated from the opening messaging contexts.
- **Split Card Touch Zones**: In `OpeningMessagesScreen.tsx`, conversation cards are split into two distinct touch zones to avoid nested React Native touchable bugs:
  - **Header zone**: Navigates to the candidate's profile.
  - **Body zone**: Navigates to conversation details, passing `otherUserName` as a fallback.
- **Dynamic Header Profile Loader**: Inside `OpeningConversationDetailsScreen.tsx`, the component calls `getPublicProfile(details.otherUserId)` upon load to dynamically retrieve and display the sender's name and primary photo in the header. If the fetch fails, it falls back to `route.params.otherUserName` or a generic `"פרופיל המשתמש"`.
- **No Lifecycle Side-Effects**: Navigation remains purely view-only. It does not create matches, trigger likes/dislikes, or open chat screens.

---

## 31. Development Cycle 3 MVP+ Additions: Opening / Match / Chat Continuity and Stale Opening Handling

### 31.1 Backend Match Continuity & Message Migration
- **File**: [ActionService.java](file:///c:/Projects/shiduchim-mvp/backend/src/main/java/com/shiduchim/backend/service/ActionService.java)
- **Modifications**: Added a call to `openingMessageService.bridgeOpeningToMatch(user, targetUser, match)` within `recordLikeAction(...)` when a mutual Like results in an active Match.
- **File**: [OpeningMessageService.java](file:///c:/Projects/shiduchim-mvp/backend/src/main/java/com/shiduchim/backend/service/OpeningMessageService.java)
- **Modifications**: Added `bridgeOpeningToMatch(User opener, User recipient, Match match)` to find active `OpeningConversation` between the two users, migrate all its `OpeningMessage`s to `ChatMessage`s associated with the new `Match`, and mark the conversation as inactive.
- **File**: [OpeningConversationRepository.java](file:///c:/Projects/shiduchim-mvp/backend/src/main/java/com/shiduchim/backend/repository/OpeningConversationRepository.java)
- **Modifications**: Added query method `findByOpenerUserIdAndRecipientUserIdAndIsActiveTrue(...)` to locate active pre-match conversations.

### 31.2 Mobile UI Chat CTA for Matched Openings
- **File**: [OpeningConversationDetailsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/opening/OpeningConversationDetailsScreen.tsx)
- **Modifications**: Updated to check if the conversation status is `MATCHED` or if `matchId` is populated. When true, renders a Hebrew notice banner at the top of the screen (`שיחה זו כבר הפכה להתאמה!`) along with a "Chat" button (`מעבר לצ'אט`) navigating directly to the active `Chat` screen.

### 31.3 Mobile Discover / Lists Match CTA
- **File**: [ActionButtons.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/components/ActionButtons.tsx)
- **Modifications**: Updated the `onLike` handler to pass `matchId` back to the parent components if a mutual Like results in a Match.
- **Files**: [DiscoverScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/discover/DiscoverScreen.tsx) and [ListsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/lists/ListsScreen.tsx)
- **Modifications**: Hooked up the updated `onLike` callbacks to capture the `matchId`. Render a modal/toast feedback offering a clear Hebrew redirect CTA to go straight to `Chat`.

### 31.4 Graceful Stale Opening Attempt Handling
- **File**: [OpeningConversationDetailsScreen.tsx](file:///c:/Projects/shiduchim-mvp/mobile/src/screens/opening/OpeningConversationDetailsScreen.tsx)
- **Modifications**: When the send message request fails due to an already active Match (the backend returns conflict details), the screen handles the error gracefully. It displays a clear Hebrew alert informing the user that they are already matched (`כבר נוצרה התאמה ביניכם!`), and if a `matchId` is returned in the payload, displays a direct navigation link to the active `Chat`.

### 31.5 Exclusions & MVP Boundaries
- **No Schema/Contract/API Changes**: Database schemas, entities, DTOs, migrations, and API endpoint signatures remain unchanged.
- **QA Exclusions**: Runtime manual QA is deferred pending project QA cycles.

---

## 32. Development Cycle 4 MVP+ Additions: User Reports History & Recent Updates Aggregation

### 32.1 Backend User Reports API
- **Endpoint Implementation**: Created `GET /api/reports/my` in `UserReportController.java` to fetch reports submitted by the logged-in user.
- **Service Layer**: Added logic in `UserReportService.java` to map `UserReport` records into `MyUserReportResponse`, fetching the reported user's name via `UserRepository` when available.
- **DTOs**: Implemented `MyUserReportResponse.java` and added `updatedAt` field to `MyProductFeedbackResponse.java`.

### 32.2 Unified Mobile Requests UI
- **Unified Screen**: Updated `MyProductFeedbackScreen.tsx` to call both `reportsApi.getMyReports()` and `productFeedbackApi.getMyFeedback()`.
- **Sorting and Display**: Merged both lists, sorted them by date descending (using `updatedAt` or `createdAt` fallbacks), and rendered cards showing clear labels, dates, details, and current statuses in Hebrew.

### 32.3 Mobile Recent Updates Center ("ההתראות שלי")
- **Screen**: Created `NotificationsScreen.tsx` which fetches likes received, matches, inbox opening messages, product feedback status updates, and user report status updates in parallel.
- **Exclusion of Chat**: Confirmed that normal chat conversations are not fetched or displayed on this screen.
- **Shortcuts & Navigation**: Mapping is implemented with parameters corresponding to MainStack routing configuration:
  - Like updates target `CandidateProfile` (`userId`).
  - Match updates target `MatchDetails` (`matchId`).
  - Opening message updates target `OpeningConversationDetails` (`conversationId`, `otherUserName`).
  - Feedback/Report status updates target `MyProductFeedback`.
- **Role Restrictions**: Registered `Notifications` screen in `MainStack.tsx` and added navigation button to `MeScreen.tsx` gated strictly for the `USER` role.
- **Limits**: Limits updates shown to 10 per source pre-merge and 30 total post-merge.
- **MVP Boundaries**: No notification DB structures, push notifications, websockets, polling intervals, or local storage/AsyncStorage read/unread flags were created or utilized.
- **QA Exclusions**: Runtime manual QA is deferred pending project QA cycles. TypeScript compile success validates navigation parameter type safety.

---

## 33. Development Cycle 5 MVP+ Additions: Admin/Staff Unified User Details Foundation

### 33.1 Backend Direct User Details API
- **Endpoint**: `GET /api/admin/users/{userId}/details`
- **Security Check**: Enforced role restriction requiring role to be `ADMIN` and `adminBlocked` to be false/null in `ParticipantService.java`.
- **Logic**: Retrieves target `User` by `userId` and builds `StaffParticipantDetailsResponse` including their manageable weddings list, profile status, and basic/full profile details.

### 33.2 Mobile Navigation & Route Params
- **Route configuration**: Extended `StaffParticipantDetails` route parameters in `MainStack.tsx` to support optional `weddingId` and optional `source: 'ADMIN_USERS' | 'PARTICIPANTS'`.
- **Details Screen**: In `StaffParticipantDetailsScreen.tsx`, introduced validation error if Event Manager mode is used without a `weddingId`. For Admin mode, condition checks presence of `weddingId` to decide between `adminApi.getParticipantDetails(weddingId, userId)` or `adminApi.getUserDetails(userId)`.

### 33.3 Mobile AdminUsers Screen Entry Point
- **Navigating from Cards**: Wrapped user list card texts inside a `TouchableOpacity` targeting `StaffParticipantDetails` navigation with parameters `{ userId: item.id, mode: 'ADMIN', source: 'ADMIN_USERS' }`.
- **Safe Block/Unblock interaction**: The `AppButton` triggering blocking state is rendered outside the `TouchableOpacity` details click zone, keeping interactions separate and preventing accidental screen switches.
- **Exclusion of Cascade Screens**: Verified that other screens like `AdminReportDetailsScreen` or `ProductFeedback` screens are not modified or connected.

---

## 34. Development Cycle 6 MVP+ Additions: Admin Reports and ProductFeedback Profile Navigations

### 34.1 Mobile Navigation & Route Params
- **Route Configuration**: Extended `StaffParticipantDetails` route parameters in `MainStack.tsx` to support optional source references for Admin Reports and Admin Product Feedback contexts (`source?: 'ADMIN_USERS' | 'PARTICIPANTS' | 'ADMIN_REPORTS' | 'PRODUCT_FEEDBACK'`).
- **Navigation Parameters**: Navigations pass `{ userId, mode: 'ADMIN', source: 'ADMIN_REPORTS' | 'PRODUCT_FEEDBACK' }` (omitting `weddingId`) to request the profile in Admin direct mode.

### 34.2 Admin Reports Screen Integration
- **Direct Navigation**: In `AdminReportDetailsScreen.tsx`, added profile navigation for:
  - **Reporter**: Admins can tap the reporter's header/card to navigate to their details.
  - **Reported User**: Admins can tap the reported user's header/card to navigate to their details.
- **Visual Callouts**: Enhanced user interaction areas to indicate clickable navigation targets without interfering with resolution actions.

### 34.3 Admin ProductFeedback Screen Integration
- **Direct Navigation**: In `AdminProductFeedbackScreen.tsx` and `AdminProductFeedbackDetailsScreen.tsx`, enabled navigating to the feedback submitter's details.

### 34.4 Preserved Restrictions & Exclusions
- **Event Manager Access**: Event Managers cannot view these screens or access global profiles.
- **ProductFeedback & UserReport Separation**: Maintained separate structures and workflows for product feedback vs. user reports.
- **No Backend / Database changes**: Verified that no backend modifications, schema updates, or API endpoint updates were introduced.

---

## 35. Cycle 7: Wedding Hard Delete Policy (Tombstone)

### 35.1 Backend Wedding Status & Deletion Flow
- **WeddingStatus.DELETED**: Introduced `DELETED` as a terminal status in the `WeddingStatus` enum.
- **Admin Delete Endpoint (`DELETE /api/admin/weddings/{weddingId}`)**:
  - Requires the `ADMIN` role.
  - If the wedding status is `ACTIVE`, returns HTTP 400 Bad Request.
  - If the wedding status is `CLOSED` or `CANCELLED`, allows deletion regardless of whether historical interactions exist in the wedding pool.
  - **Internal Tombstone**: Instead of physically deleting the `Wedding` row, updates `status = WeddingStatus.DELETED` and keeps the row to maintain relational safety and avoid orphan records.
  - **Cascade Actions**: Physically deletes all related `WeddingParticipant` and `WeddingInvite` records. Removes the local background image file from `/uploads` (on a best-effort basis).
  - **Data Preservation**: Preserves `User`, `UserPhoto`, `UserAction`, `Match`, `ChatMessage`, `OpeningConversation`, `OpeningMessage`, `UserReport`, `ProductFeedback`, and `UserBlock` rows.

### 35.2 Security and Safety Gateways
- **Wedding List Filtration**: Hides `DELETED` weddings from normal Admin and Event Manager wedding lists.
- **Validation and Joining**:
  - `POST /api/weddings/join` blocks joining a `DELETED` wedding, returning HTTP 400 Bad Request.
  - `validate-code` endpoints reject `DELETED` weddings.
- **Discover Invalidation**: Discover matching services exclude candidates belonging to `DELETED` weddings.
- **Opening Replies Block**: Sending opening messages or replying in an opening conversation associated with a `DELETED`, missing, or non-active wedding is blocked.
- **Lists / Liked Me Invalidation**: User lists and Liked Me queries dynamically filter out items/profiles tied to `DELETED` or missing weddings.
- **Blocked Restoration**: Restoring a `DELETED` wedding via `PATCH /api/admin/weddings/{weddingId}/restore` is strictly blocked (returns HTTP 400 Bad Request). Restore is only valid for `CLOSED` and `CANCELLED` weddings.

### 35.3 Mobile Technical Integration
- **TypeScript support**: Added `DELETED` value to `WeddingStatus` type definitions.
- **Defensive Helpers**: Treats `DELETED` as inactive/invalid across all UI display helpers, QR code validation, and readiness states (e.g. `isWeddingPoolEligible` evaluates to false).
- **Admin UX Details**: Admin delete confirmation dialog wording was updated in Hebrew to explain that deletion is irreversible and users are preserved, removing the incorrect warning that deletion is blocked by interactions.
