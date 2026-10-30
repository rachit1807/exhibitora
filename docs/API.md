# Exhibitora API

All endpoints use the same origin under `/api`. Responses are JSON. Errors use `{ "error": "Human-readable explanation" }`.

Authentication uses an HTTP-only `session` cookie. Sign-in also returns a `csrf` value and sets a readable CSRF cookie. Send the returned value as `X-CSRF-Token` on every authenticated mutation. Production cookies are Secure and SameSite=Lax. Sessions expire after eight hours.

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Verify database availability |
| GET | `/session` | Public | Current safe user fields and CSRF value |
| POST | `/auth/register` | Public | Name, email, password; always creates visitor |
| POST | `/auth/login` | Public | Authenticate with email/password |
| POST | `/auth/logout` | Signed in | Clear session cookies |
| GET | `/artifacts` | Public | Published collection |
| GET | `/artifacts?view=studio` | Staff | Curator’s own records; editors/admins see collection |
| POST | `/artifacts` | Curator / admin | Create draft |
| PATCH | `/artifacts/:id` | Staff | Edit or transition with revision check |
| GET | `/favorites` | Signed in | Saved artifact IDs |
| PUT | `/favorites/:id` | Signed in | Toggle saved published artifact |
| GET | `/users` | Admin | Safe account fields |
| PATCH | `/users/:id/role` | Admin | Assign visitor, curator, editor, admin |
| GET | `/audit` | Admin | Latest 500 activity records |

## Draft fields

`title`, `subtitle`, `description`, `category`, `realm`, `material`, `era`, and `model`.

Categories: `Weapons`, `Cosmic relics`, `Royal regalia`.
Models: `hammer`, `axe`, `cube`, `spear`, `prism`, `crown`.

## Review operations

Send `{ "action": "submit", "revision": 1 }` to submit a draft. Actions are `edit`, `submit`, `return`, `publish`, and `archive`. `return` requires a non-empty `feedback`. `edit` requires `fields` containing the draft fields above. Each successful operation increments the revision.

- `401`: authentication required
- `403`: insufficient role, wrong owner, invalid transition, or failed CSRF/origin check
- `404`: missing artifact or user
- `409`: stale revision or duplicate email
- `429`: authentication rate limit reached

Only drafts and returned exhibits can be edited. Public API responses exclude drafts, returned records, records in review, and archived exhibits.
