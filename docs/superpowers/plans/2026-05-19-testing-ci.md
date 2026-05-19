# Testing and CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable test suite and GitHub Actions workflow so core MVP logic is checked on every push.

**Architecture:** Use Vitest for fast TypeScript unit tests. Keep tests focused on pure services first, with one IndexedDB repository test using `fake-indexeddb` to verify card deletion cascades.

**Tech Stack:** Vitest, fake-indexeddb, GitHub Actions, Node.js 22.

---

### Task 1: Test Tooling

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] Add scripts `test` and `test:watch`.
- [ ] Install `vitest`, `@vitest/coverage-v8`, and `fake-indexeddb`.
- [ ] Configure Vitest with alias `@`, setup file, and coverage include paths.

### Task 2: Core Logic Tests

**Files:**
- Create: `src/services/dateService.test.ts`
- Create: `src/services/reviewScheduler.test.ts`
- Create: `src/services/importService.test.ts`
- Create: `src/db/repositories/cardRepository.test.ts`

- [ ] Test local date formatting and day arithmetic.
- [ ] Test initial review state and all four review outcomes.
- [ ] Test import validation accepts valid backups and rejects inconsistent backups.
- [ ] Test deleting a card removes the card, its review state, and its review records.

### Task 3: CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

- [ ] Add workflow for `push` and `pull_request`.
- [ ] Run `npm ci`, `npm run type-check`, `npm test`, and `npm run build`.
- [ ] Document local test command in README.

### Task 4: Verification and Commit

**Files:**
- All changed files.

- [ ] Run `npm run type-check`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit and push to `origin/main`.
