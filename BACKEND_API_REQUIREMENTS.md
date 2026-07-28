# Backend API requirements

The app requires stable JSON-RPC detail endpoints so direct links and push
notifications do not depend on a previously loaded list page.

## Required detail routes

- `/resident/tickets/:id` returns one `MaintenanceRequest`.
- `/worker/tasks/:id` returns one `MaintenanceRequest`.
- `/resident/invoices/:id` returns one `Invoice`.

All routes use the existing JSON-RPC envelope and bearer authentication used by
the rest of the mobile API. Access must be scoped to the authenticated resident
or worker; an inaccessible record must not be disclosed.

Worker task responses should include `assignedToCurrentUser: boolean`.
Authorization and UI state must not depend on comparing a worker display name.
The frontend keeps a name-comparison fallback only for older responses.

Invoice detail responses may include:

```json
{
  "currencyCode": "EGP",
  "lineItems": [
    { "id": "line-1", "label": "Service fee", "amount": 1000 }
  ]
}
```

The frontend never calculates taxes or fees. If `lineItems` is absent or empty,
the breakdown section is not shown.

## Stable authentication errors

Return HTTP 401, or one of these JSON-RPC error codes, for expired or invalid
authentication:

- `invalid_access_token`
- `missing_access_token`
- `token_expired`
- `session_expired`
- `unauthorized`

Use HTTP 403 for an authenticated user who lacks permission. The mobile client
does not sign the user out for a normal 403 response.
