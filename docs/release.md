# ServerGen release and deprecation checklist

Use this checklist for publishing a new ServerGen version to npm and GitHub.
The release workflow publishes only from `v*` tags, after the package smoke test
passes.

## Pre-release checks

Start from a clean release branch with the intended version and changelog changes
already committed or ready to commit.

```sh
git status --short
npm install
npm test
npm run test:package
npm pack --dry-run
```

Before tagging, inspect the dry-run package list and confirm the tarball includes
the files consumers need:

- `bin/servergen.js`
- `index.js`
- `lib/`
- `templates/`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

This checkout currently contains only the root `servergen` package. If a
separate `create-servergen` package is added for `npm create servergen@latest`,
confirm that package has its own `package.json`, publishes the `create-servergen`
package name, and depends on or invokes the released `servergen` CLI without
duplicating generation logic.

The generated app smoke expectations are:

- The packaged CLI installs from the packed tarball, not the working tree.
- Express and plain Node apps can be generated with `--skip-install`.
- Generated apps include real `.gitignore` files.
- Generated Dockerfiles expose the selected port.
- Generated READMEs mention the selected local URL.
- The generated Express app can install dependencies, run its own tests, boot,
  return `200` from `/`, return healthy JSON from `/health`, and stop cleanly.
- The generated plain Node app can install dependencies, boot, return JSON from
  `/`, `/about`, `/contact`, and `/health`, and return JSON `404` for a missing
  route.

## Version bump and changelog

Pick the version according to normal semver rules:

- `patch` for compatible fixes and documentation-only release corrections.
- `minor` for new compatible CLI, template, or generated-app behavior.
- `major` for breaking CLI, runtime, template, or generated-app changes.

Update `package.json` without creating the git tag yet:

```sh
npm version patch --no-git-tag-version
# or:
npm version minor --no-git-tag-version
npm version major --no-git-tag-version
```

Update `CHANGELOG.md` in the same change:

```md
## x.y.z - YYYY-MM-DD

- Short user-facing change.
- Short user-facing fix.
```

Then re-run the release checks:

```sh
npm test
npm run test:package
npm pack --dry-run
```

Commit the version and changelog change:

```sh
git add package.json CHANGELOG.md
git commit -m "chore: release x.y.z"
```

If a separate `create-servergen` package exists, update its package version in
the same release change or document why it intentionally differs. The `servergen`
and `create-servergen` package versions should normally match for adoption
releases so `npm create servergen@latest` and `npx servergen@latest` resolve to
the same documented behavior.

## Tag and release workflow

Create an annotated version tag from the exact commit that should be released:

```sh
git tag -a vx.y.z -m "vx.y.z"
git push origin HEAD
git push origin vx.y.z
```

The `.github/workflows/release.yml` workflow runs on pushed `v*` tags. It does
the following:

1. Installs dependencies on Node.js 22.
2. Runs `npm run test:package`.
3. Publishes the package to npm with `npm publish --tag latest`.
4. Uses npm trusted publishing through GitHub OIDC, so no long-lived npm token is
   required and npm provenance is attached to the package.
5. Creates the matching GitHub Release, or marks the existing matching release as
   latest.

Do not run a separate local `npm publish` for normal releases. Let the tag
workflow publish once.

### Publishing `create-servergen`

The current release workflow publishes the root `servergen` package only. If a
second `create-servergen` package exists, update `.github/workflows/release.yml`
before tagging:

1. Add a smoke step that installs the packed or published `create-servergen`
   package and runs the `npm create servergen` entry point in a temporary
   directory, verifying it creates the same generated app shape as the direct
   CLI path.
2. Add a publish step for the `create-servergen` package using its real package
   directory and `npm publish --tag latest`. Do not hard-code a directory until
   the package exists in the repo.
3. Configure npm trusted publishing for both npm packages against this GitHub
   repository and the `Release` workflow so both publishes use OIDC provenance.
4. Publish both packages from the same tag after the smoke job passes, with the
   wrapper publish ordered after the root CLI publish if it depends on the just
   published `servergen` version.
5. Extend post-release verification to check both package names:

```sh
npm view servergen version dist-tags --json
npm view create-servergen version dist-tags --json
npm view "servergen@$VERSION" dist.attestations --json
npm view "create-servergen@$VERSION" dist.attestations --json
```

## Post-release verification

Set the version once and use it in the checks:

```sh
VERSION=x.y.z
```

Confirm npm `latest` points at the new version:

```sh
npm view servergen dist-tags --json
npm view servergen version
test "$(npm view servergen version)" = "$VERSION"
```

Confirm npm shows the published tarball and provenance attestation:

```sh
npm view "servergen@$VERSION" dist --json
npm view "servergen@$VERSION" dist.attestations --json
```

Expected result: `dist.attestations.provenance.predicateType` is
`https://slsa.dev/provenance/v1`.

Confirm the GitHub Release exists and is marked latest:

```sh
gh release view "v$VERSION" --repo theinfosecguy/ServerGen --json tagName,url
test "$(gh release view --repo theinfosecguy/ServerGen --json tagName --jq .tagName)" = "v$VERSION"
```

Run an install smoke test from the public npm package:

```sh
WORKDIR="$(mktemp -d)"
cd "$WORKDIR"
npm init -y
npm install "servergen@$VERSION" --no-audit --no-fund
npx servergen -n smokeexpress -f express -p 5310 --skip-install
npx servergen -n smokenode -f node -p 5311 --skip-install
test -f smokeexpress/.gitignore
test -f smokenode/.gitignore
```

Optionally boot the generated apps:

```sh
cd "$WORKDIR/smokeexpress"
npm install --no-audit --no-fund
npm test
PORT=5310 node index.js
```

In another shell:

```sh
curl -i http://127.0.0.1:5310/
curl -i http://127.0.0.1:5310/health
```

For the plain Node app:

```sh
cd "$WORKDIR/smokenode"
npm install --no-audit --no-fund
PORT=5311 node index.js
```

In another shell:

```sh
curl -i http://127.0.0.1:5311/
curl -i http://127.0.0.1:5311/about
curl -i http://127.0.0.1:5311/contact
curl -i http://127.0.0.1:5311/health
curl -i http://127.0.0.1:5311/missing
```

## Deprecation guidance

`servergen@2.0.0` is already deprecated because it is an old 2021 package that
the active `2.1.0+` release line intentionally supersedes.

For future bad versions, prefer `npm deprecate` with owner authentication. Do
not unpublish unless it is absolutely necessary, because unpublishing can break
users and downstream reproducibility.

Use this pattern:

```sh
npm owner ls servergen
npm whoami
npm deprecate "servergen@x.y.z" "Deprecated: use servergen@<fixed-version> or newer."
```

For a version range:

```sh
npm deprecate "servergen@>=x.y.z <a.b.c" "Deprecated: affected release range; use servergen@a.b.c or newer."
```

Verify the deprecation:

```sh
npm view "servergen@x.y.z" deprecated
```

## Troubleshooting

### npm auth owner mismatch

Symptom: `npm publish`, `npm deprecate`, or package access fails even though npm
login succeeded.

Check the active npm identity and package owners:

```sh
npm whoami
npm owner ls servergen
npm access ls-packages
```

Use an npm account that is listed as an owner for `servergen`. For normal
releases, do not add an `NPM_TOKEN` workaround to the workflow. Trusted
publishing should use the configured npm package publisher and GitHub OIDC.

### GitHub release workflow failure

Open the failed run:

```sh
gh run list --workflow Release --repo theinfosecguy/ServerGen --limit 5
RUN_ID="$(gh run list --workflow Release --repo theinfosecguy/ServerGen --limit 1 --json databaseId --jq '.[0].databaseId')"
gh run view "$RUN_ID" --repo theinfosecguy/ServerGen --log-failed
```

If the `smoke` job failed, fix the package or generated-app behavior and create a
new release commit before moving the tag. If the `publish` job failed before npm
published, rerun the workflow after fixing the cause. If npm published but the
GitHub Release step failed, rerun the workflow or create/edit the matching
release manually:

```sh
gh release create "v$VERSION" --repo theinfosecguy/ServerGen --generate-notes --latest --verify-tag
# or:
gh release edit "v$VERSION" --repo theinfosecguy/ServerGen --latest
```

Always verify npm before retrying a publish path:

```sh
npm view "servergen@$VERSION" version
npm view servergen dist-tags --json
```

### Tag already exists

If the tag exists locally but was not pushed:

```sh
git tag -n "v$VERSION"
git push origin "v$VERSION"
```

If the tag exists on the remote and points to the correct commit, do not recreate
it:

```sh
git fetch --tags origin
git rev-list -n 1 "v$VERSION"
git ls-remote --tags origin "v$VERSION"
```

If the tag points to the wrong commit and the release has not published, delete
and recreate it intentionally:

```sh
git tag -d "v$VERSION"
git push origin ":refs/tags/v$VERSION"
git tag -a "v$VERSION" -m "v$VERSION"
git push origin "v$VERSION"
```

If npm already published that version, do not move the tag to rewrite history.
Publish a new patch version instead.
