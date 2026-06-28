# API_CONTRACT.md — Shiduchim MVP

## 1. Purpose

Working API contract for Backend and Mobile.

Rules:
- All endpoints must match this file.
- Do not invent endpoints without approval.
- If API change is needed: stop, explain, approve, update docs first, then code.

Base:
```text
/api
```

Standard errors:

| Code | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Forbidden / not allowed / not eligible |
| 404 | Resource not found |
| 409 | Duplicate / business conflict |

---

## 2. DTOs

### Auth

`RegisterRequest`
- `email`
- `password`
- `fullName`
- `gender`

`LoginRequest`
- `email`
- `password`

`AuthResponse`
- `userId`
- `email`
- `fullName`
- `role`
- `profileStatus`
- `adminBlocked`
- `accessToken`

---

### User / Profile

`MeResponse`
- `id`
- `fullName`
- `email`
- `role`
- `gender`
- `profileStatus`
- `adminBlocked`
- `hasPrimaryPhoto`
- `photoCount`

`ProfileMeResponse`
- all `MeResponse` fields
- `age`
- `heightCm`
- `areaOfResidence`
- `religiousLevel`
- `phone`
- `education`
- `occupation`
- `selfDescription`
- `hobbies`
- `lookingFor`
- `familyDescription`
- `headCovering`
- `hasDrivingLicense`

`BasicProfileRequest`
- `fullName`
- `age`
- `heightCm`
- `areaOfResidence`
- `religiousLevel`
- `phone`

`BasicProfileResponse`
- `profileStatus`
- `missingFields`
- `hasPrimaryPhoto`

`FullProfileRequest`
- `education`
- `occupation`
- `selfDescription`
- `hobbies`
- `lookingFor`
- `familyDescription`
- `headCovering`
- `hasDrivingLicense`

`FullProfileResponse`
- `profileStatus`
- `globalPoolEnabled`
- `missingFields`

`PublicUserCardResponse`
- `userId`
- `primaryPhotoUrl`
- `fullName`
- `age`
- `heightCm`
- `areaOfResidence`
- `religiousLevel`
- `education`
- `lookingForShort`
- `poolType`
- `weddingId`

`PublicProfileResponse`
- `userId`
- `primaryPhotoUrl`
- `additionalPhotoUrl`
- `fullName`
- `age`
- `heightCm`
- `areaOfResidence`
- `religiousLevel`
- `education`
- `occupation`
- `selfDescription`
- `hobbies`
- `familyDescription`
- `lookingFor`
- `headCovering`
- `hasDrivingLicense`

Public profile/card never includes: `email`, `phone`, `passwordHash`, `adminBlocked`, action history.

---

### Photos

`PhotoResponse`
- `id`
- `imageUrl`
- `isPrimary`
- `orderIndex`
- `createdAt`

`PhotoUploadResponse`
- `photoId`
- `imageUrl`
- `isPrimary`
- `orderIndex`
- `photoCount`
- `hasPrimaryPhoto`

---

### Weddings / Participants

`WeddingCreateRequest`
- `name`
- `city`
- `weddingDate`
- `accessCode` optional

`WeddingResponse`
- `id`
- `name`
- `city`
- `weddingDate`
- `accessCode`
- `ownerUserId`
- `status`
- `participantsCount`
- `matchesCount`
- `backgroundImageUrl`

`JoinWeddingRequest`
- `accessCode`

`JoinWeddingResponse`
- `weddingId`
- `weddingName`
- `participantStatus`
- `joinedAt`

`AddParticipantRequest`
- `email`

`ParticipantResponse`
- `userId`
- `fullName`
- `email`
- `gender`
- `profileStatus`
- `hasPrimaryPhoto`
- `participantStatus`
- `joinedAt`
- `removedAt`

`CreateWeddingInviteRequest`
- `fullName`
- `email`

`WeddingInviteResponse`
- `id`
- `weddingId`
- `fullName`
- `email`
- `invitedByUserId`
- `acceptedUserId`
- `status`
- `createdAt`
- `acceptedAt`

`UserWeddingResponse`
- `weddingId`
- `weddingName`
- `city`
- `weddingDate`
- `weddingStatus`
- `participantStatus`
- `joinedAt` (optional)
- `isWeddingPoolEligible`
- `backgroundImageUrl`


---

### Discover / Actions

`DiscoverResponse`
- `items: List<PublicUserCardResponse>`

`ActionRequest`
- `poolType`
- `weddingId` optional

`ActionResponse`
- `targetUserId`
- `actionType`
- `poolType`
- `weddingId`
- `matchCreated`
- `matchBlocked`
- `matchId`

`RemoveActionResponse`
- `success`
- `message`
- `targetUserId`
- `poolType`
- `weddingId`
- `removedActionType`

`UnfreezeResponse`
- `targetUserId`
- `removed`
- `canAppearInDiscoverAgain`

---

### Lists / Matches / Chat

`ActionListItemResponse`
- `userId`
- `primaryPhotoUrl`
- `fullName`
- `age`
- `areaOfResidence`
- `religiousLevel`
- `education`
- `actionType`
- `updatedAt`

`LikedMeItemResponse`
- `userId`
- `primaryPhotoUrl`
- `fullName`
- `age`
- `heightCm`
- `areaOfResidence`
- `religiousLevel`
- `education`
- `lookingForShort`
- `poolType`
- `weddingId`
- `likedAt`
- `hasOpenOpeningConversation`
- `openingConversationId`
- `openingConversationDirection`
- `openingConversationStatus`


`MatchResponse`
- `matchId`
- `otherUserId`
- `otherUserFullName`
- `otherUserPrimaryPhotoUrl`
- `poolType`
- `weddingId`
- `status`
- `createdAt`

`MatchDetailsResponse`
- `matchId`
- `otherUserProfile`
- `poolType`
- `weddingId`
- `status`
- `createdAt`

`ChatMessageRequest`
- `content`

`ChatMessageResponse`
- `id`
- `matchId`
- `senderId`
- `content`
- `sentAt`

`ChatMessagesResponse`
- `matchId`
- `messages: List<ChatMessageResponse>`

`ConversationResponse`
- `matchId`
- `otherUserId`
- `otherUserFullName`
- `otherUserPrimaryPhotoUrl`
- `lastMessagePreview`
- `lastMessageAt`
- `poolType`
- `weddingId`
- `matchStatus`
- `unreadCount`

---

### Admin

`CreateEventManagerRequest`
- `email`
- `password`
- `fullName`

`AdminUserResponse`
- `id`
- `fullName`
- `email`
- `gender`
- `role`
- `profileStatus`
- `adminBlocked`
- `createdAt`

`AdminWeddingResponse`
- `id`
- `name`
- `city`
- `weddingDate`
- `status`
- `ownerUserId`
- `participantsCount`
- `matchesCount`
- `backgroundImageUrl`


`AdminDashboardResponse`
- `totalUsers`
- `totalEventManagers`
- `totalAdmins`
- `totalWeddings`
- `totalActiveMatches`
- `totalMessages`

---

### Product Feedback

`CreateProductFeedbackRequest`
- `type` (Enum: `FeedbackType` - `BUG`, `IMPROVEMENT`, `OTHER`)
- `text` (String)

`UpdateProductFeedbackStatusRequest`
- `status` (Enum: `FeedbackStatus` - `NEW`, `IN_REVIEW`, `RESOLVED`)

`ProductFeedbackSummaryResponse`
- `id` (Long)
- `senderUserId` (Long)
- `type` (Enum: `FeedbackType`)
- `status` (Enum: `FeedbackStatus`)
- `createdAt` (DateTime)

`ProductFeedbackDetailsResponse`
- `id` (Long)
- `senderUserId` (Long)
- `type` (Enum: `FeedbackType`)
- `status` (Enum: `FeedbackStatus`)
- `text` (String)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `resolvedAt` (DateTime, optional)

---


## 3. Endpoints

### Auth + Current User

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/auth/register` | Public | `RegisterRequest` | `AuthResponse` | Creates USER; email unique; gender required for USER; no OTP/email verification/device token | 400, 409 |
| POST | `/api/auth/login` | Public | `LoginRequest` | `AuthResponse` | Validates email/password; returns token | 400, 401 |
| POST | `/api/auth/staff-login` | Public | `LoginRequest` | `AuthResponse` | Validates credentials and returns token; role must be ADMIN or EVENT_MANAGER | 400, 401, 403 |
| GET | `/api/users/me` | USER / EVENT_MANAGER / ADMIN | — | `MeResponse` | Returns current authenticated user | 401 |

---

### Profile

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| GET | `/api/profile/me` | USER | — | `ProfileMeResponse` | Returns private profile | 401, 403 |
| PUT | `/api/profile/basic` | USER | `BasicProfileRequest` | `BasicProfileResponse` | Completes BASIC; fullName locked after confirmation; gender not changed here | 400, 401, 403 |
| PUT | `/api/profile/full` | USER | `FullProfileRequest` | `FullProfileResponse` | Completes FULL; opens global; missing required fields handled | 400, 401, 403 |
| GET | `/api/profiles/{userId}` | USER | — | `PublicProfileResponse` | Candidate must be eligible/opposite gender; no email/phone | 401, 403, 404 |

---

### Photos

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/photos` | USER | multipart image | `PhotoUploadResponse` | Max 2 photos; first becomes primary; local storage only | 400, 401, 403, 409 |
| GET | `/api/photos/me` | USER | — | `List<PhotoResponse>` | Returns my photos | 401, 403 |
| PUT | `/api/photos/{photoId}/primary` | USER | — | `PhotoResponse` | Photo must belong to user; makes it primary | 401, 403, 404 |
| DELETE | `/api/photos/{photoId}` | USER | — | `PhotoUploadResponse` | Physically delete file + DB row; if primary deleted, second becomes primary | 401, 403, 404 |
| GET | `/uploads/{filename}` | Public/Auth | — | image file | Static serving for uploaded images | 404 |

No Cloudinary. No soft delete. No `deleted` flag.

---

### Weddings

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/event-manager/weddings` | EVENT_MANAGER / ADMIN | `WeddingCreateRequest` | `WeddingResponse` | Create wedding; accessCode manual or auto-generated; unique | 400, 401, 403, 409 |
| PUT | `/api/event-manager/weddings/{id}` | EVENT_MANAGER / ADMIN | `WeddingCreateRequest` | `WeddingResponse` | Edit wedding details (name, city, weddingDate); owner or ADMIN only | 400, 401, 403, 404 |
| GET | `/api/event-manager/weddings` | EVENT_MANAGER / ADMIN | — | `List<WeddingResponse>` | Manager sees own weddings; admin sees admin list | 401, 403 |
| GET | `/api/event-manager/weddings/{id}` | EVENT_MANAGER / ADMIN | — | `WeddingResponse` | Owner or ADMIN only | 401, 403, 404 |
| PATCH | `/api/event-manager/weddings/{id}/close` | EVENT_MANAGER / ADMIN | — | `WeddingResponse` | Owner/Admin; status CLOSED | 401, 403, 404 |
| PATCH | `/api/event-manager/weddings/{id}/cancel` | EVENT_MANAGER / ADMIN | — | `WeddingResponse` | Owner/Admin; status CANCELLED | 401, 403, 404 |
| POST | `/api/weddings/join` | USER | `JoinWeddingRequest` | `JoinWeddingResponse` | Join ACTIVE wedding by accessCode; no QR | 400, 401, 403, 404, 409 |
| POST | `/api/weddings/validate-code` | Public | `ValidateWeddingCodeRequest` | `ValidateWeddingCodeResponse` | Validate wedding access code before auth | 400, 404 |
| GET | `/api/weddings/my` | USER | — | `List<UserWeddingResponse>` | Returns list of weddings joined by the current user with simple user-safe data | 401, 403 |
| POST | `/api/event-manager/weddings/{id}/background` | EVENT_MANAGER / ADMIN | multipart image | `WeddingResponse` | Event Manager uploads/replaces wedding background | 400, 401, 403, 404 |
| DELETE | `/api/event-manager/weddings/{id}/background` | EVENT_MANAGER / ADMIN | — | `WeddingResponse` | Event Manager deletes wedding background | 401, 403, 404 |


---

### Participants

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| GET | `/api/event-manager/weddings/{id}/participants` | EVENT_MANAGER / ADMIN | — | `List<ParticipantResponse>` | Owner or ADMIN only | 401, 403, 404 |
| POST | `/api/event-manager/weddings/{id}/participants` | EVENT_MANAGER / ADMIN | `AddParticipantRequest` | `ParticipantResponse` | Add existing user by email; active wedding required; owner or ADMIN only | 400, 401, 403, 404, 409 |
| DELETE | `/api/event-manager/weddings/{id}/participants/{userId}` | EVENT_MANAGER / ADMIN | — | `ParticipantResponse` | Sets status REMOVED; active wedding required; owner or ADMIN only | 401, 403, 404 |
| GET | `/api/event-manager/weddings/{id}/participants/{userId}/details` | EVENT_MANAGER / ADMIN | — | `StaffParticipantDetailsResponse` | View full details of a participant user (profile details, photos, manageable weddings list, permissions); owner or ADMIN only | 401, 403, 404 |
| PATCH | `/api/event-manager/weddings/{id}/participants/{userId}/restore` | EVENT_MANAGER / ADMIN | — | `ParticipantResponse` | Sets participant status to ACTIVE; active wedding required; owner or ADMIN only | 400, 401, 403, 404, 409 |

---

### Wedding Invites

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/event-manager/weddings/{id}/invites` | EVENT_MANAGER / ADMIN | `CreateWeddingInviteRequest` | `WeddingInviteResponse` | Creates a lightweight invitation; owner or ADMIN only | 400, 401, 403, 404, 409 |
| GET | `/api/event-manager/weddings/{id}/invites` | EVENT_MANAGER / ADMIN | — | `List<WeddingInviteResponse>` | Lists invitations; owner or ADMIN only | 401, 403, 404 |
| PATCH | `/api/event-manager/weddings/{id}/invites/{inviteId}/cancel` | EVENT_MANAGER / ADMIN | — | `WeddingInviteResponse` | Cancels the invitation; owner or ADMIN only | 401, 403, 404 |
| PATCH | `/api/event-manager/weddings/{id}/invites/{inviteId}/restore` | EVENT_MANAGER / ADMIN | — | `WeddingInviteResponse` | Restores a cancelled invitation back to PENDING; owner or ADMIN only | 400, 401, 403, 404, 409 |

---

### Discover

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| GET | `/api/discover?pool=WEDDING&weddingId={id}&limit={limit}` | USER | query | `DiscoverResponse` | Viewer/candidate eligible; BASIC or FULL; active participant; opposite gender; no active action | 401, 403, 404 |
| GET | `/api/discover?pool=GLOBAL&limit={limit}` | USER | query | `DiscoverResponse` | Viewer/candidate FULL; primary photo; opposite gender; no active action; no global approval | 401, 403 |

Server owns all filtering. Mobile does not calculate eligibility.

---

### Actions

All actions require USER and valid `ActionRequest`.

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/actions/{targetUserId}/like` | USER | `ActionRequest` | `ActionResponse` | Upsert LIKE; creates/reactivates Match on mutual Like | 400, 401, 403, 404 |
| POST | `/api/actions/{targetUserId}/dislike` | USER | `ActionRequest` | `ActionResponse` | Upsert DISLIKE; replaces previous action; blocks active Match | 400, 401, 403, 404 |
| POST | `/api/actions/{targetUserId}/freeze` | USER | `ActionRequest` | `ActionResponse` | Upsert FREEZE; replaces previous action; blocks active Match | 400, 401, 403, 404 |
| DELETE | `/api/actions/{targetUserId}/freeze` | USER | `ActionRequest` | `UnfreezeResponse` | Removes Freeze; may return `removed=false` if no Freeze | 400, 401, 403, 404 |
| DELETE | `/api/actions/{targetUserId}` | USER | `ActionRequest` | `RemoveActionResponse` | Removes existing action (Like/Dislike/Freeze). Target may return to Discover if eligible. Blocked if ACTIVE Match exists. Match/Chat not deleted. | 400, 401, 403, 404 |

Rules:
- Last action wins.
- Target must be eligible.
- Same-gender target rejected.
- Self target rejected.
- Actor/target blocked rejected.
- Do not reveal Dislike/Freeze to target.

---

### Lists

| Method | Path | Role | Response | Rules | Errors |
|---|---|---|---|---|---|
| GET | `/api/lists/likes` | USER | `List<ActionListItemResponse>` | Users I liked | 401, 403 |
| GET | `/api/lists/dislikes` | USER | `List<ActionListItemResponse>` | Users I disliked | 401, 403 |
| GET | `/api/lists/freezes` | USER | `List<ActionListItemResponse>` | Users I froze | 401, 403 |
| GET | `/api/lists/liked-me` | USER | `List<LikedMeItemResponse>` | Users who liked me, one-sided only; hide ACTIVE Matches | 401, 403 |

Never expose who Disliked/Froze current user.

---

### Matches

| Method | Path | Role | Response | Rules | Errors |
|---|---|---|---|---|---|
| GET | `/api/matches` | USER | `List<MatchResponse>` | ACTIVE Matches only | 401, 403 |
| GET | `/api/matches/{matchId}` | USER | `MatchDetailsResponse` | Current user must be one side | 401, 403, 404 |

---

### Chat

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| GET | `/api/chats/conversations` | USER | — | `List<ConversationResponse>` | Returns current user's active conversations sorted newest-first (includes unread counts) | 401, 403 |
| GET | `/api/matches/{matchId}/messages` | USER | — | `ChatMessagesResponse` | Match must be ACTIVE; user must be side | 401, 403, 404 |
| POST | `/api/matches/{matchId}/messages` | USER | `ChatMessageRequest` | `ChatMessageResponse` | Text only; content not blank; ACTIVE Match only | 400, 401, 403, 404 |
| GET | `/api/chats/unread-count` | USER | — | `{ "totalUnreadCount": Integer }` | Returns total number of unread messages across all active conversations | 401, 403 |
| PATCH | `/api/matches/{matchId}/messages/read` | USER | — | `{ "success": Boolean }` | Marks all messages sent by peer in this match as read | 401, 403, 404 |

No WebSocket. No realtime. No attachments. (Note: internal unread count per conversation & total unread count are allowed in Phase 17 as internal badges only, no read receipts exposed to the other user)

---

### Admin

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/admin/event-managers` | ADMIN | `CreateEventManagerRequest` | `AdminUserResponse` | Admin creates only EVENT_MANAGER; not regular USER | 400, 401, 403, 409 |
| GET | `/api/admin/users` | ADMIN | — | `List<AdminUserResponse>` | Basic users list; no reports/logs | 401, 403 |
| PATCH | `/api/admin/users/{userId}/block` | ADMIN | — | `AdminUserResponse` | Sets `adminBlocked=true` | 401, 403, 404 |
| PATCH | `/api/admin/users/{userId}/unblock` | ADMIN | — | `AdminUserResponse` | Sets `adminBlocked=false` | 401, 403, 404 |
| GET | `/api/admin/weddings` | ADMIN | — | `List<AdminWeddingResponse>` | Basic wedding list | 401, 403 |
| PATCH | `/api/admin/weddings/{weddingId}/assign-self` | ADMIN | — | `WeddingResponse` | Admin assigns self to manage wedding; active wedding & new owner required | 400, 401, 403, 404 |
| PUT | `/api/admin/weddings/{weddingId}/owner` | ADMIN | `{ "ownerUserId": Long }` | `WeddingResponse` | Admin assigns Event Manager to wedding; active wedding & new owner required | 400, 401, 403, 404 |
| GET | `/api/admin/dashboard` | ADMIN | — | `AdminDashboardResponse` | Returns basic admin dashboard counters | 401, 403 |
| GET | `/api/admin/reports` | ADMIN | — | `List<UserReportSummaryResponse>` | List all user reports | 401, 403 |
| GET | `/api/admin/reports/{reportId}` | ADMIN | — | `UserReportDetailsResponse` | Get details of a specific report | 401, 403, 404 |
| PATCH | `/api/admin/reports/{reportId}/resolve` | ADMIN | — | Void | Resolve a report | 401, 403, 404 |
| POST | `/api/admin/weddings/{weddingId}/background` | ADMIN | multipart image | `AdminWeddingResponse` | Admin uploads/replaces wedding background | 400, 401, 403, 404 |
| DELETE | `/api/admin/weddings/{weddingId}/background` | ADMIN | — | `AdminWeddingResponse` | Admin deletes wedding background | 401, 403, 404 |
| GET | `/api/admin/weddings/{weddingId}/participants` | ADMIN | — | `List<ParticipantResponse>` | Admin lists all participants of a wedding | 401, 403, 404 |
| POST | `/api/admin/weddings/{weddingId}/participants` | ADMIN | `AddParticipantRequest` | `ParticipantResponse` | Admin adds existing user by email; active wedding required | 400, 401, 403, 404, 409 |
| DELETE | `/api/admin/weddings/{weddingId}/participants/{userId}` | ADMIN | — | `ParticipantResponse` | Admin sets participant status to REMOVED; active wedding required | 400, 401, 403, 404 |
| GET | `/api/admin/weddings/{weddingId}/participants/{userId}/details` | ADMIN | — | `StaffParticipantDetailsResponse` | Admin views participant details | 401, 403, 404 |
| PATCH | `/api/admin/weddings/{weddingId}/participants/{userId}/restore` | ADMIN | — | `ParticipantResponse` | Admin sets participant status to ACTIVE; active wedding required | 400, 401, 403, 404, 409 |
| PATCH | `/api/admin/weddings/{weddingId}/restore` | ADMIN | — | `WeddingResponse` | Restores a CLOSED/CANCELLED wedding to ACTIVE; active restore is rejected. All other wedding data is preserved. | 400, 401, 403, 404 |
| DELETE | `/api/admin/weddings/{weddingId}` | ADMIN | — | Void | Guarded hard delete of CLOSED/CANCELLED wedding; active delete is rejected. Blocked if wedding-scoped UserActions, Matches, or OpeningConversations exist. If allowed, deletes invites, participants, background file, and wedding row; users and their photos/actions/chats/reports/feedback/global data are preserved. | 400, 401, 403, 404 |

---

### User Blocks

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/blocks/{targetUserId}` | USER | — | `BlockUserResponse` | Block target user (non-destructive block) | 401, 403, 404 |
| PATCH | `/api/blocks/{targetUserId}/unblock` | USER | — | `BlockUserResponse` | Unblock target user | 401, 403, 404 |
| GET | `/api/blocks` | USER | — | `List<BlockedUserResponse>` | Get list of blocked users | 401, 403 |

---

### User Reports

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/reports/users/{reportedUserId}` | USER | `CreateUserReportRequest` | Void | Report a user with reason and explanation | 400, 401, 403, 404 |

---

### Opening Messages

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/opening-messages/{targetUserId}` | USER | `CreateOpeningMessageRequest` | Void | Send initial opening message to a user before matching | 400, 401, 403, 404 |
| POST | `/api/opening-messages/{conversationId}/messages` | USER | `CreateOpeningReplyRequest` | `OpeningReplyResponse` | Reply to opening message or accept to convert to a Match | 400, 401, 403, 404 |
| GET | `/api/opening-messages/inbox` | USER | — | `List<OpeningConversationSummaryResponse>` | View received opening conversations | 401, 403 |
| GET | `/api/opening-messages/sent` | USER | — | `List<OpeningConversationSummaryResponse>` | View sent opening conversations | 401, 403 |
| GET | `/api/opening-messages/{conversationId}` | USER | — | `OpeningConversationDetailsResponse` | View details and message history | 401, 403, 404 |

---

### Product Feedback

| Method | Path | Role | Request | Response | Rules | Errors |
|---|---|---|---|---|---|---|
| POST | `/api/feedback` | USER | `CreateProductFeedbackRequest` | Void | Users submit product feedback | 400, 401, 403 |
| GET | `/api/admin/feedback` | ADMIN | — | `List<ProductFeedbackSummaryResponse>` | Admin lists all product feedback | 401, 403 |
| GET | `/api/admin/feedback/{feedbackId}` | ADMIN | — | `ProductFeedbackDetailsResponse` | Admin views feedback details | 401, 403, 404 |
| PATCH | `/api/admin/feedback/{feedbackId}/status` | ADMIN | `UpdateProductFeedbackStatusRequest` | `ProductFeedbackDetailsResponse` | Admin updates feedback status | 400, 401, 403, 404 |
