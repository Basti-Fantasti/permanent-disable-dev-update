# HACS Default Store Submission Requirements

Research date: 2026-04-17
Source: https://hacs.xyz/docs/publish/integration/ + HACS action validation rules

This document captures everything needed to submit a custom integration to the HACS
default store (https://github.com/hacs/default). It is intended as a reference for
building new integrations and as source material for a future skill.

---

## 1. GitHub Repository Requirements

| Requirement | Notes |
|---|---|
| Public repository | Private repos are not supported |
| Repository description | Must be a real sentence — not just the repo name |
| At least one topic | e.g. `home-assistant`, `hacs-integration`, `home-assistant-integration` |
| Issues enabled | GitHub Issues must be turned on |
| Not archived | Repository must be active |
| Submitter is owner/major contributor | Verified at PR submission time |

Set description and topics via **GitHub → Settings** or `gh repo edit --description "..." --add-topic home-assistant`.

---

## 2. Required Repository Structure

```
ROOT/
  custom_components/
    YOUR_DOMAIN/
      __init__.py
      manifest.json
      strings.json
      translations/
        en.json
      ... (all integration files)
  brands/
    icon.png          ← required
    logo.png          ← recommended
  hacs.json
  README.md           ← or info.md
  CHANGELOG.md        ← recommended
```

- Only **one integration** per repository (one subdirectory under `custom_components/`).

---

## 3. manifest.json — Required Fields

```json
{
  "domain": "your_domain",
  "name": "Your Integration Name",
  "version": "1.0.0",
  "documentation": "https://github.com/owner/repo",
  "issue_tracker": "https://github.com/owner/repo/issues",
  "codeowners": ["@github-username"],
  "config_flow": true,
  "integration_type": "service",
  "iot_class": "calculated"
}
```

All six fields (`domain`, `name`, `version`, `documentation`, `issue_tracker`, `codeowners`) are
validated by hassfest. `config_flow` and `integration_type` are not strictly required but
expected for user-facing integrations.

---

## 4. hacs.json — Required and Optional Fields

Minimum valid file:
```json
{ "name": "Your Integration Name" }
```

Full reference:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | **Yes** | Display name shown in HACS UI |
| `homeassistant` | string | No | Minimum HA version (e.g. `"2024.12.0"`) |
| `hacs` | string | No | Minimum HACS version |
| `zip_release` | bool | No | Set `true` if release assets are zipped archives |
| `filename` | string | No | Zip filename to download (use with `zip_release`) |
| `render_readme` | bool | No | Render README as info page instead of info.md |
| `hide_default_branch` | bool | No | Prevent selecting the default branch as version |
| `content_in_root` | bool | No | Files are in repo root, not `custom_components/` |
| `country` | string/list | No | ISO 3166-1 alpha-2 for region-specific integrations |
| `persistent_directory` | string | No | Path preserved across upgrades |

For integrations with a compiled/bundled frontend, use `zip_release: true` + `filename`:
```json
{
  "name": "My Integration",
  "zip_release": true,
  "filename": "my_integration.zip",
  "homeassistant": "2024.12.0"
}
```

---

## 5. Brand Assets

> **Updated 2026-04-17** — Since HA 2026.3, the `home-assistant/brands` repository
> **no longer accepts PRs for custom integrations**. Brand assets are now shipped
> directly inside the integration directory and served via HA's local brands proxy API.
> Source: https://developers.home-assistant.io/blog/2026/02/24/brands-proxy-api

### New process (HA 2026.3+)

Place brand images in `custom_components/{domain}/brand/` inside your repository.
They are picked up automatically — no external repo PR needed.

```
custom_components/
  your_domain/
    brand/
      icon.png          ← 256×256 px, transparent background
      icon@2x.png       ← 512×512 px
      logo.png          ← max 256 px tall, transparent background
      logo@2x.png       ← max 512 px tall
      dark_icon.png     ← optional dark-theme variant
      dark_logo.png     ← optional dark-theme variant
```

All files are optional but `icon.png` is the minimum expected. These files are
included automatically in the release zip (they live inside `custom_components/`).

### HACS validation

The HACS action checks `custom_components/{domain}/brand/icon.png` first.
If absent, it falls back to the `home-assistant/brands` CDN. Because the brands repo
no longer accepts custom integration PRs, the `brand/icon.png` path **must** exist
in the repository for the HACS brands check to pass.

### Generating PNGs from SVG

```bash
uv run --with cairosvg python3 - <<'EOF'
import cairosvg, pathlib

svg = "logo/logo.svg"
out = pathlib.Path("custom_components/your_domain/brand")
out.mkdir(exist_ok=True)

for name, size in [("icon.png",256),("icon@2x.png",512),("logo.png",256),("logo@2x.png",512)]:
    cairosvg.svg2png(url=svg, write_to=str(out/name), output_width=size, output_height=size)
    print(f"Generated {out/name}")
EOF
```

---

## 6. GitHub Releases

- At least **one GitHub Release** must exist at time of PR submission (a git tag alone is not sufficient).
- Release tag format must be a semantic version: `v1.0.0`, `v2024.1.0`, etc.
- The release asset must be the integration zip when `zip_release: true` is set.
- HACS shows the 5 latest releases + default branch as download options.

### Recommended release workflow (`.github/workflows/release.yml`)

```yaml
name: Release

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node           # only if you have a frontend to build
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Zip integration
        run: |
          cd custom_components/your_domain
          zip -r /tmp/your_domain.zip .

      - name: Create GitHub release
        uses: softprops/action-gh-release@v2
        with:
          files: /tmp/your_domain.zip
          generate_release_notes: true
```

---

## 7. Required CI Workflows

Both workflows must pass before submitting the PR to hacs/default.

### validate.yml — Hassfest + HACS Action

```yaml
name: Validate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:          # allows manual re-runs

jobs:
  hassfest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: home-assistant/actions/hassfest@master

  hacs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hacs/action@main
        with:
          category: integration
```

### test.yml — Python tests + frontend (optional but strongly recommended)

Run `pytest` for Python and `npm test` + `npm run build` for any frontend bundle.

---

## 8. PR Submission to hacs/default

1. All CI checks on your repo must be green.
2. At least one GitHub Release must exist.
3. Open a PR at https://github.com/hacs/default adding your repo (`owner/repo`) to the
   `integration` file, **alphabetically sorted**.
4. The following automated checks run on the PR:

| Check | What it validates |
|---|---|
| Check brands | `brands/icon.png` exists |
| Check manifest | `manifest.json` valid per HA spec |
| Check hacs-validation | Full HACS internal validation |
| Check HACS manifest | `hacs.json` has at least `name` |
| Check archived | Repo is not archived |
| Check releases | At least one release exists |
| Check owner | Submitter is owner/major contributor |
| Check repository | Description set, issues enabled, topics set |
| lint jq | PR JSON is valid |
| lint sorted | Entry is alphabetically sorted |

All checks must pass before the PR can be merged by the HACS team.

---

## 9. Pre-release Checklist

Use this before cutting a release and opening the PR to hacs/default:

- [ ] `manifest.json` has all required fields, version is a semantic version (`1.0.0`)
- [ ] `hacs.json` has at least `name`
- [ ] `custom_components/{domain}/brand/icon.png` exists (256×256 px, transparent background) — **do NOT submit to home-assistant/brands, that repo no longer accepts custom integration PRs (HA 2026.3+)**
- [ ] `README.md` (or `info.md`) exists with setup instructions
- [ ] `translations/en.json` exists and matches `strings.json`
- [ ] GitHub repo description is a real sentence
- [ ] GitHub repo has at least one topic (e.g. `home-assistant`, `hacs-integration`)
- [ ] GitHub Issues is enabled
- [ ] Repo is public and not archived
- [ ] `validate.yml` runs hassfest + HACS action (with `workflow_dispatch` trigger)
- [ ] All CI checks green on main
- [ ] At least one GitHub Release exists with the zip asset attached
- [ ] `CHANGELOG.md` has an entry for the release version
