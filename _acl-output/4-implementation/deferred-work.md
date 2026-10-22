---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T16:03:13.986Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
---

# Deferred Work

- source_spec: `_acl-output/4-implementation/story-1.1.md`
  summary: `vite build` copies Markdown Studio (`public/markdown.html`, `public/markdown/`) and the workflow SVGs into the shop's `dist/`, so a shop deployment would ship Studio.
  evidence: Vite copies all of `public/` into `dist/` (seen in the Story 1.1 build output). This existed before Story 1.1. AD-12 calls for a separate shop deployment, but it is deferred until the shop's deployment host is chosen.
- source_spec: `_acl-output/4-implementation/story-1.1.md`
  summary: Revisit the project-wide `.npmrc` `legacy-peer-deps=true` once `@hookform/resolvers` fixes its conflicting optional peers (`effect@^4` vs `@typeschema` → `effect@^3`).
  evidence: Strict peer resolution fails only on that unused optional peer. With the setting on, real peer mismatches elsewhere also go unreported, so it should be removed as soon as upstream allows.
