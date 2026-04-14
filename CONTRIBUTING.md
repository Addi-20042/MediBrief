# Contributing

This repository follows a simple workflow designed to keep changes easy to review and easy to ship.

## Branch Strategy

Create focused branches from `main`.

Examples:

- `feature/symptom-export`
- `fix/admin-user-query`
- `docs/readme-refresh`
- `chore/deployment-config`

## Commit Style

Use short, professional commit messages:

- `feat: add medication reminder audit logging`
- `fix: guard admin route while access state loads`
- `docs: improve README overview and setup instructions`
- `chore: update Vercel headers`

## Pull Requests

Before opening a PR:

1. Make sure the branch solves one clear problem.
2. Run the relevant checks locally.
3. Write a short summary of what changed and why.
4. Add screenshots for UI changes when useful.
5. Mention environment variable, migration, or deployment impact.

## Recommended Local Checks

```bash
npm run lint
npm run test
npm run build
```

## Documentation Expectations

- Update the README when setup or product behavior changes.
- Update diagrams or deployment docs when architecture changes.
- Prefer clear explanations over large undocumented code drops.

## Code Review Mindset

- prioritize correctness and user impact
- keep PRs readable and scoped
- document important tradeoffs
- leave the repo cleaner than you found it
