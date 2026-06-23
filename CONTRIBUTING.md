# ServerGen Contribution Guide

Thanks for helping improve ServerGen. This project is a CLI that scaffolds Node.js and Express projects, so the most useful contributions usually include the command that was run and what changed in the generated output.

## Issues

Use the issue templates for bug reports and feature requests. For bugs, include the ServerGen version, install method, exact command, Node/npm versions, OS/shell, generated project type, actual output, and expected behavior.

Please report suspected security issues privately using `SECURITY.md` instead of opening a public issue.

## Pull requests

Keep pull requests focused. A small fix with a clear reproduction is easier to review than a broad cleanup mixed with behavior changes.

For CLI or scaffold changes, please include:

- The command or prompt path you tested.
- Any generated files that changed.
- The Node/npm versions used for testing.
- Whether the change should be mentioned in release notes.

## Local checks

Run the relevant checks before opening a pull request. At minimum, run the CLI path you changed and inspect the generated project output.

Be clear, practical, and respectful in issues and reviews.
