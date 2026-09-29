# GitHub Sync and Pages Shutdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the current local website source, publish a security-reviewed version to GitHub `main`, and disable GitHub Pages without changing the IONOS live site.

**Architecture:** Treat the existing dirty checkout as the source of truth, protect it with an external filesystem snapshot, then curate Git tracking on a dedicated synchronization branch. Reconcile that branch with remote `main`, verify the generated static site, merge and push normally, then disable Pages through GitHub's repository settings and verify both GitHub and IONOS externally.

**Tech Stack:** Git, GitHub, GitHub Pages settings, Astro 5, PowerShell, existing Python link checker

**Spec:** `docs/superpowers/specs/2026-09-29-github-sync.md`

## Global Constraints

- Do not modify or deploy the IONOS webroot.
- Do not publish credentials, customer passes, private access data, `.local` release bundles, or temporary artifacts.
- Never use force-push, destructive reset, or broad cleanup commands.
- Preserve every pre-existing local file until the external snapshot and Git commits are verified.
- Use normal Git history against `origin/main`; no history rewrite.

## Review Focus

- An ignored file containing credentials must remain outside every staged commit.
- A needed source asset currently shown as untracked must not be omitted merely because it is new.
- Generated output and release evidence must not bloat the public repository.
- Reconciliation with `origin/main` must retain both the August remote changes and the September local website.
- Disabling Pages must not alter DNS or the IONOS-served production website.

---

### Task 1: Preserve and classify the current checkout

**Files:**
- Create outside repository: `C:/NextCourse Website -Projekte/project-snapshots/nextcourse-site-2026-09-29-before-github-sync/`
- Modify: `.gitignore`
- Create: `docs/superpowers/specs/2026-09-29-github-sync.md`
- Create: `docs/superpowers/plans/2026-09-29-github-sync.md`

**Interfaces:**
- Consumes: current dirty checkout and repository metadata
- Produces: recoverable snapshot, explicit file classification, safe ignore rules

- [ ] **Step 1: Record repository status, branches, remote refs, and a complete untracked-file inventory.**

- [ ] **Step 2: Copy the checkout and `.git` metadata to the external snapshot, excluding only reproducible `node_modules`, `dist`, and transient cache directories.**

- [ ] **Step 3: Verify representative tracked, untracked, private, and Git metadata files in the snapshot by existence and SHA-256.**

- [ ] **Step 4: Classify every status entry as public source, public documentation/test evidence, generated output, or private/local-only data.**

- [ ] **Step 5: Extend `.gitignore` with the narrow local-only categories and verify sensitive paths are ignored while required source paths remain visible.**

- [ ] **Step 6: Run a staged-file credential and private-path audit; expected result is zero staged sensitive files.**

### Task 2: Capture the website on a dedicated synchronization branch

**Files:**
- Modify: all curated existing website source files reported by Git status
- Add: curated new source, assets, scripts, reviews, deployment documentation, spec and plan
- Exclude: local/private/generated categories from Task 1

**Interfaces:**
- Consumes: Task 1 classification and ignore rules
- Produces: reviewable Git commit containing the current source of truth

- [ ] **Step 1: Create `codex/website-sync-2026-09-29` at the current commit without changing working-tree contents.**

- [ ] **Step 2: Stage only the curated public source set and inspect `git diff --cached --stat`, `--name-status`, and sensitive-name/content scans.**

- [ ] **Step 3: Run `npm run build` and `python scripts/check-built-site.py`; expected result is exit code 0 and no broken internal references.**

- [ ] **Step 4: Commit the curated current website source with a synchronization message.**

### Task 3: Reconcile with current GitHub main and remove Pages automation

**Files:**
- Delete: `.github/workflows/deploy.yml`
- Modify as required by merge: files changed on both the local synchronization branch and `origin/main`
- Update: `README.md` hosting/deployment description

**Interfaces:**
- Consumes: Task 2 commit and current `origin/main`
- Produces: branch containing both remote history and current website, with Pages automation removed

- [ ] **Step 1: Fetch origin and confirm `origin/main` has not moved unexpectedly since planning.**

- [ ] **Step 2: Merge `origin/main` into the synchronization branch without rewriting history; resolve conflicts in favor of the verified current website while retaining remote-only history.**

- [ ] **Step 3: Remove the GitHub Pages workflow and update README so GitHub is documented as source control and IONOS as hosting.**

- [ ] **Step 4: Run the full build and internal-reference check again; expected result is exit code 0 and no broken references.**

- [ ] **Step 5: Commit the Pages/deployment documentation change.**

### Task 4: Review, publish Git history, and disable Pages

**Files:**
- No additional website source changes unless required by review findings
- External setting: GitHub repository Pages configuration

**Interfaces:**
- Consumes: fully verified synchronization branch
- Produces: updated remote `main`, disabled GitHub Pages, unchanged IONOS site

- [ ] **Step 1: Perform a whole-branch security and completeness review against the spec and Review Focus.**

- [ ] **Step 2: Push the synchronization branch normally and merge it into `main` without force.**

- [ ] **Step 3: Push updated `main` and verify its remote commit SHA.**

- [ ] **Step 4: Disable GitHub Pages in repository settings and verify the Pages API/UI reports it disabled.**

- [ ] **Step 5: Verify no Pages workflow remains on `main`, the repository contains the expected current source, and `https://www.next-course.de/` still returns the IONOS/Apache site.**
