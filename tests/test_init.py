"""Integration setup / unload tests."""
from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.update_blocklist.const import DOMAIN


async def test_setup_and_unload_entry(hass):
    """A freshly added config entry sets up and unloads cleanly."""
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(entry.entry_id) is True
    await hass.async_block_till_done()

    assert entry.entry_id in hass.data[DOMAIN]

    assert await hass.config_entries.async_unload(entry.entry_id) is True
    await hass.async_block_till_done()

    assert entry.entry_id not in hass.data[DOMAIN]


async def test_setup_creates_registry_in_hass_data(hass):
    from custom_components.update_blocklist.registry import BlockRegistry

    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    runtime = hass.data[DOMAIN][entry.entry_id]
    assert isinstance(runtime["registry"], BlockRegistry)


async def test_removing_config_entry_reenables_all_entities(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    runtime = hass.data[DOMAIN][entry.entry_id]
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "u_all")}
    )
    update = ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="u", device_id=device.id
    )

    await runtime["scanner"].async_block_device(device_id=device.id, reason="")
    assert ent_reg.async_get(update.entity_id).disabled_by == er.RegistryEntryDisabler.INTEGRATION

    assert await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    assert ent_reg.async_get(update.entity_id).disabled_by is None


async def test_setup_stores_effective_options(hass):
    from custom_components.update_blocklist.const import (
        CONF_SCAN_START_TIME,
        CONF_SCAN_MAX_DURATION_MINUTES,
        CONF_PER_DEVICE_TIMEOUT_SECONDS,
    )

    entry = MockConfigEntry(
        domain=DOMAIN, data={},
        options={
            CONF_SCAN_START_TIME: "03:15",
            CONF_SCAN_MAX_DURATION_MINUTES: 20,
            CONF_PER_DEVICE_TIMEOUT_SECONDS: 120,
        },
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    runtime = hass.data[DOMAIN][entry.entry_id]
    opts = runtime["options"]
    assert opts[CONF_SCAN_START_TIME] == "03:15"
    assert opts[CONF_SCAN_MAX_DURATION_MINUTES] == 20
    assert opts[CONF_PER_DEVICE_TIMEOUT_SECONDS] == 120
