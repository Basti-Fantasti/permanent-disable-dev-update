"""Tests for the block registry."""
from __future__ import annotations

import pytest

from custom_components.update_blocklist.registry import Block, BlockRegistry


def _make_registry(hass):
    return BlockRegistry(hass)


async def test_add_block_returns_block_with_generated_id(hass):
    reg = _make_registry(hass)
    await reg.async_load()
    block = await reg.async_add_block(
        device_id="dev1",
        update_entity_ids=["update.wled"],
        unique_ids=["aa:bb"],
        fingerprint={"manufacturer": "e", "model": "m", "name": "n"},
        reason="custom firmware",
        last_known_version="1.0.0",
    )
    assert isinstance(block, Block)
    assert block.id
    assert block.device_id == "dev1"
    assert block.reason == "custom firmware"
    assert block.status == "active"


async def test_add_block_persists_across_instances(hass):
    reg = _make_registry(hass)
    await reg.async_load()
    added = await reg.async_add_block(
        device_id="dev1",
        update_entity_ids=["update.wled"],
        unique_ids=["aa:bb"],
        fingerprint={"manufacturer": "e", "model": "m", "name": "n"},
        reason="x",
        last_known_version=None,
    )
    reg2 = _make_registry(hass)
    await reg2.async_load()
    assert reg2.get_block(added.id) is not None


async def test_remove_block(hass):
    reg = _make_registry(hass)
    await reg.async_load()
    block = await reg.async_add_block(
        device_id="d", update_entity_ids=["update.a"], unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    await reg.async_remove_block(block.id)
    assert reg.get_block(block.id) is None


async def test_all_blocks_returns_list(hass):
    reg = _make_registry(hass)
    await reg.async_load()
    for i in range(3):
        await reg.async_add_block(
            device_id=f"d{i}", update_entity_ids=[f"update.a{i}"], unique_ids=[],
            fingerprint={"manufacturer": "", "model": "", "name": ""},
            reason="", last_known_version=None,
        )
    assert len(reg.all_blocks()) == 3


async def test_find_block_for_device(hass):
    reg = _make_registry(hass)
    await reg.async_load()
    added = await reg.async_add_block(
        device_id="dev-xyz", update_entity_ids=["update.a"], unique_ids=["u1"],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    assert reg.find_block_for_device("dev-xyz") is added
    assert reg.find_block_for_device("other") is None


async def test_add_block_rejects_duplicate_device_id(hass):
    reg = _make_registry(hass)
    await reg.async_load()
    await reg.async_add_block(
        device_id="dev1", update_entity_ids=["update.a"], unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    with pytest.raises(ValueError, match="already blocked"):
        await reg.async_add_block(
            device_id="dev1", update_entity_ids=["update.a"], unique_ids=[],
            fingerprint={"manufacturer": "", "model": "", "name": ""},
            reason="", last_known_version=None,
        )


async def test_find_orphans_returns_blocks_whose_device_is_missing(hass):
    from homeassistant.helpers import device_registry as dr
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    entry = MockConfigEntry(domain="demo")
    entry.add_to_hass(hass)

    reg = _make_registry(hass)
    await reg.async_load()
    dev_reg = dr.async_get(hass)
    real = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "real")}
    )
    await reg.async_add_block(
        device_id=real.id, update_entity_ids=["update.real"], unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    await reg.async_add_block(
        device_id="nonexistent", update_entity_ids=["update.gone"], unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    orphans = reg.find_orphans(dev_reg)
    assert len(orphans) == 1
    assert orphans[0].device_id == "nonexistent"


async def test_match_rediscovery_by_unique_id(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    entry = MockConfigEntry(domain="demo")
    entry.add_to_hass(hass)

    reg = _make_registry(hass)
    await reg.async_load()
    dev_reg = dr.async_get(hass)
    block = await reg.async_add_block(
        device_id="gone", update_entity_ids=["update.x"], unique_ids=["MAC1"],
        fingerprint={"manufacturer": "e", "model": "m", "name": "n"},
        reason="", last_known_version=None,
    )
    new_dev = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "new")}
    )
    ent_reg = er.async_get(hass)
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="MAC1",
        device_id=new_dev.id,
    )
    candidates = reg.match_rediscovery_candidates(block, dev_reg, ent_reg)
    assert candidates == [{"device_id": new_dev.id, "match_type": "unique_id"}]


async def test_match_rediscovery_by_fingerprint(hass):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    entry = MockConfigEntry(domain="demo")
    entry.add_to_hass(hass)

    reg = _make_registry(hass)
    await reg.async_load()
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    block = await reg.async_add_block(
        device_id="gone", update_entity_ids=["update.x"], unique_ids=["OLD_MAC"],
        fingerprint={"manufacturer": "espressif", "model": "esp8266", "name": "wled strip"},
        reason="", last_known_version=None,
    )
    new_dev = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "new")},
        manufacturer="Espressif", model="ESP8266", name="WLED Strip 2",
    )
    candidates = reg.match_rediscovery_candidates(block, dev_reg, ent_reg)
    assert {"device_id": new_dev.id, "match_type": "fingerprint"} in candidates


def test_block_from_dict_defaults_installed_version_to_none():
    """Blocks persisted before 1.0.2 have no installed_version key; loading must default to None."""
    from custom_components.update_blocklist.registry import Block

    stored = {
        "id": "b1",
        "device_id": "d1",
        "update_entity_ids": ["update.a"],
        "unique_ids": ["u1"],
        "fingerprint": {"manufacturer": "m", "model": "mo", "name": "n"},
        "reason": "r",
        "created_at": "2026-04-19T00:00:00+00:00",
        "last_known_version": "1.0.0",
        "last_scan_at": None,
        "last_scan_status": "never",
        "status": "active",
    }
    block = Block.from_dict(stored)
    assert block.installed_version is None


async def test_async_add_block_persists_installed_version(hass):
    from custom_components.update_blocklist.registry import BlockRegistry

    registry = BlockRegistry(hass)
    await registry.async_load()
    block = await registry.async_add_block(
        device_id="d-new",
        update_entity_ids=["update.x"],
        unique_ids=["u-x"],
        fingerprint={"manufacturer": "m", "model": "mo", "name": "n"},
        reason="",
        last_known_version="2.0.0",
        installed_version="1.9.0",
    )
    assert block.installed_version == "1.9.0"
