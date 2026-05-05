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
