# AGENTS.md — SOWGenerator

A **static, single-page web app** (`index.html`) that generates Statements of Work (SOW) for
Microsoft Purview / MIP engagements. No build system or backend — the page is self-contained
and served statically (e.g. GitHub Pages). This file is the entry point for humans and coding
agents.

## Repository map
| Path | What lives here |
| --- | --- |
| `index.html` | The entire application (markup, styles, and script). |
| `Archive/mip-sow-generator.html` | Prior/archived single-page version. |
| `README.md` | Overview. |
| `tests/browser-smoke.spec.js` | Automated browser coverage for the primary user journey. |
| `scripts/verify.ps1` | Structural and browser-behavior verification entry point. |
| `.github/ISSUE_TEMPLATE/` | Issue templates. |
| `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `LICENSE` | Governance. |

## Working here
- Keep the application self-contained in `index.html` unless a change deliberately splits out
  assets.
- Preserve accessible labels, headings, and keyboard navigation.
- Do not add external runtime dependencies that require a production build.
- Never embed secrets, tokens, tenant identifiers, or customer data.

## Conventions
See [`docs/conventions.md`](docs/conventions.md).

## Verification / Definition of Done
```powershell
pwsh scripts/verify.ps1
```
The verify loop checks the basic HTML document and runs the Playwright browser smoke test. The
test serves the static site locally and exercises analytics consent, form entry, SOW generation,
encrypted JSON export, reset, and encrypted JSON import. Node.js, npm, and the Playwright Chromium
browser are required; the script installs locked npm dependencies and the browser.

A change is done when `verify.ps1` passes and the affected page behavior has been reviewed.

## Pull requests
- Keep PRs small, single-purpose, and focused on the requested behavior.
- Follow the required telemetry instructions below.

## PR & work-item telemetry — required
Every PR must follow [`.github/instructions/telemetry.instructions.md`](.github/instructions/telemetry.instructions.md).

## Copilot
See [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
