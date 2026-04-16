# Update Blocklist — Design Document

**Status:** Draft for review
**Date:** 2026-04-16
**Repo:** `hacs-permanent-disable-dev-update`
**HA integration domain:** `update_blocklist`

## 1. Problem

Home Assistant has no native mechanism to permanently block firmware updates for a specific device. The only existing workaround is manually disabling each device's `update.*` entity, which is tedious, easy to forget, re-enabled on re-pair, and offers no central view or audit.

This is a real problem when a device's firmware must stay exactly where it is:

- Custom Chinese WLED boards that brick on stock firmware.
- Zigbee coordinators running patched or pinned firmware.
- Devices with known-broken upgrade paths that the integration nevertheless keeps offering.

Research confirmed the gap: multiple HA community threads describe the pain; HACS has `ha-sh-update-manager` (which solves the opposite problem — automating updates on queues), but nothing for permanent blocking.

## 2. Goals

- Provide a single, persistent block list for firmware updates across all HA-managed devices.
- Make blocking impossible to accidentally bypass (no notification, no install button, no install service call succeeds).
- Preserve visibility: users should see what version would be available for each blocked device, without the block leaking as a notification.
- Survive re-pairs, renames, integration reloads, and HA restarts.
- Be eligible for inclusion in the HACS default store from day one.

## 3. Non-Goals (v1)

- Blocking HACS / integration / add-on / HA Core / HA OS updates. Only device firmware `update.*` entities.
- Pattern-based auto-block rules ("block all devices matching `WLED-Custom-*`"). Deferred to v2.
- Multi-user audit log of who changed what. Covered by a single `created_at` + free-form reason in v1.
- Full visual-regression or end-to-end browser testing of the panel.
- Per-integration out-of-band version fetchers (WLED REST, ESPHome API, etc.). v1 uses periodic re-enable scans only.

## 4. Decisions Recorded During Brainstorming

| # | Decision | Chosen option |
|---|---|---|
| 1 | Scope of what can be blocked | Device firmware updates only |
| 2 | Blocking mechanism | Disable original `update.*` entity + create shadow sensor showing last known version |
| 3 | Block granularity | Per-device, with drill-down to specific entities; pattern matching deferred |
| 4 | Configuration UX | Config flow for setup + Lit sidebar panel for management + services for automation |
| 5 | Shadow-version refresh mechanism | Periodic re-enable scan inside a configurable nightly window |
| 6 | Device identity | Store device_id + unique_id + fingerprint (manufacturer/model/name); prompt user on suspected re-pair |
| 7 | Per-block metadata | Identifiers + reason text + date added + last-known version at block time |
| 8 | Translations | English + German from day one, with scaffolding for community translations |
| 9 | Panel build approach | Single HACS integration with Lit + Vite frontend in the same repo |
| — | HA integration domain | `update_blocklist` |
| — | Scan window defaults | 01:00 start, 30 min max duration, both configurable |
| — | Branding assets | Dummy placeholder PNGs for initial commits; real assets supplied by user after local testing |
| — | HACS default store eligibility | Required from v0.1.0 |

## 5. Architecture Overview

Single HACS integration, two halves:

- **Backend** (`custom_components/update_blocklist/`): Python. Owns the block registry, identity matching, scan scheduler, entity disable/re-enable choreography, shadow-sensor state, and services.
- **Frontend** (`frontend/src/` → built to `custom_components/update_blocklist/www/panel.js`): Lit + TypeScript, built with Vite. Registered as a sidebar panel via `panel_custom`.

**Runtime model:** one config entry per HA instance. Scan window and defaults live in options flow. Day-to-day block management happens in the sidebar panel. Services mirror the panel's operations so automations can block/unblock/scan programmatically.

## 6. Components & Data Model

### 6.1 Backend modules

```
custom_components/update_blocklist/
├── __init__.py          # setup/teardown, config entry lifecycle
├── config_flow.py       # setup + options (scan window, defaults)
├── const.py             # domain, defaults, storage keys
├── store.py             # Store wrapper, versioned schema, .backup rotation
├── registry.py          # add/remove/lookup blocks, pure logic
├── identity.py          # fingerprint generation + similarity matching
├── scanner.py           # nightly window scheduler + re-enable choreography
├── coordinator.py       # DataUpdateCoordinator for panel + entity updates
├── sensor.py            # shadow version sensor per block + integration-level counters
├── binary_sensor.py     # diagnostic "update_blocked" per block
├── button.py            # per-block "scan now" and integration-level "scan all"
├── services.py          # block, unblock, scan_now, scan_all
├── services.yaml        # service schemas for HA UI
├── panel.py             # panel_custom registration, static asset view
├── api.py               # aiohttp views for panel
├── strings.json         # translation source
└── translations/
    ├── en.json
    └── de.json
```

### 6.2 Frontend modules

```
frontend/
├── src/
│   ├── update-blocklist-panel.ts    # root panel component
│   ├── views/
│   │   ├── blocks-list.ts
│   │   ├── add-block-dialog.ts
│   │   ├── rediscovery-prompt.ts
│   │   └── settings-view.ts
│   └── api-client.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Build output: a single `panel.js` file written into `custom_components/update_blocklist/www/`, shipped inside the release zip so end users don't need Node.

### 6.3 Stored data (`.storage/update_blocklist.blocks`)

```json
{
  "version": 1,
  "blocks": [
    {
      "id": "uuid",
      "device_id": "ha-device-registry-id",
      "update_entity_ids": ["update.wled_custom_firmware"],
      "unique_ids": ["aa:bb:cc:dd:ee:ff"],
      "fingerprint": {
        "manufacturer": "Espressif",
        "model": "ESP8266",
        "name": "WLED Custom Strip"
      },
      "reason": "Custom WLED firmware — stock would brick",
      "created_at": "2026-04-16T14:30:00Z",
      "last_known_version": "0.14.2",
      "last_scan_at": "2026-04-16T01:02:13Z",
      "last_scan_status": "ok",
      "status": "active"
    }
  ],
  "pending_rediscovery": [
    {
      "orphan_block_id": "uuid-of-original-block",
      "candidate_device_id": "new-device-id",
      "match_type": "unique_id",
      "detected_at": "2026-04-16T09:15:00Z"
    }
  ]
}
```

`last_scan_status` values: `ok`, `timeout`, `entity_gone`, `disable_failed`, `never_scanned`.
`status` values: `active` (block enforced), `user_overridden` (user manually re-enabled the entity — block retained but not enforced), `orphan` (device missing, awaiting re-pair decision).
`pending_rediscovery[].match_type` values: `unique_id`, `fingerprint`.

### 6.4 Entities

**Per block:**
- `sensor.<device_slug>_blocked_update_status` — state = last known `latest_version`, or `"unknown"`. Attributes: `installed_version`, `last_scan_at`, `last_scan_status`, `blocked_since`, `reason`, `matched_by`.
- `binary_sensor.<device_slug>_update_blocked` — `on` while the block is active and enforced. Entity category: `diagnostic`. Suitable for automation conditions.
- `button.<device_slug>_blocklist_scan_now` — triggers an immediate single-device scan.

**Integration-level** (single virtual device "Update Blocklist"):
- `sensor.update_blocklist_blocked_count` — count of active blocks.
- `sensor.update_blocklist_last_scan_run` — timestamp of last scan cycle.
- `sensor.update_blocklist_next_scan_at` — next scheduled scan start.
- `button.update_blocklist_scan_all` — triggers full scan immediately.

## 7. Data Flows

### 7.1 Adding a block

1. User picks a device (or specific update entity) in the panel's "Add block" dialog.
2. Backend captures device_id, chosen update_entity_ids, unique_id of each, fingerprint, and current `latest_version` as `last_known_version`.
3. Registry persists the record.
4. For each blocked `update.*` entity: `entity_registry.async_update_entity(disabled_by=DISABLED_INTEGRATION)`.
5. Shadow sensor, diagnostic binary_sensor, and "scan now" button created via coordinator refresh.

### 7.2 Removing a block

1. User removes via panel / service / options flow.
2. Registry deletes the record.
3. For each previously-blocked entity: `entity_registry.async_update_entity(disabled_by=None)`.
4. Shadow sensor, binary_sensor, button removed.

### 7.3 Nightly scan cycle

Trigger: `async_track_time_change` at configured start time, or `scan_now` / `scan_all` service, or per-block button.

Serial per device (no thundering herd), capped by configured max duration:

```
for block in registry.ordered_by_last_scan_oldest_first():
    if cycle_elapsed >= max_duration: break
    deadline = min(scan_window_end, now + per_device_timeout)   # per_device_timeout default 5 min

    # 1. Re-enable entities
    entity_registry.async_update_entity(entity_id, disabled_by=None)

    # 2. Pre-skip known latest to reduce notification surface
    await hass.services.async_call(
        "update", "skip", {"entity_id": entity_id}
    )

    # 3. Wait for latest_version refresh
    latest = await wait_for_version_refresh(entity_id, deadline)

    # 4. Capture result
    block.last_scan_at = now
    block.last_scan_status = "ok" | "timeout" | "entity_gone"
    if latest: block.last_known_version = latest

    # 5. Re-disable entity
    entity_registry.async_update_entity(entity_id, disabled_by=DISABLED_INTEGRATION)

persist(); coordinator.async_update_listeners()
```

Manual scans (`scan_now` / button) follow the same per-device choreography but ignore the window end cap.

### 7.4 Re-pair detection

On HA startup and on `device_registry_updated` events:

1. Identify blocks whose `device_id` no longer resolves.
2. For each orphan, search device registry for a match by any `unique_id` or by fingerprint similarity (manufacturer+model match + name similarity threshold).
3. Matches added to `pending_rediscovery`.
4. Panel surfaces a banner per pending item: "Device X appears to have been re-paired as Y. Re-apply block?" → Accept / Decline / Dismiss.
5. Accept updates the block with new identifiers and re-disables the new entity. Decline deletes the block. Dismiss keeps it pending.

### 7.5 Integration uninstall (safe exit)

Removing the config entry: re-enable every entity this integration disabled, remove all shadow/diagnostic/button entities, delete storage file, unregister services and the panel. HA ends in the state it was in before blocks existed.

## 8. Error Handling & Edge Cases

### 8.1 Entity-level failures

- **Entity missing during re-enable** (integration uninstalled, device removed): scan records `entity_gone`. Block retained. Panel banner: "Device gone — remove block?"
- **Re-enable succeeded, `latest_version` never populates in time:** `timeout`. Re-disable at deadline regardless. `last_known_version` untouched.
- **Re-disable fails:** log warning, record `disable_failed`, retry next cycle. Panel surfaces a health banner so the user is never silently unprotected.

### 8.2 Registry-level failures

- **Corrupted storage file:** fall back to `<file>.backup` (written pre-migration and pre-write). Last resort: start empty with a loud banner instructing the user to restore from HA backup.
- **Schema migration:** explicit version-to-version migrations in `store.py`. Always write `.backup` before migrating.
- **Concurrent writes:** single `asyncio.Lock` around all registry writes.

### 8.3 User-action edge cases

- **User manually re-enables a blocked entity through HA's entity settings:** listen for `entity_registry_updated`. Do not automatically fight the user. Mark block as `user_overridden`, diagnostic binary_sensor goes `unavailable`, panel banner: "You manually re-enabled this entity. Remove block or re-apply?"
- **User deletes a shadow sensor entity:** recreated on next coordinator refresh. Shadow sensor is not authoritative.
- **Device renamed in HA:** no impact. Identity matches on device_id + unique_id, not name.

### 8.4 Timing edge cases

- **DST transitions:** `async_track_time_change` is timezone-aware. Two dedicated tests (spring-forward, fall-back).
- **HA restarted mid-scan:** startup cleanup re-disables any entity whose `disabled_by` is `None` but whose block record exists.
- **Scan window too short for all blocks:** process in last-scanned-oldest-first order, stop at window end. Next cycle picks up the stragglers. Panel shows "N blocks not scanned this cycle".

### 8.5 Integration-level edge cases

- **HACS / integration update during a scan:** `async_unload_entry` cancels in-flight scan and re-disables any re-enabled entities before returning.
- **User uninstalls the integration that owns the blocked entity:** entity disappears → `entity_gone` → re-pair detection flow.
- **Config entry reload with blocks in place:** idempotent. All blocks re-applied (disabled_by reset to integration if somehow re-enabled).

## 9. Testing Strategy

### 9.1 Frameworks

- Backend: `pytest-homeassistant-custom-component` (HA's standard).
- Frontend: Vitest + `@open-wc/testing-helpers` for Lit component logic.

### 9.2 Backend test layers

**Unit** (pure logic, no `hass` fixture):
- `identity.py`: fingerprint generation, similarity matching, edge cases.
- `registry.py`: add/remove/lookup, duplicate handling, orphan detection.
- `store.py`: schema migration, corruption fallback, concurrent-write lock.

**Integration** (with `hass` fixture):
- Config flow + options flow: setup, reconfigure, validation.
- Add block via service: entity disabled, shadow sensor created, state persisted.
- Remove block: entity re-enabled, shadow sensor removed, state persisted.
- Scan cycle happy path (`freeze_time`, stub update entity).
- Scan cycle timeout: stub entity never emits `latest_version` → `timeout` status, re-disabled at deadline.
- Scan cycle `entity_gone`: entity deleted between cycles.
- Window truncation: more blocks than fit in window.
- Re-pair detection: remove + re-add with same unique_id / fingerprint.
- Manual re-enable by user → `user_overridden`, no forced re-disable.
- HA restart mid-scan: startup cleanup re-disables.
- Integration uninstall: all entities re-enabled, storage deleted.
- DST transitions: spring-forward and fall-back.

**API**: each aiohttp view tested authenticated and unauthenticated; malformed payloads return 400.

### 9.3 Frontend tests

- Vitest unit tests for `api-client.ts` (mocked fetch).
- Lit component tests for blocks list rendering, add-block dialog validation, rediscovery action dispatch.
- No E2E / visual regression in v1.

### 9.4 Manual test plan (`docs/manual-test-plan.md`)

Release gate checklist for things hard to automate credibly:

- HACS custom-repo install on real HA. Panel appears in sidebar.
- Block real WLED device. Verify shadow sensor reflects known latest after scan window. No notification badge outside scan window.
- Unblock → HA's normal update flow returns.
- Uninstall via HA UI → no orphan disabled entities.

### 9.5 CI

GitHub Actions workflows:
- `validate.yml`: `hassfest` + `hacs/action` (both required for HACS default store).
- `test.yml`: pytest + vitest + lint (ruff, eslint, prettier).
- `release.yml`: tag push → build frontend → attach zip to GitHub release.

## 10. Project Structure

```
hacs-permanent-disable-dev-update/
├── .github/
│   ├── workflows/ (validate.yml, test.yml, release.yml)
│   └── ISSUE_TEMPLATE/ (bug_report.yml, feature_request.yml)
├── custom_components/update_blocklist/
│   ├── __init__.py
│   ├── manifest.json
│   ├── config_flow.py
│   ├── const.py
│   ├── store.py
│   ├── registry.py
│   ├── identity.py
│   ├── scanner.py
│   ├── coordinator.py
│   ├── sensor.py
│   ├── binary_sensor.py
│   ├── button.py
│   ├── services.py
│   ├── services.yaml
│   ├── panel.py
│   ├── api.py
│   ├── strings.json
│   ├── icons.json
│   ├── translations/ (en.json, de.json)
│   └── www/ (panel.js built here, shipped in release zip)
├── frontend/
│   ├── src/ (panel + views + api-client)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── tests/
│   ├── conftest.py
│   └── test_*.py
├── docs/
│   ├── superpowers/specs/2026-04-16-update-blocklist-design.md
│   └── manual-test-plan.md
├── brands/ (placeholder PNGs until real branding supplied)
│   ├── icon.png
│   └── logo.png
├── hacs.json
├── info.md
├── README.md
├── LICENSE (MIT — to confirm at release)
├── CHANGELOG.md
├── pyproject.toml
└── .gitignore
```

### 10.1 `manifest.json`

```json
{
  "domain": "update_blocklist",
  "name": "Update Blocklist",
  "version": "0.1.0",
  "documentation": "https://github.com/<owner>/hacs-permanent-disable-dev-update",
  "issue_tracker": "https://github.com/<owner>/hacs-permanent-disable-dev-update/issues",
  "codeowners": ["@<github-username>"],
  "config_flow": true,
  "integration_type": "service",
  "iot_class": "calculated",
  "dependencies": ["frontend", "http"],
  "requirements": []
}
```

`<owner>` and `<github-username>` substituted when the upstream repo is created.

### 10.2 `hacs.json`

```json
{
  "name": "Update Blocklist",
  "render_readme": true,
  "homeassistant": "2024.12.0",
  "zip_release": true,
  "filename": "update_blocklist.zip"
}
```

`zip_release: true` lets the release workflow ship a pre-built zip that already contains `panel.js`, so end users don't need Node.

### 10.3 Branding

Placeholder PNGs (256×256, plain colored squares labelled "Update Blocklist") committed to `brands/` and also wired into the release zip. Real assets replace these after local testing. Submission to the `home-assistant/brands` repo for domain `update_blocklist` is a release-gate item, not a code-level task.

## 11. HACS Default Store Submission Checklist

Tracked as release blockers for v0.1.0:

- [ ] Public GitHub repo, description set, issues enabled, topics (`home-assistant`, `hacs`, `hacs-integration`, `update`).
- [ ] `manifest.json` with all required fields populated with real values.
- [ ] `hacs.json` with at minimum `name`.
- [ ] At least one full GitHub release (not just a tag).
- [ ] `hassfest` action passing.
- [ ] `hacs/action` passing.
- [ ] Brand: PR to `home-assistant/brands` for domain `update_blocklist` with `icon.png` + `logo.png`.
- [ ] README with install, setup, panel screenshots, services reference, limitations.
- [ ] LICENSE present.
- [ ] Single integration per repo (this holds — we ship only `update_blocklist`).
- [ ] Repo not archived.
- [ ] Alphabetical entry submitted to `hacs/default`'s `./integration` file.

## 12. Open Items / Deferred

- LICENSE choice (proposing MIT) — confirmed at release time.
- Real branding assets (user to supply after local testing).
- Per-integration out-of-band version fetchers (v2 candidate).
- Pattern-based auto-block rules (v2 candidate).
- Multi-user audit log (v2 candidate, if demand appears).

## 13. Success Criteria

- Block a device → no update notification appears, install attempts fail.
- Nightly scan refreshes the shadow sensor's `last_known_version` without producing user-visible notifications outside the configured window.
- Uninstalling the integration cleanly returns all affected entities to their prior state.
- Integration passes `hassfest` + `hacs/action` validation and is accepted into the HACS default store.
