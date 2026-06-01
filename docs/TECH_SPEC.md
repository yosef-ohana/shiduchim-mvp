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
- CLOSED/CANCELLED wedding blocks new joins.

Do not add QR, backgrounds, broadcast or reports.

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

Constraints:
- `content` not blank.
- sender must be one side of the Match.
- Match must be ACTIVE.
- No readAt, read receipts, unread count, attachments, editing or deletion.

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
| `WeddingStatus` | `ACTIVE`, `CLOSED`, `CANCELLED` |
| `ParticipantStatus` | `ACTIVE`, `REMOVED` |

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

---

## 10. Chat Rules

- Chat opens only after ACTIVE Match.
- HTTP GET/POST only.
- Text messages only.
- No WebSocket.
- No realtime.
- No unread count.
- No readAt or read receipts.
- No attachments.
- No edit/delete in MVP.
- BLOCKED Match blocks sending and active chat display.

---

## 11. Mobile Screens

### USER

- Register/Login
- Basic Profile
- Full Profile
- My Photos
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
- My Profile

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
