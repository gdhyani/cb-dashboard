# Contributing to cb-dashboard

Welcome, and thank you for your interest in cb. This repository holds the admin and developer web app, and the public documentation site (`content/docs/`).
cb is split across three repositories — [cb-env](https://github.com/gdhyani/cb-env),
[cb-backend](https://github.com/gdhyani/cb-backend) and [cb-dashboard](https://github.com/gdhyani/cb-dashboard) —
and they share one contribution process.

The full contributor guide lives in the Community section of the docs (`/docs/community` in the dashboard, or `content/docs/community/` in [gdhyani/cb-dashboard](https://github.com/gdhyani/cb-dashboard/tree/main/content/docs/community)): local development across all three repositories,
code standards, adding a connector and updating the docs.

## Ways to contribute

- **Report a bug** with the bug report form in Issues.
- **Ask for a feature** or **a new connector** (a service cb should broker) with the matching issue form.
- **Improve the docs**: fix a mistake, clarify a step, add an example.
- **Fix an issue**: look for issues labelled `good first issue` or `help wanted`, and comment that you are
  taking one before you start.
- **Review pull requests** and try changes locally.

Security vulnerabilities are never reported in public issues. See [SECURITY.md](SECURITY.md).

## Development setup

You need Node.js 22 or newer and npm.

```bash
git clone https://github.com/gdhyani/cb-dashboard.git
cd cb-dashboard
npm install
npm run dev        # http://localhost:4201 — /api/* is proxied to CB_API_URL (default http://localhost:4200)
```

The app needs [cb-backend](https://github.com/gdhyani/cb-backend) running on port 4200.
The docs are served at `http://localhost:4201/docs`.

## Branches and commits

1. Fork the repository and create a branch from `main` named `<type>/<short-slug>`,
   for example `feat/redis-tls` or `fix/login-redirect`.
2. Write commits in [Conventional Commits](https://www.conventionalcommits.org/) form:
   `type(scope): summary`, where type is one of `feat`, `fix`, `docs`, `refactor`, `test`, `ci` or `chore`.
   Keep the summary short and say what changes for the user.
3. Open a pull request against `main` and fill in the template. Keep each pull request to one change.

## Tests

```bash
npm test                # Vitest + Testing Library, plus docs checks (links, images, secrets)
npm run lint            # Biome
npm run typecheck       # TypeScript
```

Check every UI change in a real browser at desktop width and at 375px (phone width):
click through the flow and read the browser console for errors.

Before you ask for review:

- Write the test first, then the code. Every new behaviour has at least one test.
- `npm test`, `npm run lint` and `npm run typecheck` pass locally and in CI.
- UI changes are checked in a browser at desktop width and at 375px.

## Docs

Every user-visible change — a page, a flow, a label, a command, a flag, a connector, configuration or an
error message — updates the documentation in
[`cb-dashboard/content/docs/`](https://github.com/gdhyani/cb-dashboard/tree/main/content/docs) in the same change.
For a change in this repository that means a companion pull request in cb-dashboard, linked from yours.
If nothing a user or contributor sees has changed, write `Docs: not needed — <reason>` in the pull request.

## Never commit secrets

Never commit real secrets, tokens, private keys, `.env` files or personal data — not in code, tests,
fixtures, screenshots or logs. Use stand-in values that contain a `cb` marker, such as `sk_test_cb…`,
`sk-cb-…` or `cbu_ab12cd34`, and addresses on an `.example` domain for any email or host.
Never log a secret or a token; use the repository's redaction helper.

## License

By contributing, you agree that your contributions are licensed under the
[Apache License 2.0](LICENSE), the license of this project.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By taking part you agree to uphold it.
