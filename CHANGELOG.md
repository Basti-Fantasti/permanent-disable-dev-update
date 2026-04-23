# Changelog

## [1.1.0] - 2026-04-23

### Added
- Each block in the panel's blocks table now shows the owning integration's brand icon at the start of the row, with a generic device icon as fallback when the integration cannot be determined.
- New "Pinned version" column shows the firmware version currently installed on the blocked device, alongside the existing "Last known version" column.

### Changed
- Long block reasons now wrap onto multiple lines so the rest of the row stays aligned.
- Block detail dialog renames "Current version" to "Pinned version" for consistency with the new column.

## [1.0.3] - 2026-04-23

### Fixed
- Browser no longer serves a cached copy of `panel.js` after an integration update. The panel's `module_url` now carries a `?v=<version>` suffix derived from the manifest, so each release ships a distinct URL.
- Open panel tabs that were loaded before an update now show a reload banner when the loaded frontend version does not match the backend version, so users are no longer stuck interacting with a stale UI.

## [1.0.2] - 2026-04-19

### Fixed
- Add-block and block-detail dialogs now fit mobile viewports. They no longer force a 400px minimum width, and scroll their content when the viewport is shorter than the dialog.
- Block detail view now shows the currently installed firmware version alongside the latest version seen, so it is clear which version the device is pinned to.

### Added
- Integration version is displayed next to the panel title, so it is easy to confirm which release is running after an update.

### Changed
- Block detail rows now use a fixed label column with proper spacing, so long values (like "Latest version seen") stay visually separated from the label.
- Verified that the panel is comfortably readable on both desktop and mobile viewports.

## [1.0.1] - 2026-04-18

### Fixed
- Brand images (`brand/icon.png` and variants) are now included in the release zip, required for HACS validation
- Release workflow now excludes `__pycache__` from the zip

### Changed
- README: added badges, screenshots, and a Contributing section

## [1.0.0] - 2026-04-17

### Added
- Persistent block list stored in HA `.storage`. Survives restarts, reloads, and re-pairs
- Sidebar panel to manage blocks: add, remove, scan individual devices
- Nightly scan window: briefly re-enables blocked entities to refresh latest-version info, then re-disables
- Shadow sensor per block exposing `last_known_version` and `last_scan_at`
- Binary sensor per block for scan-fault detection
- Rescan button entity per block
- Re-pair detection: orphaned blocks are matched to newly discovered devices by unique ID or fingerprint
- Rediscovery prompt in the panel for user-assisted re-mapping of orphaned blocks
- Services: `block`, `unblock`, `scan_now`, `scan_all`
- Config flow with options for scan start time, max duration, and per-device timeout
- English and German translations
- HACS support via `zip_release` with pre-built frontend bundle
