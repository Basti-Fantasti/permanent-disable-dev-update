"""Tests for per-block shadow sensor and diagnostic binary_sensor."""
from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.update_blocklist.const import DOMAIN


async def test_adding_block_creates_shadow_sensor_and_binary_sensor(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    runtime = hass.data[DOMAIN][entry.entry_id]
    await runtime["registry"].async_add_block(
        device_id="dev_wled_1",
        update_entity_ids=["update.wled_custom"],
        unique_ids=["AA:BB"],
        fingerprint={"manufacturer": "espressif", "model": "esp8266", "name": "wled custom"},
        reason="custom",
        last_known_version="0.14.2",
    )
    await runtime["coordinator"].async_request_refresh()
    await hass.async_block_till_done()

    # Entity IDs use the block's internal UUID, not device_id
    # Check by unique_id pattern: {entry_id}_{block.id}_blocked_update_status
    # But entity_id generation depends on HA's entity name slugification.
    # Let's find entities by iterating states that match our domain pattern.
    shadow_states = [
        s for s in hass.states.async_all("sensor")
        if "blocked_update_status" in s.entity_id
    ]
    assert len(shadow_states) == 1
    shadow = shadow_states[0]
    assert shadow.state == "0.14.2"
    assert shadow.attributes["reason"] == "custom"

    binary_states = [
        s for s in hass.states.async_all("binary_sensor")
        if "update_blocked" in s.entity_id
    ]
    assert len(binary_states) == 1
    assert binary_states[0].state == "on"


async def test_scan_all_button_exists(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    state = hass.states.get("button.update_blocklist_scan_all")
    assert state is not None


async def test_per_block_scan_now_button_appears_for_block(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    runtime = hass.data[DOMAIN][entry.entry_id]
    await runtime["registry"].async_add_block(
        device_id="dev_btn_1", update_entity_ids=["update.a"], unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    await runtime["coordinator"].async_request_refresh()
    await hass.async_block_till_done()
    scan_now_states = [
        s for s in hass.states.async_all("button")
        if "scan_now" in s.entity_id
    ]
    assert len(scan_now_states) == 1
