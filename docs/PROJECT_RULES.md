# PROJECT_RULES.md — Shiduchim MVP

## 1. Source of Truth

Current working source of truth:

1. `docs/TECH_SPEC.md`
2. `docs/API_CONTRACT.md`
3. `docs/PROJECT_RULES.md`
4. `docs/BATCH_PLAN.md`
5. `docs/DECISIONS.md`

Stage 4 is the technical master reference only when there is a real contradiction or missing critical detail.

Old code and old documents are not source of truth.

---

## 2. Legacy Code Ban

Do not:
- copy old project code
- copy old Services
- copy old Controllers
- copy old Entities without strict adaptation to current docs
- revive old System Layer
- use old project as foundation
- ask to scan old code for implementation unless explicitly approved for a limited audit

Allowed:
- use only clean ideas already approved in Stage 3 and already reflected in current docs.

---

## 3. Fixed MVP Scope

Do not add:
- AI
- match scoring
- matchmakers
- real QR
- real OTP
- Push
- device tokens
- WebSocket
- realtime chat
- notifications
- read receipts / seen / blue checks / readAt per message (Note: internal unread count per conversation & total unread count are allowed, no read receipts exposed to the other user)
- attachments
- heavy reports
- heavy logs
- health monitoring
- background jobs
- full SystemRules
- full UserStateEvaluator
- broadcast
- Cloudinary unless later approved
- advanced filters
- profile view counter
- inquiry phone
- complex permission system
- heavy dashboards
- extra libraries without approval
- cascading hard delete (wedding deletion must be strictly guarded; no cascading deletion of users, photos, user actions, matches, chats, reports, or feedback; allowed only for closed/cancelled weddings without user interactions)
- unauthorized wedding restore (restore wedding is reserved strictly for admins and applies only to closed/cancelled weddings)


---

## 4. Locked Stack

Use:
- Java 21 + Spring Boot 3.5.x
- React Native + Expo + TypeScript
- MySQL via Docker Compose
- H2 only as temporary fallback
- one repo: `backend/`, `mobile/`, `docs/`

Do not switch stack.

---

## 5. API Contract Driven

Every backend endpoint and every mobile API call must match `docs/API_CONTRACT.md`.

Do not invent endpoints.

If an API change is needed:
1. stop
2. explain why
3. wait for approval
4. update docs first
5. then code

---

## 6. Small Batches Only

Each batch must have:
- one goal
- exact scope
- expected files/areas
- what not to do
- Definition of Done
- tests/build/run

Do not:
- build the whole project
- mix unrelated batches
- implement future features
- refactor unrelated code
- expand scope without approval

---

## 7. No Over-Engineering

Prefer simple MVP implementation.

Do not add:
- unnecessary abstraction layers
- permission engine
- rule engine
- event system
- background job system
- complex state machine
- heavy caching
- complex admin dashboards

Simple, stable and testable is the goal.

---

## 8. Backend Rules

- Controllers expose endpoints and delegate to services.
- Services enforce business rules.
- Repositories use Spring Data JPA.
- Entities map DB only.
- DTOs protect private fields.
- Config stays minimal: security, CORS, DB, uploads.

No System Layer.

---

## 9. Mobile Rules

- Expo React Native TypeScript only.
- API-driven screens.
- Mobile-first UI.
- Simple navigation.
- Simple state.
- No Push.
- No WebSocket.
- No heavy state management unless approved.

---

## 10. Build / Run Required

Every batch must end with relevant verification:

If backend changed:
- run backend build
- run backend app if possible
- verify schema if relevant

If mobile changed:
- run mobile start/build check
- verify TypeScript/errors if possible

If Docker changed:
- run Docker Compose or explain what was verified

---

## 11. Required Antigravity Final Report

At the end of every task, Antigravity must return:

1. files changed
2. what was implemented
3. what tests/build/run were performed
4. what failed or was not completed
5. whether any scope risk exists

---

## 12. Stop Conditions

Stop and ask before continuing if:
- requirement is unclear
- API Contract must change
- DB design must change significantly
- build fails and fix is outside current scope
- old code was introduced
- stack changed
- batch became too large
- rejected feature was opened
- USER / EVENT_MANAGER / ADMIN roles are confused
- new library is needed

Do not guess. Do not continue silently.
