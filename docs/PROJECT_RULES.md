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
- cascading hard delete (wedding deletion must be safe and follow the internal tombstone policy; no cascading deletion of users, photos, user actions, matches, chats, reports, feedback, or blocks; allowed only for CLOSED or CANCELLED weddings, marked as DELETED and never physically deleted; historical interactions are preserved, and deleting does not block even if they exist)
- unauthorized wedding restore (restore wedding is reserved strictly for admins and applies only to CLOSED/CANCELLED weddings; restore is completely blocked for DELETED weddings)


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

---

## 13. Persistent Invariants & Stop Conditions (Batch 9A Updates)

To preserve the architectural boundaries and business rules, enforce the following limits:
- **No Historical Backfill**: Notifications are not generated retroactively. The timeline begins only with events created after deployment.
- **No Normal Chat Notifications**: Do not trigger notifications for standard chat messages.
- **No Push or WebSocket**: All features (including chats and notifications) must use HTTP request-response flow only.
- **No Chat before Match**: Standard chat conversations remain locked and are only created after a formal mutual Match.
- **No Changes to Eligibility**: Onboarding, QR codes, and notifications do not bypass profile completeness or primary photo eligibility requirements.
- **No Hard Delete (Tombstone Policy)**: Wedding deletion does not physically delete the `Wedding` row; it marks status as `DELETED` (terminal status).
- **No Ownerless Wedding**: Wedding owner must always be an active `EVENT_MANAGER` or `ADMIN`. The owner never becomes null.
- **No Partial Reassignment**: Event Manager wedding reassignment is transactional and all-or-nothing.
- **No Event Manager Admin Access**: Event Managers do not gain access to global Admin Reports, Admin Product Feedback, or direct wedding-independent profiles.
- **No Automatic Wedding Transfer**: Blocking or deactivating an Event Manager does not automatically transfer their owned weddings.
- **Product Feedback & User Report Separation**: Product Feedback and User Reports remain strictly separate entities, services, and workflows.
- **Wedding Tombstone Behavior Remains**: Deleted weddings remain invisible in normal lists, but their matches and chats remain accessible in history.
- **Like Notification Parity**: A Like notification may exist only while its referenced Like action remains current. Both matching read and unread Like notifications are removed when the Like ends (e.g. replaced by Dislike, Freeze, or removed).
- **Explicit Match Cancellation**: Match cancellation is explicit (using the dedicated endpoint) and never represented as a Dislike. A cancelled Match status becomes BLOCKED and cannot reactivate or rematch in the same lifecycle.
- **Authoritative allowedActions**: Candidate Profile capabilities come only from Backend `allowedActions`.
- **Source Context is Not Authorization**: Source route/query context parameters are verified but do not grant permission by themselves. Stale or target-mismatched sources yield no action capability.
- **No Wedding-to-Global Fallback**: If a validated wedding context becomes stale, it does not fallback to the Global context.
- **No Mobile Source-less Retry**: Mobile must not retry fetching profiles without source parameters after a validated source fetch fails.
- **Private Actions Privacy**: Incoming Dislikes and Freezes remain private and are not exposed.
- **Chat Requires Active Match**: Active chat messages require an ACTIVE Match status between users.
- **ACTIVE Match blocks new candidate actions**: Direct candidate actions (LIKE, DISLIKE, and FREEZE) remain rejected before UserAction persistence while an ACTIVE or BLOCKED Match exists.
- **Explicit Match cancellation is separate from Dislike**: Match cancellation is a unique state change and does not create a Dislike UserAction.
- **Mobile renders Candidate Profile actions from server-provided allowedActions**: Mobile displays action buttons strictly based on the server-provided `allowedActions` array.
- **Candidate Profile refreshes relationship state on focus**: Candidate Profile fetches the profile and relationship snapshot utilizing `useFocusEffect` exactly once per focus activation.

---

## 14. QA and Current Release Status

- **Cycle 10 Manual QA**: PASSED
- **Cycle 11 Implementation**: CODE COMPLETE
- **Cycle 11 Manual QA**: PENDING (scheduled after the final Git push)
- **Cycle 11 Git Closure Status**: COMPLETED
- **Cycle 11 Corrective Batch**:
  - implementation: CODE COMPLETE
  - technical review/docs/cleanup: COMPLETED
  - final Git closure: COMPLETED
  - manual QA: PENDING — after final Git push
