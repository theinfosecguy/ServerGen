# Security Policy

## Reporting a vulnerability

Please do not open a public issue for suspected vulnerabilities.

Use GitHub private vulnerability reporting for this repository if it is available. If it is not available, contact the maintainer privately before sharing details publicly.

Include:

- The affected ServerGen version.
- How ServerGen was installed, such as `npm install -g servergen` or `npx servergen`.
- The command or prompt choices needed to reproduce the issue.
- The generated project type and affected files, if relevant.
- The expected impact, such as arbitrary file write, dependency risk, secret exposure, or unsafe generated defaults.

We will acknowledge the report, ask for any missing reproduction details, and coordinate a fix before public disclosure when needed.

## Scope

Security reports are most useful when they involve the ServerGen CLI, npm package distribution, scaffold generation logic, or unsafe defaults in generated projects.

For general bugs or feature requests, please use the public issue templates.
