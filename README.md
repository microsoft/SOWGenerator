# Microsoft Purview Data Security SOW Generator

A browser-based tool for Microsoft partners to generate a Statement of Work (SOW) draft for Microsoft Purview data security engagements based on the partner facing Microsoft Data Security Deployment Guides.

Live site: [SOW Generator](https://microsoft.github.io/SOWGenerator)

## Overview

This project provides a guided form experience that helps partners:

- Capture engagement details and customer context
- Select implementation workstreams based on licensing and service model
- Generate a structured SOW draft in real time
- Export or print the generated output for review

The application is a static web app (single HTML file) and requires no build step.

## Key Features

- Guided multi-step form for SOW inputs
- Dynamic scope logic for licensing and managed services
- In-browser SOW document generation
- Print-friendly document output
- Optional analytics consent flow for Microsoft Clarity

## Quick Start

Open the live tool:

https://microsoft.github.io/SOWGenerator

### Run locally

Because this is a static app, you can run it directly from the repository:

1. Clone the repository.
2. Open `index.html` in your browser.

For best results, serve the folder with a local web server:

```powershell
cd SOWGenerator
python -m http.server 8080
```

Then browse to:

http://localhost:8080

## Repository Structure

- `index.html`: Main application UI, styles, and logic
- `Archive/mip-sow-generator.html`: Archived previous version
- `README.md`: Project overview and usage

## Intended Audience

- Microsoft channel partners
- Security and compliance consultants
- Pre-sales and delivery teams preparing Purview implementation proposals

## Data and Privacy Notes

- The tool runs in the browser.
- Optional analytics are loaded only after explicit user consent.
- Do not enter sensitive or regulated data unless your organization approves this workflow.
- Generated SOWs and exports may contain customer names, user counts, scope details, and other sensitive organizational information.
- Word downloads, Print/Save as PDF output, and clipboard copies are plaintext. JSON exports are encrypted with a user-supplied passphrase, but decrypted content is still exposed when imported and viewed.
- Because this is a static, unauthenticated client, it cannot enforce sensitivity labels, DLP, recipient restrictions, retention, access revocation, or deletion after a file is downloaded or copied.
- Store, share, retain, and delete all downloaded or copied content according to your organization's Microsoft Purview, DLP, records management, and retention policies.
- Microsoft Clarity is consent-gated on the current app, and the generated document and dialog surfaces are explicitly masked. The published archive does not initialize Clarity.

## Disclaimer

This generator provides a draft starting point and does not constitute legal advice. Final SOW content should be reviewed by appropriate business, legal, and technical stakeholders.

## License

Licensed under the MIT License. See [LICENSE](LICENSE).
