# Junie Guidelines

This file contains technical instructions for working with the SVBB project task list in `docs/tasks.md`.

## Task List Management

### Marking Tasks Complete

When you complete a task, update the checkbox from `[ ]` to `[x]`:

```
- [x] 1.1.1 Initialize Next.js 15+ project with App Router
```

### Task Identification

Each task follows the format: `[Phase].[Section].[Number]`

- **Phase**: Major development phase (1-8)
- **Section**: Subsection within the phase (1-8)
- **Number**: Sequential task number

Example: `1.2.3` = Phase 1, Section 2, Task 3

## Working with Tasks

### Phase Completion

- Complete all tasks in a phase before moving to the next
- Phases are sequential: 1 → 2 → 3 → etc.
- Some phases can run in parallel after prerequisites are met

### Task Dependencies

Each task links to:
- **Plan Item**: The development plan item in `docs/plan.md`
- **Requirement(s)**: The requirement(s) in `docs/requirements.md`

Always ensure you understand the linked requirement before implementing.

### Adding New Tasks

If during implementation you discover additional tasks are needed:

1. Add the task in the appropriate section
2. Assign it a sequential number
3. Link it to the relevant Plan Item and Requirement(s)
4. Use the same format: `[ ] **X.Y.Z** Description`

Example:
```
- [ ] **1.1.6** Add error logging module
  *Plan Item: 1.1 | Requirements: 5*
```

### Keeping Tasks Updated

- Mark tasks `[x]` immediately upon completion
- Do not skip numbering - use sequential numbers
- Keep the same format and indentation
- Update linked requirements if scope changes

## Development Workflow

1. **Read the task** and understand its requirements
2. **Check linked requirements** in `docs/requirements.md`
3. **Check linked plan item** in `docs/plan.md` for context
4. **Implement the task**
5. **Test the implementation**
6. **Mark task as complete** `[x]`
7. **Commit changes** with descriptive message

## Commit Message Format

When committing completed work, use this format:

```
[Phase X] Completed tasks X.X.X - X.X.X

- Task description
- Task description
```

Example:
```
[Phase 1] Completed project setup tasks 1.1.1 - 1.1.5

- Initialized Next.js 15+ project with App Router
- Configured TypeScript with strict mode
- Set up Tailwind CSS v4
- Configured ESLint and Prettier
- Created project directory structure
```

## References

- Requirements: `docs/requirements.md`
- Implementation Plan: `docs/plan.md`
- Task List: `docs/tasks.md`
