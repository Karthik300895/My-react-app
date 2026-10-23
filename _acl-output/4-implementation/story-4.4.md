---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-23T04:50:06.471Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 4.4: Review Release Traceability'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-23'
story_key: 4-4-review-release-traceability
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/prds/prd-my-react-app-2026-10-21/prd.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-23
---

# Story 4.4: Review Release Traceability

## Intent

**Problem:** Nothing shows that the shipped code matches the approved documents. A reviewer has to trace FRs, stories, tests and architecture decisions by hand.

**Approach:**
- **Trace check:** `npm run trace` reads the PRD's FR-1 to FR-35, scans test titles and e2e specs for FR ids, and prints a matrix of FR → test files. It fails if any FR has no test, or if any FR in FR-10 to FR-29 has no test under `src/`.
- **Story coverage:** the same run reads `epics.md` and fails if an FR is covered by no story, or a story names neither an FR nor an NFR.
- **AD checklist:** a release review file records, for each of AD-1 to AD-16, the enforcement point in code, its test or lint rule, and a flag for any AD with no enforcement. It also records the AD-12 regression check.

## Boundaries & Constraints

**Always:**
- The trace check reads the documents and the test files. It does not edit them.
- A failing trace is reported as it is. Its result is not hidden to make it pass.
- The AD checklist cites real file paths and test names, checked with search.

**Ask First:** Any change to the FR range the trace enforces, or to the automated-test rule for FR-10 to FR-29.

**Never:**
- Add trivial tests to meet the trace. Coverage thresholds apply only to Cart and Checkout logic (SM-C2).

## Interpretation Choices

- **Test title forms:** the existing tests use `FR4:`, and Story 4.3 uses `FR-4:`. The trace accepts both, so each form counts for its FR.
- **E2E specs:** a spec counts when its test title carries an FR id (for example `UJ-3 FR25–FR28:`). Specs named by journey are matched by their titles, not their filenames.
- **Automated test:** every test in `src/**/*.test.*` or `e2e/**/*.spec.ts` is automated. The FR-10 to FR-29 rule therefore requires at least one unit, component or app test under `src/`, not only an e2e spec.
- **Git:** the repo is not under git yet. Commit references to story ids are deferred, as the spec says, so the trace reads no git history.
- **Scope:** the script lives in `tooling/`, alongside `check-build.ts`, and runs with Node type stripping (Node 22.18 or later).

## Code Map

- `tooling/trace.ts`: the trace check and the matrix.
- `tooling/traceRules.test.ts`: tests for the title parser and the story and FR rules, with fixture text.
- `package.json`: a `trace` script.
- `_acl-output/4-implementation/release-checklist.md`: the AD checklist and the AD-12 check, for release review.

## Tasks & Acceptance

- [x] `npm run trace` prints the FR-1 to FR-35 matrix with the test files for each FR
- [x] The run fails when an FR has no test, or an FR in FR-10 to FR-29 has no `src/` test
- [x] The run fails when an FR is covered by no story, or a story names neither an FR nor an NFR
- [x] The title parser accepts both `FR4:` and `FR-4:`
- [x] The release checklist lists AD-1 to AD-16, each with its enforcement point and its test or lint rule, and flags any AD with no enforcement
- [x] The checklist's AD-12 section records the dev check of `/markdown.html` and `/api/*`, and the protected files, as run or not run
- [x] The trace's result is reported as it is, including any failures
- [ ] tsc, lint, Vitest and `vite build` pass for the new code (tsc, Vitest (435 tests) and build pass; lint has one pre-existing error in tools/atlassian-service.mjs, not from this story)

## Spec Change Log

- 2026-10-23: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-23: Implemented. Added tooling/traceRules.ts (pure rules), tooling/trace.ts (CLI and matrix), tooling/traceRules.test.ts (10 tests), the trace script, and _acl-output/4-implementation/release-checklist.md. Run result: the matrix shows all 35 FRs with test files, and the run fails on one gap: Story 1.1 in epics.md names no FR or NFR. Open findings are listed in the checklist, Part 3: protected Markdown Studio files differ from the manifest (AD-12), the AD-10 build check fails on a false positive, and one AD-9 e2e spec fails.
