"""Tests for the scanner."""
from __future__ import annotations

import asyncio

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.update_blocklist.const import DOMAIN


async def _setup_integration(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_block_device_disables_update_entity(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup_integration(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    scanner = runtime["scanner"]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "wled")},
        manufacturer="Espressif", model="ESP8266", name="WLED Custom",
    )
    update_entity = ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="AA:BB",
        device_id=device.id,
    )

    await scanner.async_block_device(device_id=device.id, reason="custom")
    await hass.async_block_till_done()

    updated = ent_reg.async_get(update_entity.entity_id)
    assert updated.disabled_by == er.RegistryEntryDisabler.INTEGRATION


async def test_block_device_raises_if_no_update_entity(hass):
    import pytest
    from homeassistant.helpers import device_registry as dr

    entry = await _setup_integration(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    scanner = runtime["scanner"]

    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "no_update")}
    )

    with pytest.raises(ValueError, match="no update entity"):
        await scanner.async_block_device(device_id=device.id, reason="x")


async def test_unblock_reenables_update_entity_and_removes_block(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup_integration(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    scanner = runtime["scanner"]
    registry = runtime["registry"]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "w2")}
    )
    update = ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="u1", device_id=device.id
    )

    block = await scanner.async_block_device(device_id=device.id, reason="")
    await hass.async_block_till_done()

    await scanner.async_unblock(block_id=block.id)
    await hass.async_block_till_done()

    assert registry.get_block(block.id) is None
    assert ent_reg.async_get(update.entity_id).disabled_by is None


async def test_scan_block_captures_latest_version(hass):
    """A scan cycle re-enables, waits for latest_version, captures it, re-disables."""
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup_integration(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    scanner = runtime["scanner"]
    registry = runtime["registry"]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "scan1")}
    )
    update = ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="u", device_id=device.id
    )

    block = await scanner.async_block_device(device_id=device.id, reason="")
    await hass.async_block_till_done()

    # Simulate integration populating latest_version shortly after re-enable.
    async def _populate():
        # Wait for the scanner to re-enable the entity, then set state.
        for _ in range(50):
            if ent_reg.async_get(update.entity_id).disabled_by is None:
                hass.states.async_set(
                    update.entity_id, "on",
                    {"installed_version": "1.0.0", "latest_version": "1.2.3"},
                )
                return
            await asyncio.sleep(0.01)

    task = asyncio.create_task(_populate())
    await scanner.async_scan_block(block_id=block.id, per_device_timeout_seconds=5)
    await task

    updated = registry.get_block(block.id)
    assert updated.last_known_version == "1.2.3"
    assert updated.last_scan_status == "ok"
    assert ent_reg.async_get(update.entity_id).disabled_by == er.RegistryEntryDisabler.INTEGRATION


async def test_scan_block_timeout_records_timeout_status(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup_integration(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    scanner = runtime["scanner"]
    registry = runtime["registry"]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "scan2")}
    )
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="u2", device_id=device.id
    )

    block = await scanner.async_block_device(device_id=device.id, reason="")
    await hass.async_block_till_done()

    await scanner.async_scan_block(block_id=block.id, per_device_timeout_seconds=1)

    updated = registry.get_block(block.id)
    assert updated.last_scan_status == "timeout"


async def test_scan_block_entity_gone(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup_integration(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    scanner = runtime["scanner"]
    registry = runtime["registry"]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "scan3")}
    )
    update = ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="u3", device_id=device.id
    )

    block = await scanner.async_block_device(device_id=device.id, reason="")
    await hass.async_block_till_done()

    # Remove entity before scan.
    ent_reg.async_remove(update.entity_id)

    await scanner.async_scan_block(block_id=block.id, per_device_timeout_seconds=1)

    updated = registry.get_block(block.id)
    assert updated.last_scan_status == "entity_gone"
