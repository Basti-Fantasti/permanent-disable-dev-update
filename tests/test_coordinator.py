"""Tests for the UpdateBlocklistCoordinator."""
from __future__ import annotations
from pytest_homeassistant_custom_component.common import MockConfigEntry
from custom_components.update_blocklist.const import DOMAIN


async def test_coordinator_exposes_registry_snapshot(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    runtime = hass.data[DOMAIN][entry.entry_id]
    coord = runtime["coordinator"]
    snap = coord.data
    assert isinstance(snap, dict)
    assert snap["blocks"] == []
    assert snap["pending_rediscovery"] == []


async def test_coordinator_refreshes_when_registry_changes(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    runtime = hass.data[DOMAIN][entry.entry_id]
    reg = runtime["registry"]
    coord = runtime["coordinator"]
    await reg.async_add_block(
        device_id="d1", update_entity_ids=["update.a"], unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    await coord.async_request_refresh()
    await hass.async_block_till_done()
    assert len(coord.data["blocks"]) == 1
    assert coord.data["blocks"][0]["device_id"] == "d1"
