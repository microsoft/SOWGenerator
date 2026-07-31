# Conventions — SOWGenerator

Observed conventions. Derived from the current structure; update as it evolves.

## Layout
- **`index.html`** — the whole app: markup + inline styles/script.
- **`Archive/`** — prior single-page versions kept for reference.
- **Governance** — `README.md`, `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`,
  `LICENSE`; issue templates in `.github/ISSUE_TEMPLATE/`.

## Authoring conventions
- Static, dependency-free HTML/CSS/JS — no build tooling required.
- Keep content self-contained; prefer inline or same-repo assets over external CDNs where practical.
- Maintain accessibility for generated SOW output.
- No secrets, tokens, tenant identifiers, or customer data in markup or scripts.

## Validation
`pwsh scripts/verify.ps1` — confirms `index.html` exists, is non-empty, and is a well-formed
HTML document.
