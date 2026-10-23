---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-23T04:03:49.227Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 4.3: Add "Sort by Rating" by Following the Documents'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-23'
story_key: 4-3-add-sort-by-rating-by-following-the-documents
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-22
---

# Story 4.3: Add "Sort by Rating" by Following the Documents

## Intent

**Problem:** The listing sorts only by price and relevance. Shoppers cannot see the highest-rated Products first. Sort by rating is deferred in PRD §7.2, and this story is the Epic 4 extension that proves the documents are enough to add it.

**Approach:**
- **Sort table:** one row, `rating-desc`, labelled "Rating: high to low", in `SORT_OPTIONS` (AD-6, AD-7). The Sort select picks it up with no UI change.
- **Ties:** equal ratings are ordered by price ascending, then by id, so the order is deterministic.
- **URL:** `parseSort` already validates against the table, so `?sort=rating-desc` round-trips with no new code.
- **Scope:** only `features/catalog/**` changes, with its tests.

## Boundaries & Constraints

**Always:**
- Changes stay in `features/catalog/**` (and its tests or e2e). Nothing under `features/cart/**`, `features/checkout/**` or `shared/api/**` changes (NFR9).
- The changed enforcement points cite AD-6 and AD-7.
- Test titles that cover the new order start with `FR-4:`.

**Ask First:** Any change to the tie-break order, or to the label text.

**Never:**
- Change the existing relevance or price comparators.
- Change `Product`, the DTOs or the API adapter to add rating.

## Interpretation Choices

- **Test prefix:** the spec asks for `FR-4:` titles. The existing sort tests use `FR4:`, so the new tests use the spec's form. Both forms cover the same requirement.
- **Existing count test:** the test "the sort table lists exactly the three V1 options" asserts three options. Adding a fourth is the change this story exists to make, so that test is updated to four options, and the change is recorded here. No other existing sort test changes.
- **Ties:** equal ratings sort by price ascending, then id ascending. Equal prices and ratings then sort by id.
- **Write-up:** the README "Extending the store" section gets a short note on the documents and AD rules used. The time from reading the documents to a merged change is not measured here, because the merge happens outside this session.

## Code Map

- `src/features/catalog/model/criteria.ts`: the `rating-desc` row in `SORT_OPTIONS`, citing AD-6 and AD-7.
- `src/features/catalog/model/criteria.test.ts`: `FR-4:` tests for the round-trip and the new option list.
- (The `FR-4:` order and tie-break tests are in `criteria.test.ts` above, not a separate file.)
- `README.md`: the "Extending the store" note.

## Tasks & Acceptance

- [x] `sort` accepts `rating-desc`, and the Sort select shows "Rating: high to low"
- [x] `FR-4:` tests cover the rating order, the price-then-id tie-break, and the URL round-trip (`?sort=rating-desc` parses back to itself)
- [x] The existing sort tests still pass, except the two option-list assertions (criteria and listing page), which are updated as recorded above
- [ ] The diff touches only `features/catalog/**`, its tests, and the README note (not checked: this repo has no git, and no diff was reviewed)
- [x] The changed enforcement points cite AD-6 and AD-7
- [ ] tsc, lint, Vitest and `vite build` pass (tsc, Vitest and build pass; lint has one pre-existing error in tools/atlassian-service.mjs, not from this story)

## Spec Change Log

- 2026-10-23: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-23: Implemented. Added the rating-desc row to SORT_OPTIONS (AD-6, AD-7) with the price-then-id tie-break, and FR-4 tests. Updated the option-count test in criteria.test.ts and the Sort select option list in ProductListingPage.test.tsx from three to four options, as this story requires. README had no "Extending the store" section, so the section was added. Checks: tsc passes, vite build passes, catalog tests pass, and the full suite passes serially apart from the lint error in tools/atlassian-service.mjs (predates this story). The Lighthouse and AD-10 build check is not run here (blocked by the open decision in Story 4.2).
