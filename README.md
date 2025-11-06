# Pipeline Mapper

Visualize **GitLab CI/CD pipeline YAML files locally**, without pushing your changes.

> ⚠️ **Disclaimer:** This is an independent, community-developed VS Code extension and is **not affiliated with, endorsed by, or officially supported by GitLab Inc**. For production pipelines, always validate using the official GitLab CI/CD system.

## Quick Usage

1. Open a `.yml` or `.yaml` file in VS Code.
2. Type `Ctrl + Shift + P`
3. Type `Generate Pipeline Mapper`

> The extension only works with valid GitLab CI/CD YAML files (.gitlab-ci.yml or included files).

## Features

- Automatic stage mapping for visual representation of jobs by stage.
- Show basic information of jobs.
- Show dependencies of jobs (individually or all).
- Automatic dependency grouping (`needGroup`) for visual mapping.
- Recursive `include` support with cycle detection.
- Recursive `extends` resolution with inheritance merging.
- `needs` resolution with cycle and post-stage validation.
- Apply rules (`if`, `exists`, and `changes` supporting `||` logical OR) to see how change the pipelien flow.
- Detailed error handling for invalid YAML, missing includes, extends, or needs.
- Hidden job filtering (jobs starting with `.` are ignored).

## Known Issues

- Jobs with **optional dependencies** may appear as errors.
- Jobs with **tags** may inherit rules even when GitLab does not.
- `rules` with logical AND (`&&`) or parentheses are not supported.
- Currently only `if`, `exists`, and `changes` rules are currently handled.

## Try the Code

If you’d like to run or modify the extension locally:

### Run code

1. Clone this repo
3. Install dependencies: `pnpm install`
4. Start debugging in VS Code by pressing `F5`
5. A new Extension Development Host window will open.
6. Open a `.yml` file and run `Generate Pipeline Mapper` from the command palette.

### Make changes

- **Frontend changes:** simply rerun `Generate Pipeline Mapper` to see updates.
- **Backend changes:** press `Ctrl + R` in the Extension Host window to reload the extension.

### Run tests

```bash
pnpm run lint       # Check code style
pnpm run test:only  # Run only tests
pnpm run test       # Run linting + tests
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## LICENSE

This extension is licensed under the [MIT License](LICENSE).
