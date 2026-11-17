# Verification report

## Publication preparation: newly executed checks

Performed against the separate publication copy, not the original project:

| Check | Result |
|---|---|
| `npm ci` | PASS: 282 packages added, 283 audited |
| `npm test` | PASS: 52 tests, 10 test files |
| `npm run build` | PASS: TypeScript + Vite, 2732 modules transformed |
| `npm run typecheck` | PASS: `tsc --noEmit` |
| PHP syntax `php -l` | PASS: 8/8 PHP files |
| `npm audit --json` | FAIL/security findings: 8 dependency vulnerabilities (5 moderate, 1 high, 2 critical) |
| Database / authenticated HTTP / browser rerun | NOT RUN in publication preparation; no database or running service changed |

Dependency findings affect `@vitest/mocker`, `esbuild`, `react-router`, `react-router-dom`, `tinypool`, `vite`, `vite-node`, and `vitest`. npm proposes major-version upgrades for remediation; these were not applied because this task preserves the tested application logic and lockfile. This repository is **not security-cleared for production deployment**. Review and test upgrades separately before deployment; keep development services bound to loopback. npm also reports deprecated whatwg-encoding/Recharts packages. React Router future-flag and Recharts zero-size jsdom warnings occur without failing tests.

## Historical integration evidence (not a fresh execution)

The source project's original end-to-end report records real **Vite :3000 → PHP :8080 → MariaDB 10.4.32 :3306** integration in an isolated test database:

- **146 assertions passed, 0 failed, 92 HTTP requests**: majority scenario 69/69, tie/revote scenario 77/77.
- Three-user login/profile, 3 candidates, 4 criteria, assessment save/finalize, independent SAW/Borda checks.
- Unauthorized mutations rejected; member cannot open or ratify; duplicate votes and duplicate ratification rejected.
- Majority 2–1 and tie 1–1–1 followed by round-two majority and chair ratification; final/history checked for all three accounts.
- SAW A/B/C: DM1 91/85/79, DM2 86/96/78, DM3 95/76/85. Borda 8/6/4 (44.44/33.33/22.22%).
- Main database fingerprints for 11 tables were reported unchanged before/after. No database fingerprinting was rerun during publication preparation.
- Historical backend regression: 16/16 passed using SQLite memory. This is not proof of MariaDB behavior and was not rerun in this publication-only task.

Historical browser coverage was limited to the public React login page, a viewport overflow probe, and public API fetches. **Authenticated browser clicks through login, assessment, voting, revote, and ratification have not been tested.** Do not describe these results as full browser E2E.

The original local report and raw evidence are retained outside this repository. Local paths, process handles, active service claims, snapshots, and runtime database state are intentionally omitted. This report makes no claim that a service is currently running or that remote CI has passed. See README for fresh setup and isolated-test safety instructions.
