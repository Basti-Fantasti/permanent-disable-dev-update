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


import json


async def test_save_writes_backup_of_previous_file(hass, hass_storage):
    store = BlocksStore(hass)
    await store.async_save({"blocks": [{"id": "v1"}], "pending_rediscovery": []})
    await store.async_save({"blocks": [{"id": "v2"}], "pending_rediscovery": []})

    from custom_components.update_blocklist.const import STORAGE_KEY
    assert f"{STORAGE_KEY}.backup" in hass_storage
    assert hass_storage[f"{STORAGE_KEY}.backup"]["data"]["blocks"][0]["id"] == "v1"


async def test_load_falls_back_to_backup_when_main_is_corrupt(hass, hass_storage):
    from custom_components.update_blocklist.const import STORAGE_KEY

    hass_storage[STORAGE_KEY] = {"version": 1, "key": STORAGE_KEY, "data": "NOT A DICT"}
    hass_storage[f"{STORAGE_KEY}.backup"] = {
        "version": 1,
        "key": f"{STORAGE_KEY}.backup",
        "data": {"blocks": [{"id": "from_backup"}], "pending_rediscovery": []},
    }

    store = BlocksStore(hass)
    data = await store.async_load()
    assert data["blocks"][0]["id"] == "from_backup"
