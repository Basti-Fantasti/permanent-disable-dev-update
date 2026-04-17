# Manual Test Plan

Run these checks before each release — they cover scenarios hard to automate credibly.

## Install and first-time setup

- [ ] Add the repo as a HACS custom repository.
- [ ] Install the integration, restart HA.
- [ ] Add integration via Settings → Devices & Services.
- [ ] The "Update Blocklist" panel appears in the HA sidebar.
- [ ] No errors in the HA log at setup.

## Block a real device

- [ ] In the panel, click "Add block", pick a real device that has an `update.*` entity.
- [ ] Confirm the update entity is disabled (visible in entity settings).
- [ ] Confirm notification badges for that device's update are gone.
- [ ] Confirm the shadow sensor appears with `last_known_version`.

## Nightly scan

- [ ] Temporarily set scan start time to 1 minute from now via options flow.
- [ ] Wait for the scan window. Confirm the shadow sensor's `last_known_version`
      is updated (trigger an update becoming available on the real device first,
      or manually set a new `latest_version` via dev tools).
- [ ] After scan, confirm the update entity is re-disabled.

## Unblock

- [ ] Remove the block from the panel.
- [ ] Confirm the update entity is re-enabled.
- [ ] Confirm HA's normal update behavior returns.

## Uninstall

- [ ] Delete the integration via HA UI.
- [ ] Confirm all previously-disabled update entities are re-enabled.
- [ ] Confirm the panel is gone from the sidebar.
- [ ] Confirm no `update_blocklist` entities remain in the entity registry.

## Re-pair detection

- [ ] Block a Zigbee device.
- [ ] Re-pair the device in Zigbee2MQTT / ZHA (creates a new device_id).
- [ ] Confirm the panel shows a rediscovery prompt.
- [ ] Click "Re-apply to this device" and confirm the new entity is disabled.
