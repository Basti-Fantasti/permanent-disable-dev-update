# Update Blocklist

Permanently block firmware updates for specific Home Assistant devices.

Useful when a device's firmware must not change:
- custom Chinese WLED boards that brick on stock firmware
- Zigbee coordinators running patched firmware
- devices with known-broken upgrade paths

Home Assistant's "Skip" button is per-version, not permanent. This integration
provides a persistent block list that survives restarts, re-pairs, and
integration reloads.

## How it works

When a device is blocked, its `update.*` entity is disabled via the entity
registry — no notifications, no install button, no install service call
succeeds. A shadow sensor exposes the last-known `latest_version`, refreshed
during a configurable nightly scan window by briefly re-enabling and
re-disabling the entity.

## Installation

### HACS (custom repo — until accepted to the default store)

1. Open HACS → Integrations → three-dot menu → Custom repositories
2. Add `https://github.com/Basti-Fantasti/hacs-permanent-disable-dev-update`, category `Integration`
3. Install "Update Blocklist" → Restart Home Assistant
4. Settings → Devices & Services → Add Integration → "Update Blocklist"

### Manual

1. Copy `custom_components/update_blocklist/` into your HA config's `custom_components/` directory
2. Restart Home Assistant
3. Add the integration via Settings → Devices & Services

## First-time setup

Click Add Integration → Update Blocklist. No inputs needed — defaults apply.
Open the "Update Blocklist" entry in the HA sidebar to manage blocks.

## Scan window

Defaults: scan starts at `01:00`, runs for up to 30 minutes, per-device timeout
300 seconds. During the window, blocked entities are briefly re-enabled so HA
can refresh the latest-version information, then re-disabled.

Edit these in Settings → Devices & Services → Update Blocklist → Configure.

## Services

| Service | Description |
|---|---|
| `update_blocklist.block` | Block a device. Fields: `device_id`, `reason` (optional). |
| `update_blocklist.unblock` | Remove a block by `block_id`. |
| `update_blocklist.scan_now` | Refresh a single block's shadow version. Field: `block_id`. |
| `update_blocklist.scan_all` | Run a full scan cycle across all blocks. |

## Entities

**Per block:**
- `sensor.<device>_blocked_update_status` — last known latest version
- `binary_sensor.<device>_update_blocked` — on while block is active (diagnostic)
- `button.<device>_scan_now` — one-shot rescan

**Integration-level:**
- `sensor.update_blocklist_blocked_count`
- `sensor.update_blocklist_last_scan_run`
- `sensor.update_blocklist_next_scan_at`
- `button.update_blocklist_scan_all`

## Limitations

- During the scan window, a brief update notification may appear for a device
  if a new version was detected between re-enable and re-disable.
- If you re-pair a blocked device, the integration will detect it by unique_id
  or fingerprint and prompt you to re-apply the block.
- Only device firmware updates are blockable. HACS / HA Core / HA OS / add-on
  updates are out of scope.

## Development

Backend tests:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements_test.txt
pytest
```

Frontend:

```bash
cd frontend
npm install
npm run build
npm test
```

## Translations

English and German ship with the integration. To contribute a new language,
copy `custom_components/update_blocklist/translations/en.json` to
`translations/<code>.json` and translate the strings. Open a pull request.

## License

MIT. See `LICENSE`.
