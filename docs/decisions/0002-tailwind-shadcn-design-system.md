# 2. Tailwind CSS and shadcn/ui Design System

Date: 2026-10-23
Status: Accepted

## Context

The user interface must convey a "Science Lab meets Editorial Journal" visual direction: dark-mode first, refined spacing, high-contrast typography, and responsive micro-animations for interactive simulations.

## Decision

We chose **Tailwind CSS 3.4** paired with **shadcn/ui** atomic primitives and **Lucide React**:

- shadcn/ui provides unstyled, accessible component primitives (Button, Card, Badge) directly copied into the repository, allowing total styling control without external runtime library lock-in.
- CSS variables define the dark theme palette (`#080c14`, cyan `#06b6d4`, violet `#8b5cf6`, amber `#f59e0b`, emerald `#10b981`).
- Custom utility classes (`lab-grid`) and keyframe animations provide scientific visual flair without heavy graphic assets.

## Consequences

- Components live inside `src/components/ui/` and can be customized per simulation requirements.
- Full compatibility with Next.js 15 React Server Components.
