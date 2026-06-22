# Requirements template

Use this structure for the **plan file** (`.ai/plan/issue-{NUMBER}-{slug}.md`). Replace bracketed placeholders.

```markdown
# [Feature name]

**Source:** #[ISSUE_NUMBER] — [Issue title]  
**Status:** Draft for review  
**Parent epic:** #[EPIC_NUMBER] — [Epic title] _(omit if none)_  
**Labels:** [label list] _(omit if none)_  
**Assignees:** [assignee list] _(omit if none)_

## Context

[Repo-specific context an implementer needs: monorepo layout, target directories, conversation refinements that override generic issue wording. Omit if none.]

## Problem statement

[1–3 sentences: what problem exists, for whom, and why it matters now.]

## Goal

[What success looks like from the user's perspective. One short paragraph.]

## User story

> As a [actor], I want [capability], so that [benefit].

## Scope

### In scope

- [Concrete capability or behaviour]
- [...]

### Out of scope

- [Explicitly excluded item]
- [...]

## Functional requirements

| ID | Requirement | Notes |
|----|-------------|-------|
| FR-1 | The system **shall** [testable behaviour]. | [Edge cases, data rules] |
| FR-2 | ... | ... |

## Non-functional requirements

| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-1 | [Performance, security, accessibility, logging, etc.] | [Target or constraint] |

## Acceptance criteria

- [ ] [Given/When/Then or clear pass/fail condition]
- [ ] [...]

## Dependencies and assumptions

**Dependencies**

- [Other issues, services, teams, or data]

**Assumptions**

- [Documented assumptions used while the story was underspecified]

## Technical notes

[Optional: suggested approach, affected paths, API/data model hints, migration concerns. Keep high-level — this is not a design doc unless the story demands it.]

## Risks

- [Implementation or product risk and mitigation, if any]

## Open questions

### 🔴 Blocking

1. **[Question]**  
   _Assumption if unanswered:_ [assumption]

### 🟡 Important

1. **[Question]**  
   _Assumption if unanswered:_ [assumption]

### 🟢 Nice to clarify

1. **[Question]**  
   _Assumption if unanswered:_ [assumption]

## Suggested sub-tasks

1. **[Sub-task title]** — [done condition]. _[Dependencies, e.g. after #1]_
2. [...]
```
