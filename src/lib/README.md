# lib/ - Framework-agnostic logic

Pure, testable helpers with no React and no JSX. If it can be a plain function,
it lives here.

- `content/` - loaders + validators that read from `@/content` (Milestone 2)
- `storage/` - typed localStorage wrapper (first-visit flag, badge progress, save state)
- `analytics/` - event tracking (Milestone 9/11)
- `utils/` - generic helpers with no domain knowledge

## Dependency direction

`lib` may depend on `content`. It must not depend on `recruiter`, `world`,
`components`, `hooks`, or `providers`.
