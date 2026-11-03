# Firebase Security Specification & TDD Spec

## Data Invariants
1. **User Identity Invariant**: A user can only write their own user profile document (`/users/{userId}` where `userId == request.auth.uid`).
2. **Message Authorship Invariant**: A user cannot forge `senderId` in `/channels/{channelId}/messages/{messageId}`; `senderId` must match `request.auth.uid`.
3. **Channel Integrity**: Channel names and descriptions must be constrained to safe length limits; public channels can be read by authenticated users, and members can participate.
4. **Message Size Invariant**: Message texts are bounded to maximum 2000 characters to prevent denial of wallet and resource flooding.
5. **Timestamp & Mutability**: Messages cannot have their `createdAt` manipulated, and `senderId` cannot be updated post-creation.

## The Dirty Dozen Payloads
1. User A tries to overwrite User B's `/users/userB` profile document. (Blocked by `userId == request.auth.uid`)
2. Unauthenticated user tries to read public messages in `/channels/general/messages`. (Blocked by `request.auth != null`)
3. User crafts a message with `senderId: "admin_uid"` while signed in as normal user. (Blocked by `incoming().senderId == request.auth.uid`)
4. Attacker attempts to post a 500KB text payload into `Message.text`. (Blocked by `.size() <= 2000`)
5. Attacker attempts to inject malicious script in channel id. (Blocked by `isValidId()`)
6. User attempts to delete other user's message. (Blocked: only sender or admin can delete)
7. Attacker attempts to inject phantom fields (`isAdmin: true`, `role: 'superadmin'`) on their user profile. (Blocked by schema strictness)
8. User attempts to update another user's reactions arbitrarily. (Reactions limited to allowed keys and valid sender)
9. Attacker attempts to query unbounded collection scans without channel scope. (Protected by nested collection structure)
10. Attacker attempts to create channel with 5MB name string. (Blocked by `name.size() <= 80`)
11. Unauthenticated write to `/test/connection`. (Only read allowed for health check)
12. User tries to spoof `createdAt` using forged client timestamp. (Validated)
