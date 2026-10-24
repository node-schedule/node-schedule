# Changesets

Every PR that changes what gets published to npm adds a changeset describing the change:

```sh
npx changeset
```

Pick the bump type (patch, minor or major) and write a one-line summary. It goes into
`CHANGELOG.md` when the release is cut.

On each push to `master`, the Release workflow collects pending changesets into a
"Release node-schedule" PR that bumps the version and updates the changelog. Once every
check on that PR passes, the "Merge release PR" workflow approves and merges it, and the
Release workflow then publishes the new version to npm.
