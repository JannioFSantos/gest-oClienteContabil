# AGENTS.md

This workspace contains a Next.js 14 application for a contabilidade platform under [nextjs_space](nextjs_space).

## Project context
- The main app lives in [nextjs_space/app](nextjs_space/app) and uses the App Router.
- Role-based access is enforced in the route-group layouts under [nextjs_space/app/(contador)](nextjs_space/app/(contador)) and [nextjs_space/app/(cliente)](nextjs_space/app/(cliente)). Preserve those checks when changing auth or routing.
- Shared UI building blocks are in [nextjs_space/components](nextjs_space/components), especially [nextjs_space/components/ui](nextjs_space/components/ui) and [nextjs_space/components/layouts](nextjs_space/components/layouts).
- Data and persistence live in [nextjs_space/lib](nextjs_space/lib) and [nextjs_space/prisma/schema.prisma](nextjs_space/prisma/schema.prisma).
- Visual conventions are documented in [nextjs_space/STYLE_GUIDE.md](nextjs_space/STYLE_GUIDE.md).

## Working rules for agents
- Prefer small, targeted edits that match the existing structure instead of broad rewrites.
- Keep server and client boundaries clear. Use server components by default and add `use client` only when interactivity is truly required.
- Use the existing shared components and design tokens rather than introducing ad-hoc UI patterns.
- Follow strict TypeScript conventions and the `@/*` path alias.
- Do not remove or weaken existing infrastructure in [nextjs_space/app/layout.tsx](nextjs_space/app/layout.tsx) unless there is a clear reason and the change is fully justified.
- Respect auth and permission flows. Route-level redirects and role validation should remain intact.
- When touching Prisma, database access, or auth, inspect the relevant files in [nextjs_space/lib](nextjs_space/lib) and [nextjs_space/prisma/schema.prisma](nextjs_space/prisma/schema.prisma) before editing.

## Validation
- Run linting from the app directory before claiming completion:
  - `cd nextjs_space && npm run lint`
- If a change affects buildability or routing, also verify with:
  - `cd nextjs_space && npm run build`

## Notes for future changes
- Keep the codebase localized and easy to follow.
- Preserve existing behavior unless the task explicitly requires changing it.
- Prefer explicit, readable code over clever abstractions.
