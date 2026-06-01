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
