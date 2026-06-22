# Examples

## Input: GitHub issue

**Title:** Export user list to CSV

**Body:**

```markdown
## Summary

Admins need to download the user list for reporting.

## User story

As an admin, I want to export users to CSV so that I can share reports with finance.

## Acceptance criteria

- [ ] Export button on the users page
- [ ] CSV includes name, email, role, created date
```

## Output: Engineering requirements (abbreviated)

```markdown
# Export user list to CSV

**Source:** #42 — Export user list to CSV
**Status:** Draft for review

## Problem statement

Admins manually copy user data for finance reporting. A CSV export reduces errors and saves time.

## Goal

An admin can download a CSV of all users visible to them from the users page in one action.

## User story

> As an admin, I want to export users to CSV so that I can share reports with finance.

## Scope

### In scope

- CSV export of users from the admin users page
- Columns: name, email, role, created date (ISO 8601)

### Out of scope

- Scheduled/automatic exports
- Filtering or column selection in v1

## Functional requirements

| ID | Requirement | Notes |
|----|-------------|-------|
| FR-1 | The users page **shall** expose an "Export CSV" action for users with admin role. | Hide or disable for non-admins |
| FR-2 | The export **shall** include all users the admin is permitted to view. | Respect existing row-level permissions |
| FR-3 | The CSV **shall** include columns: name, email, role, created date. | Header row required; UTF-8 encoding |
| FR-4 | The download **shall** use filename `users-YYYY-MM-DD.csv`. | Server local date |

## Non-functional requirements

| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-1 | Export of up to 10k users **shall** complete within 30 seconds. | Paginate query if needed |
| NFR-2 | Export action **shall** be audit-logged. | Who exported, when, row count |

## Acceptance criteria

- [ ] Given an admin on `/admin/users`, when they click Export CSV, then a CSV downloads with correct columns
- [ ] Given a non-admin, the export action is not available
- [ ] Given 10k users, export completes within 30 seconds

## Dependencies and assumptions

**Dependencies**

- Existing admin users list and permission model

**Assumptions**

- v1 exports all visible users; no filter UI

## Open questions

- 🔴 **Blocking:** Should deleted/suspended users be included?
- 🟡 **Important:** Max row limit before async email delivery?

## Suggested sub-tasks

1. Add export endpoint with permission check and CSV serializer
2. Add "Export CSV" button to admin users page with download handling
3. Add audit log entry for export events
4. Add tests for permissions, column set, and large dataset behaviour
```

For issue #42, the agent would write this document to `.ai/plan/issue-42-export-user-csv.md` and post a short chat summary pointing to that file.
