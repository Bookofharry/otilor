# SmartInvoice Codex Workspace

This folder stores repo-local working context for Codex.

Use these files:

- `instructions.md`: stable execution rules for this project.
- `memory.md`: durable project memory, context, and decisions worth carrying forward.
- `tasks.md`: current work queue, next actions, and short-lived priorities.

Suggested workflow:

1. Update `instructions.md` when you want Codex to follow repo-specific rules.
2. Update `memory.md` when a decision, constraint, or architecture note should persist.
3. Update `tasks.md` when you want a clean list of active work items.

This keeps project context inside the repo instead of relying only on global Codex state.
