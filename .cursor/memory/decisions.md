# Decision Memory

This file stores CEO-approved project decisions.

Rules:

- Only approved decisions are saved.
- Active decisions should be reused.
- Old decisions are not deleted.
- Changed decisions are appended as updated decisions.

---

### Decision: Enable milestone drag reorder

Date: 2026-05-05

Approved by:
CEO

Context:
Goal detail screen needed manual ordering of goal milestones by drag-and-drop.

Decision:
Implement milestone reorder in `GoalDetailSheet` via drag-and-drop and persist order in Zustand store using `reorderMilestones`.

Reasoning:
Drag reorder matches expected UX for task sequencing and keeps ordering stable across app restarts.

Alternatives considered:

- Keep static list with no reordering
- Add move up/down buttons per milestone

Risks:

- Gesture conflicts with text editing interactions
- Potential regression in list accessibility

Status:
Active

---

### Decision: Add central Insights tab MVP

Date: 2026-05-05

Approved by:
CEO

Context:
Need to add a new main Insights tab and screen to Metify as a calm AI-powered reflection center.

Decision:
Implement a centered emphasized `Insights` tab in bottom navigation and build an MVP Insights screen with reusable typed cards and separated mock data.

Reasoning:
This introduces a clear core feature, improves daily product value, and keeps implementation scalable for future API/AI integration.

Alternatives considered:

- Add Insights as a regular non-centered tab
- Build only a simple single-card insights screen without sectioned architecture

Risks:

- Central elevated tab may need careful safe-area tuning on Android and iOS
- Text-heavy cards can reduce perceived clarity if spacing is not balanced

Status:
Active

---

### Decision: Approve Insights MVP task breakdown

Date: 2026-05-05

Approved by:
CEO

Context:
Needed a concrete implementation task split for adding the new central Insights tab and full MVP insights screen.

Decision:
Approve task breakdown with five tasks: tab integration, typed mock domain, reusable cards, screen composition with local interactions, and QA pass.

Reasoning:
The split keeps scope PR-sized, separates concerns cleanly, and minimizes risk while preserving delivery speed.

Alternatives considered:

- Implement all changes in one monolithic task
- Build only tab + simple placeholder screen first

Risks:

- Potential UI inconsistency if card components diverge stylistically
- Navigation regressions if tab layout changes are not validated on both platforms

Status:
Active

---

### Decision: Approve Insights PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed approval for concrete implementation plan and file scope before editing code for Insights MVP.

Decision:
Approve PR plan for implementing central Insights tab, typed mock data, reusable Insights components, and full Insights screen composition.

Reasoning:
Plan is scoped, testable, and aligned with current Expo Router architecture without extra dependencies.

Alternatives considered:

- Split into several sequential PRs
- Implement only navigation placeholder first

Risks:

- Center tab customization might affect tab bar accessibility and layout
- New screen density might require spacing refinements after device testing

Status:
Active

---

### Decision: Approve full Insights system plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed approval for implementing a full local Insights system with data aggregation, AI generation, fallback logic, and caching without backend.

Decision:
Implement a layered Insights architecture using AsyncStorage adapters, pure insight engine calculations, OpenAI generation with strict fallback, a main insights service, and a dedicated React hook.

Reasoning:
This keeps the current app backend-free while delivering real personalized insights and preserving clean migration path to future API + MongoDB architecture.

Alternatives considered:

- Keep static mock insights without real data aggregation
- Build only deterministic rule-based insights with no AI layer

Risks:

- OpenAI key/network failures requiring robust fallback coverage
- Persisted storage shape drift may break adapters if unhandled

Status:
Active

---

### Decision: Approve full Insights system task breakdown

Date: 2026-05-05

Approved by:
CEO

Context:
Required a concrete implementation split for full Insights functionality with local aggregation, AI generation, fallback, caching, and UI wiring.

Decision:
Approve task breakdown TASK-006..TASK-011 for phased implementation of storage adapters, insight engine, AI generator, orchestration service, hook integration, and QA pass.

Reasoning:
This sequence minimizes integration risk, keeps responsibilities separated, and supports future backend migration with minimal rewrites.

Alternatives considered:

- One-step implementation in a single large task
- Hook/UI-first implementation before core services

Risks:

- Coupling to current persisted Zustand payload shape
- AI failures if key/network is unavailable

Status:
Active

---

### Decision: Approve full Insights implementation PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed explicit pre-coding approval for file scope, implementation sequence, and test plan for the full Insights system rollout.

Decision:
Approve PR plan for implementing local storage adapters, insight engine, AI generator, orchestrating insights service, hook integration, and UI data wiring.

Reasoning:
The plan provides clear boundaries between data, logic, AI, and UI while keeping rollback simple.

Alternatives considered:

- Implement only service layer without UI integration
- Keep mock-data UI while building backend-ready code in parallel

Risks:

- OpenAI request variability may require stricter output normalization
- Cache staleness edge cases around refresh timing

Status:
Active

---

### Decision: Approve Insights details UX update

Date: 2026-05-05

Approved by:
CEO

Context:
The insights details modal currently shows only generation timestamp, which provides low user value.

Decision:
Move the last-updated timestamp next to the refresh action and repurpose the details modal to show life balance breakdown with a short actionable interpretation.

Reasoning:
This aligns information hierarchy with user intent: operational metadata near refresh controls, meaningful analysis inside details view.

Alternatives considered:

- Keep current timestamp-only modal
- Show both timestamp and balance details in modal

Risks:

- Modal may become text-heavy if balance explanation is too long
- Need to keep visual hierarchy clear on small screens

Status:
Active

---

### Decision: Approve Gemini onboarding AI upgrade

Date: 2026-05-05

Approved by:
CEO

Context:
Needed to make life expectancy estimation during onboarding more accurate by using Gemini AI and extending onboarding questions with additional health/lifestyle signals.

Decision:
Proceed with a two-mode estimation flow (local baseline + Gemini AI refinement), extend onboarding with essential risk-factor questions, and return structured AI output including estimated years, confidence, top factors, and improvement potential.

Reasoning:
This improves estimate quality while keeping reliability through deterministic fallback and preserves a calm motivational UX with explainable results.

Alternatives considered:

- Keep current minimal onboarding questions and simple local formula only
- Use Gemini without structured output and without confidence/factor breakdown

Risks:

- Longer onboarding may reduce completion rate if not split into core vs optional steps
- AI response variability can break parsing without strict schema validation

Status:
Active

---

### Decision: Approve Gemini onboarding task breakdown

Date: 2026-05-05

Approved by:
CEO

Context:
Needed approval for the proposed implementation split (TASK-012..TASK-017) to upgrade onboarding life expectancy flow with Gemini and explainable output.

Decision:
Approve the task breakdown and proceed with single-task implementation flow per PR.

Reasoning:
The breakdown is PR-sized, reduces integration risk, and preserves clean sequencing from data model to UI and QA.

Alternatives considered:

- Implement everything in one PR
- Start directly from UI without updating data contracts first

Risks:

- Sequential dependency between tasks can delay visible UI changes
- Schema drift risk if model updates are partially applied

Status:
Active

---

### Decision: Approve TASK-012 PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed pre-implementation approval for TASK-012 scope, branch strategy, files, risks, and test plan before editing code.

Decision:
Approve PR plan for TASK-012 to extend onboarding data contracts and store normalization with backward compatibility, without changing onboarding UI behavior.

Reasoning:
Starting from typed data foundations reduces downstream risk for AI estimation and keeps subsequent onboarding/UI tasks incremental.

Alternatives considered:

- Start with onboarding UI changes first
- Skip backward compatibility and require fresh storage

Risks:

- Persisted state merge bugs can affect existing users
- Partial profile updates may overwrite nested lifestyle fields if not normalized

Status:
Active

---

### Decision: Approve TASK-013 PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed pre-implementation approval for onboarding UI expansion to collect new risk-factor fields in core and optional advanced steps.

Decision:
Approve PR plan for TASK-013 to add onboarding questions and navigation updates without changing the data contract introduced in TASK-012.

Reasoning:
This enables richer AI-ready input while keeping rollout incremental and reducing regression risk.

Alternatives considered:

- Skip optional advanced step and keep only core questions
- Postpone onboarding UI and proceed directly to AI output changes

Risks:

- Longer onboarding can reduce completion if flow feels heavy
- Step navigation regressions may affect submit/skip behavior

Status:
Active

---

### Decision: Approve TASK-014 PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed pre-implementation approval to move life expectancy AI integration to structured Gemini JSON output with robust validation and fallback behavior.

Decision:
Approve TASK-014 plan to implement strict JSON contract, type guards, normalization, and fallback-safe parsing while preserving compatibility for existing callers.

Reasoning:
Structured output reduces parsing failures and enables explainable AI results for upcoming onboarding and insights enhancements.

Alternatives considered:

- Keep plain text parsing with regex year extraction
- Add prompt tweaks only without schema validation

Risks:

- Gemini may still return malformed content despite prompt constraints
- Overly strict parser may reject partially valid responses

Status:
Active

---

### Decision: Approve TASK-015 PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed pre-implementation approval for dual-mode life expectancy orchestration with baseline and AI-refined values plus cache/storage compatibility.

Decision:
Approve TASK-015 plan to store baseline and refined life expectancy metadata, preserve years-only compatibility, and keep insights flow fallback-safe.

Reasoning:
This enables explainable AI upgrades without breaking existing insights consumers or persisted cache behavior.

Alternatives considered:

- Keep years-only cache and ignore AI metadata
- Add orchestration only in memory without storage changes

Risks:

- Backward compatibility bugs when reading old cache records
- Inconsistent effective years if refined payload is partial

Status:
Active

---

### Decision: Approve TASK-016 PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed pre-implementation approval to show explainable life expectancy result on onboarding final step using baseline and AI-refined values.

Decision:
Approve TASK-016 plan to add onboarding result cards with refined years, confidence, top factors, and improvement potential with graceful fallback.

Reasoning:
Explainable output increases trust and aligns onboarding with reflective premium product tone.

Alternatives considered:

- Keep final onboarding step static without personalized metrics
- Show only one final number without factor breakdown

Risks:

- Too much text can reduce clarity on small screens
- AI preview timing may introduce temporary loading states

Status:
Active

---

### Decision: Approve TASK-017 PR plan

Date: 2026-05-05

Approved by:
CEO

Context:
Needed pre-implementation approval for final QA pass covering onboarding AI flow, fallback resilience, and regression checks before commit stage.

Decision:
Approve TASK-017 plan to execute end-to-end QA, document findings, and apply only minimal fixes required for merge-readiness.

Reasoning:
A dedicated QA gate reduces hidden regressions after rapid multi-task delivery and provides explicit residual-risk visibility.

Alternatives considered:

- Skip QA pass and proceed directly to commit
- Run QA without documenting outcomes in repo docs

Risks:

- Some issues may remain device-specific and require real device verification
- Existing unrelated warnings can mask new warnings if not tracked

Status:
Active

---
