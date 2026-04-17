"""Tests for re-pair (rediscovery) detection."""
from __future__ import annotations

from datetime import UTC, datetime

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.update_blocklist.const import DOMAIN


async def _setup(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_orphan_block_with_matching_unique_id_produces_pending(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    registry = runtime["registry"]
    scanner = runtime["scanner"]

    # Create orphan block referencing device "gone" and unique_id "U1".
    await registry.async_add_block(
        device_id="gone", update_entity_ids=["update.old"], unique_ids=["U1"],
        fingerprint={"manufacturer": "e", "model": "m", "name": "n"},
        reason="", last_known_version=None,
    )

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    new_dev = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "new")},
    )
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="U1", device_id=new_dev.id
    )

    await scanner.async_detect_rediscovery()

    pending = registry.pending_rediscovery
    assert len(pending) == 1
    assert pending[0]["candidate_device_id"] == new_dev.id
    assert pending[0]["match_type"] == "unique_id"


async def test_orphan_without_matches_stays_empty(hass):
    from homeassistant.helpers import device_registry as dr

    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    registry = runtime["registry"]
    scanner = runtime["scanner"]

    await registry.async_add_block(
        device_id="gone", update_entity_ids=["update.old"], unique_ids=["Nope"],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    await scanner.async_detect_rediscovery()
    assert registry.pending_rediscovery == []
