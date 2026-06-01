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
- unread count
- readAt / read receipts
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
- no unread
- no readAt/read receipts
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
