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
