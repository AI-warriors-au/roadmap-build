---
name: story-to-requirements
description: Converts GitHub issue user stories into structured engineering requirements with acceptance criteria, open questions, and sub-task breakdowns. Does not post GitHub issue comments unless the user explicitly asks (see github-work). Use when the user asks to turn a story into requirements, refine an issue, write a spec from an issue, mentions story-to-requirements, or when promoting an approved plan.
---

# Story to Requirements

Act as a **senior developer** translating a GitHub issue (user story) into clear, actionable engineering requirements.

**Deliverables:**

1. A **plan file** at `.ai/plan/issue-{NUMBER}-{slug}.md` (local handoff for implementers; `.ai/` is gitignored)
2. A **short summary in chat** with the file path, open-question counts, and sub-task list
3. **Optional (Step 8)** — GitHub issue comment **only if the user explicitly asks**; follow **github-work** comment policy (never on external repos unless confirmed)

For fetching issues and posting comments, use **github-work** (MCP first, then `gh`).

## Workflow

Copy this checklist and track progress:

```markdown
Story-to-requirements progress:
- [ ] Step 1: Fetch issue and context
- [ ] Step 2: Analyse the story
- [ ] Step 3: Draft requirements
- [ ] Step 4: Identify open questions
- [ ] Step 5: Suggest sub-tasks
- [ ] Step 6: Write plan file
- [ ] Step 7: Present summary in chat
- [ ] Step 8: Post issue comment _(only if user explicitly asks — see github-work)_
```

### Step 1: Fetch issue and context

Gather everything needed to understand the story:

1. Issue title, body, labels, assignees, milestone, project status
2. All comments (decisions and constraints often live in comments)
3. Parent epic or linked issues (`## Parent Epic`, sub-issues, "Related to #N")
4. Existing acceptance criteria in the issue body
5. Relevant codebase context when the repo is available locally
6. **Conversation refinements** — e.g. monorepo layout, local vs separate repo, scope changes stated by the user in chat

```bash
gh issue view ISSUE_NUMBER -R owner/repo --comments
gh issue list -R owner/repo --json number,body --jq \
  '[.[] | select(.body != null and (.body | test("## Parent Epic\\n#ISSUE_NUMBER")))]'
```

If the user gives a URL, parse owner/repo/number from it.

### Step 2: Analyse the story

Read as a senior developer preparing for implementation:

- **Who** is the user or system actor?
- **What** problem are we solving and why now?
- **What** is explicitly in scope vs implied?
- **What** is missing, ambiguous, or contradictory?
- **What** dependencies, integrations, or prior work exist?
- **What** edge cases, failure modes, and non-functional needs apply (performance, security, accessibility, observability)?

Do not invent product decisions. Flag gaps as open questions instead.

Incorporate any **local project context** from the workspace (e.g. monorepo with `app/` and `api/` packages) over generic issue wording (e.g. "create learnmap/app repo") when the user or codebase has clarified structure.

### Step 3: Draft requirements

Use the template in [template.md](template.md). Fill every section that applies; omit sections that are genuinely not relevant (mark as _N/A_ only when certain).

Requirements must be:

- **Testable** — each item can become a test or verification step
- **Unambiguous** — one clear interpretation
- **Traceable** — link back to the original story intent
- **Implementation-ready** — a mid-level engineer could start work without re-interpreting the story

### Step 4: Identify open questions

List questions for the product owner or stakeholder. Group by priority:

- 🔴 **Blocking** — cannot start implementation without an answer
- 🟡 **Important** — can start with a reasonable assumption, but confirm soon
- 🟢 **Nice to clarify** — low risk if deferred

For each question, state the **assumption** you would use if no answer is available before sprint start.

### Step 5: Suggest sub-tasks

Propose a breakdown into implementable sub-tasks. Each sub-task should:

- Be small enough for a single PR or a focused slice of work
- Have a clear done condition
- Note dependencies between sub-tasks (e.g. "after #1")

Format as a numbered list suitable for child issues or a project checklist.

### Step 6: Write plan file

Write the full requirements document to disk so an implementer can work from it without reading chat history.

**Path convention:**

```
.ai/plan/issue-{NUMBER}-{slug}.md
```

- `{NUMBER}` — GitHub issue number (zero-padded optional, e.g. `10` or `010`)
- `{slug}` — short kebab-case summary of the issue (e.g. `scaffold-app`, `publish-flow`)

Create the `.ai/plan/` directory if it does not exist. The `.ai/` directory is listed in `.gitignore` — plan files stay local and are not committed.

**When re-running** for the same issue (revisions, user corrections), **overwrite** the existing file at the same path and mention what changed in the chat summary.

**File contents** must follow [template.md](template.md), including:

- Metadata (source issue, status, parent epic, labels/assignees when available)
- All requirement sections
- Open questions (grouped by priority)
- Suggested sub-tasks (numbered list)
- Any conversation refinements captured in **Context** or **Technical notes** (e.g. monorepo paths)

The plan **must** include:

```markdown
**Status:** Draft for review
```

The file is the **source of truth** for implementation; chat is a pointer to it.

### Step 7: Present summary in chat

Do **not** paste the full requirements document into chat. Instead provide:

1. **File path** — link or path to the written plan file (`.ai/plan/issue-{NUMBER}-{slug}.md`)
2. **One-paragraph summary** — what the story delivers and key scope boundaries
3. **Open questions** — count of blocking vs non-blocking, plus blocking items listed briefly
4. **Suggested sub-tasks** — compact numbered list (same as in the file)

If the user asked for revisions, note what changed since the previous version.

### Step 8: Post issue comment _(optional — user must ask)_

**Skip by default.** Follow **github-work** — do **not** post issue comments unless the user explicitly requests one (e.g. “comment on the issue with the approved plan”).

**Never** comment on issues in **external repos** (e.g. `learnmap/specs`) unless the user explicitly asks **and** confirms after you warn that the issue is outside the workspace code repo. Prefer keeping approved requirements in `.ai/plans/story-{NUMBER}.md` and chat.

When the user **does** ask for a comment **and** the target issue is in the workspace repo (or external with confirmed intent):

1. Read the approved plan from `.ai/plan/issue-{NUMBER}-{slug}.md` (or `.ai/plans/story-{NUMBER}.md`).
2. Extract these sections verbatim in substance (reformat for GitHub markdown; do not omit items):
   - **In scope** (from `## Scope` → `### In scope`)
   - **Out of scope** (from `## Scope` → `### Out of scope`)
   - **Functional requirements** (from `## Functional requirements` table)
   - **Non-functional requirements** (from `## Non-functional requirements` table)
3. Post a single comment using **github-work**:

```bash
gh issue comment {NUMBER} -R {owner}/{repo} --body "$(cat <<'EOF'
## Plan approved

Requirements below were approved for implementation. Full plan (including acceptance criteria, open questions, and sub-tasks) is in the local draft at `.ai/plan/issue-{NUMBER}-{slug}.md`.

### In scope

- [bullet from plan]
- [...]

### Out of scope

- [bullet from plan]
- [...]

### Functional requirements

| ID | Requirement | Notes |
|----|-------------|-------|
| FR-1 | ... | ... |

### Non-functional requirements

| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-1 | ... | ... |

---
_Approved at: {ISO 8601 date}_
EOF
)"
```

**Comment rules:**

- Use Australian English in prose; keep requirement IDs (`FR-1`, `NFR-1`) and code identifiers as in the plan.
- If a section is _N/A_ in the plan, omit that heading from the comment.
- If tables are empty, write _None documented._
- Do not paste open questions, sub-tasks, or secrets into the approval comment unless the human explicitly asked.
- Confirm the comment was posted (`gh issue view` or MCP); note the issue URL in chat.

**Who runs Step 8:** Only when the user explicitly asks — not as part of default approval or ship workflows.

## Quality bar

Before finishing, verify:

- [ ] Every acceptance criterion from the original story is reflected or explicitly superseded
- [ ] Functional requirements use **shall** / **must** for mandatory behaviour
- [ ] Out-of-scope items are stated to prevent scope creep
- [ ] Open questions are genuine gaps, not disguised design preferences
- [ ] Sub-tasks cover the full scope without duplicating the parent story
- [ ] No secrets, tokens, or environment-specific values in the output
- [ ] Plan file exists at `.ai/plan/issue-{NUMBER}-{slug}.md`
- [ ] Conversation refinements (monorepo layout, local paths, etc.) are reflected in the file, not only in chat

**If user requested Step 8:**

- [ ] Comment posted only because user explicitly asked
- [ ] Target repo confirmed (external-repo warning given if applicable)
- [ ] Comment includes requested sections and matches the approved plan

## Related skills

| Skill | Role |
|-------|------|
| **story-to-requirements** | Produces `.ai/plan/issue-*.md` (this skill) |
| **planner-agent** | Orchestrates this skill + approval gate; invoked by `/story {id}` |
| **implementer** | Executes an **approved** plan; produces `.ai/implementation/story-{id}.md` |

## Examples

See [examples.md](examples.md) for a before/after story conversion.
