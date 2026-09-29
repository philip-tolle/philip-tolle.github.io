# Agent Handoff Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the canonical NextCourse website checkout unambiguous and safe for another AI agent to continue from.

**Architecture:** Keep the public repository self-describing through a root `AGENTS.md`, a concise handoff document, and a README link. Update the non-repository roof documentation only as a local navigation layer; historical operational records remain intact and are clearly marked as superseded where necessary.

**Tech Stack:** Markdown, Git, Astro build verification, PowerShell validation.

**Spec:** User-approved cleanup and handoff request in this chat; current hosting rules in `README.md`; roof instructions in `C:/NextCourse Website -Projekte/AGENTS.md`.

## Global Constraints

- Canonical website checkout: `C:\NextCourse Website -Projekte\nextcourse-site`.
- GitHub is source control only; GitHub Pages remains disabled.
- IONOS deployment is separate and requires explicit user approval.
- Never commit `.local/`, credentials, access passes, keys, release packages, or machine-specific data.
- Do not delete branches, backups, snapshots, or scratch data in this task.

## Review Focus

- A fresh agent must find the canonical path and branch without relying on chat history.
- Hosting instructions must not imply that a GitHub push updates IONOS.
- Historical documents must not override the dated current-status block.
- Local secrets and ignored working data must remain explicitly excluded from GitHub.
- Build commands must work on Windows even when `npm` is not globally available.

---

### Task 1: Authoritative repository handoff

**Files:**
- Create: `AGENTS.md`
- Create: `docs/AI-UEBERGABE.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: current hosting and Git status established on 2026-09-29.
- Produces: the first-read instructions and current handoff reference for future agents.

- [ ] **Step 1: Verify the handoff files do not yet exist and README has no agent entry**

Run a PowerShell content check. Expected: FAIL because `AGENTS.md` and `docs/AI-UEBERGABE.md` are absent.

- [ ] **Step 2: Add the minimal authoritative instructions**

Document canonical path, `main`/`origin/main`, IONOS-only publishing, Pages disabled, privacy boundaries, verification commands, and the no-live-deploy-without-approval rule.

- [ ] **Step 3: Re-run the content check**

Expected: PASS for all required markers.

### Task 2: Correct the local roof documentation

**Files:**
- Modify: `C:/NextCourse Website -Projekte/AGENTS.md`
- Modify: `C:/NextCourse Website -Projekte/WEBSITE-PROJEKT.md`
- Modify: `C:/NextCourse Website -Projekte/WEBSITE-UEBERGABE.md`
- Modify: `C:/NextCourse Website -Projekte/START-AM-NEUEN-PC.md`

**Interfaces:**
- Consumes: the repository handoff from Task 1.
- Produces: local navigation that points agents to the canonical repository and labels old migration records as historical.

- [ ] **Step 1: Add a dated 2026-09-29 current-status block**

Correct the stale uncommitted-change, old-PC-path, branch, and GitHub Pages statements without erasing historical evidence.

- [ ] **Step 2: Validate that each roof document points to the canonical checkout or current repository handoff**

Expected: PASS; historical dated material remains below the new notice.

### Task 3: Verify, commit, and synchronize

**Files:**
- Verify all tracked files from Task 1 and the plan file.

**Interfaces:**
- Consumes: Tasks 1 and 2.
- Produces: a clean, buildable `main` synchronized with `origin/main`, plus a separate deletion candidate list for user review.

- [ ] **Step 1: Run the full Astro production build**

Run Astro with the bundled Node executable. Expected: exit code 0 and `build Complete`.

- [ ] **Step 2: Review the diff and secret boundaries**

Expected: documentation-only tracked changes; no `.local`, credentials, generated output, or private packages staged.

- [ ] **Step 3: Commit the repository documentation**

Commit message: `docs: KI-Agenten-Übergabe aktualisieren`.

- [ ] **Step 4: Push `main` and verify synchronization**

Expected: local `HEAD` equals `origin/main` and the worktree is clean.
