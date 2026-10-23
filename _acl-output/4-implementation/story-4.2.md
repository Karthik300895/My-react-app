---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-23T03:58:39.214Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 4.2: Enforce the Performance and Accessibility Budget'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 4-2-enforce-the-performance-and-accessibility-budget
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-21
---

# Story 4.2: Enforce the Performance and Accessibility Budget

## Intent

**Problem:** Performance and accessibility budgets are written down but not checked, so a regression would go unnoticed.

**Approach:**
- **Tool:** Lighthouse CI, `@lhci/cli` pinned to `0.15.1`. Its npm publish date is June 2025, so it is more than two weeks old. The choice is recorded in the architecture spine.
- **Budgets:** `lighthouserc.json` runs mobile emulation on Home, Product Listing and Product Details, and fails on Performance ≥ 0.9, Accessibility ≥ 0.9, LCP ≤ 2500 ms, and CLS ≤ 0.1.
- **Images:** every `<img>` already has explicit `width` and `height`, and every below-fold image uses `loading="lazy"`. The gallery's main image is the only one with `fetchPriority="high"`, because it is above the fold.
- **CI:** a Lighthouse job runs after `e2e` and blocks the merge on failure.

## Boundaries & Constraints

**Always:**
- Budgets are not loosened to make a page pass. A failing page is reported, and the fix must keep images, skeletons and accessibility features (SM-C3).
- The job runs after `e2e`.

**Ask First:** Any change to a budget threshold, or to the set of pages measured.

**Never:**
- Remove images, skeletons or accessibility features to win a score.

## Interpretation Choices

- **Data source for the budget run:** the epics say "a production build served by `vite preview` with MSW-backed data". AD-10 says MSW is stripped from production builds. These two conflict. This story follows AD-10 and serves the production build, so the catalog comes from the live API. This is flagged as an open decision below.
- **Budget scope:** mobile emulation only, as the spec states. Desktop is not measured here.

## Code Map

- `package.json`: `@lhci/cli` pinned at `0.15.1`, and a `lhci` script.
- `lighthouserc.json`: the URLs, the preset, and the assertions.
- `.github/workflows/quality.yml`: a `lighthouse` job, after `e2e`.
- `_acl-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md`: records the tool choice, if the memlog section exists.

## Tasks & Acceptance

- [x] `@lhci/cli` is verified on npm, pinned in `package.json`, and recorded in the architecture spine
- [x] `lighthouserc.json` covers Home, Product Listing and Product Details in mobile emulation
- [ ] Performance ≥ 0.9, Accessibility ≥ 0.9, LCP ≤ 2500 ms, CLS ≤ 0.1 are asserted as errors
- [x] Every `<img>` has explicit `width` and `height`, and below-fold images use `loading="lazy"` (checked in the code)
- [x] The workflow's `lighthouse` job runs after `e2e` and fails the build on a budget miss
- [x] Open decision recorded: the data source for the budget run (live API versus MSW)
- [x] The Lighthouse run result is reported as it is. Run results are not claimed without a run.

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented the tooling: @lhci/cli 0.15.1 pinned, lighthouserc.json, the lhci script, and a lighthouse CI job after quality. Budget run on the production build (categories performance and accessibility, mobile): accessibility passes on all three pages. Performance is 0.69 to 0.72 (budget 0.9). LCP is 4.2 to 5.5 s (budget 2.5 s). CLS on Home is 0.134 (budget 0.1). These numbers are from the live API, not MSW. Blocker: `npm run build` fails the AD-10 check because public/markdown.html contains the text "mockServiceWorker" in its own documentation; that blocks the quality and lighthouse CI jobs. Not fixed: needs a decision.
