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
| `.github/ISSUE_TEMPLATE/` | Issue templates. |
| `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `LICENSE` | Governance. |

## Conventions
See [`docs/conventions.md`](docs/conventions.md).

## Verification / Definition of Done
```powershell
pwsh scripts/verify.ps1
```
`verify.ps1` confirms `index.html` exists, is non-empty, and contains a well-formed
`<html>...</html>` document. A change is done when `verify.ps1` passes and the page renders
correctly in a browser.

## PR & work-item telemetry — required
Every PR must follow [`.github/instructions/telemetry.instructions.md`](.github/instructions/telemetry.instructions.md).

## Copilot
See [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
