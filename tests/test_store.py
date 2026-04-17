"""Tests for the BlocksStore wrapper."""
from __future__ import annotations

from custom_components.update_blocklist.store import BlocksStore, StoredData


async def test_empty_load_returns_default_shape(hass):
    store = BlocksStore(hass)
    data = await store.async_load()
    assert data == StoredData(blocks=[], pending_rediscovery=[])


async def test_save_then_load_roundtrip(hass):
    store = BlocksStore(hass)
    data = StoredData(
        blocks=[{"id": "b1", "device_id": "d1", "reason": "test"}],
        pending_rediscovery=[],
    )
    await store.async_save(data)

    fresh = BlocksStore(hass)
    reloaded = await fresh.async_load()
    assert reloaded["blocks"][0]["id"] == "b1"
    assert reloaded["blocks"][0]["reason"] == "test"
