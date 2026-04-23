"""Tests for panel API."""
from __future__ import annotations

from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.update_blocklist.const import DOMAIN


async def _setup(hass):
    entry = MockConfigEntry(domain=DOMAIN, data={}, options={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_list_blocks_returns_empty(hass, hass_client):
    await _setup(hass)
    client = await hass_client()
    resp = await client.get(f"/api/{DOMAIN}/blocks")
    assert resp.status == 200
    data = await resp.json()
    assert data == {"blocks": [], "pending_rediscovery": []}


async def test_list_blocks_includes_added_block(hass, hass_client):
    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    await runtime["registry"].async_add_block(
        device_id="d1", update_entity_ids=["update.a"], unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="r", last_known_version="1.0",
    )
    await runtime["coordinator"].async_request_refresh()

    client = await hass_client()
    resp = await client.get(f"/api/{DOMAIN}/blocks")
    data = await resp.json()
    assert len(data["blocks"]) == 1
    assert data["blocks"][0]["reason"] == "r"


async def test_get_options_returns_current_options(hass, hass_client):
    await _setup(hass)
    client = await hass_client()
    resp = await client.get(f"/api/{DOMAIN}/options")
    assert resp.status == 200
    data = await resp.json()
    assert data["scan_start_time"] == "01:00"


async def test_add_block_endpoint(hass, hass_client):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "add1")}
    )
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="u", device_id=device.id
    )

    client = await hass_client()
    resp = await client.post(
        f"/api/{DOMAIN}/blocks",
        json={"device_id": device.id, "reason": "x"},
    )
    assert resp.status == 201
    body = await resp.json()
    assert body["device_id"] == device.id
    assert len(runtime["registry"].all_blocks()) == 1


async def test_remove_block_endpoint(hass, hass_client):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "rem1")}
    )
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="u", device_id=device.id
    )
    block = await runtime["scanner"].async_block_device(
        device_id=device.id, reason=""
    )

    client = await hass_client()
    resp = await client.delete(f"/api/{DOMAIN}/blocks/{block.id}")
    assert resp.status == 204
    assert runtime["registry"].get_block(block.id) is None


async def test_add_block_returns_400_for_missing_device_id(hass, hass_client):
    await _setup(hass)
    client = await hass_client()
    resp = await client.post(f"/api/{DOMAIN}/blocks", json={"reason": "x"})
    assert resp.status == 400


async def test_candidate_devices_returns_only_unblocked_devices_with_update_entities(
    hass, hass_client
):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]

    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)

    d_with_update = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "wu")},
        manufacturer="Espressif", model="ESP", name="With Update",
    )
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="U1",
        device_id=d_with_update.id,
    )

    d_no_update = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "nu")}
    )

    d_already_blocked = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "ab")}
    )
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="U2",
        device_id=d_already_blocked.id,
    )
    await runtime["scanner"].async_block_device(
        device_id=d_already_blocked.id, reason=""
    )

    client = await hass_client()
    resp = await client.get(f"/api/{DOMAIN}/candidates")
    assert resp.status == 200
    data = await resp.json()
    ids = [c["device_id"] for c in data["candidates"]]
    assert d_with_update.id in ids
    assert d_no_update.id not in ids
    assert d_already_blocked.id not in ids


async def test_scan_endpoint_triggers_scan_all_when_no_block_id(hass, hass_client):
    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    calls: list[str] = []

    async def fake_scan_all(*, max_duration_seconds, per_device_timeout_seconds):
        calls.append("all")

    runtime["scanner"].async_scan_all = fake_scan_all  # type: ignore[method-assign]

    client = await hass_client()
    resp = await client.post(f"/api/{DOMAIN}/scan", json={})
    assert resp.status == 202
    await hass.async_block_till_done()
    assert calls == ["all"]


async def test_scan_endpoint_with_block_id_triggers_scan_block(hass, hass_client):
    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    calls: list[str] = []

    async def fake_scan_block(*, block_id, per_device_timeout_seconds):
        calls.append(block_id)

    runtime["scanner"].async_scan_block = fake_scan_block  # type: ignore[method-assign]

    client = await hass_client()
    resp = await client.post(f"/api/{DOMAIN}/scan", json={"block_id": "abc"})
    assert resp.status == 202
    await hass.async_block_till_done()
    assert calls == ["abc"]


async def test_resolve_rediscovery_accept_updates_block(hass, hass_client):
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    registry = runtime["registry"]

    # Old orphan block.
    block = await registry.async_add_block(
        device_id="gone", update_entity_ids=["update.old"], unique_ids=["M1"],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="", last_known_version=None,
    )
    await registry.async_set_pending_rediscovery(
        [{"orphan_block_id": block.id, "candidate_device_id": "newdev",
          "match_type": "unique_id", "detected_at": "2026-04-16T09:15:00Z"}]
    )

    # New device + update entity exists.
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    new_dev = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("demo", "newdev")}
    )
    ent_reg.async_get_or_create(
        domain="update", platform="demo", unique_id="M1", device_id=new_dev.id
    )

    client = await hass_client()
    resp = await client.post(
        f"/api/{DOMAIN}/rediscovery/resolve",
        json={"orphan_block_id": block.id, "candidate_device_id": new_dev.id, "action": "accept"},
    )
    assert resp.status == 200

    updated = registry.get_block(block.id)
    assert updated.device_id == new_dev.id


async def test_list_blocks_includes_integration_domain_from_update_entity(
    hass, hass_client
):
    """integration_domain is taken from the platform of an update entity."""
    from homeassistant.helpers import device_registry as dr
    from homeassistant.helpers import entity_registry as er

    entry = await _setup(hass)

    # Pretend an `acme` integration owns an update entity attached to device d1.
    acme_entry = MockConfigEntry(domain="acme", data={})
    acme_entry.add_to_hass(hass)

    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=acme_entry.entry_id,
        identifiers={("acme", "dev-1")},
    )

    ent_reg = er.async_get(hass)
    ent_reg.async_get_or_create(
        domain="update",
        platform="acme",
        unique_id="acme-update-1",
        config_entry=acme_entry,
        device_id=device.id,
    )

    runtime = hass.data[DOMAIN][entry.entry_id]
    await runtime["registry"].async_add_block(
        device_id=device.id,
        update_entity_ids=[f"update.acme_update_1"],
        unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="r",
        last_known_version="1.0",
    )
    await runtime["coordinator"].async_request_refresh()

    client = await hass_client()
    resp = await client.get(f"/api/{DOMAIN}/blocks")
    data = await resp.json()
    assert data["blocks"][0]["integration_domain"] == "acme"


async def test_list_blocks_integration_domain_falls_back_to_device_config_entry(
    hass, hass_client
):
    """Falls back to the device's primary config entry domain when no update entity resolves."""
    from homeassistant.helpers import device_registry as dr

    entry = await _setup(hass)

    acme_entry = MockConfigEntry(domain="acme", data={})
    acme_entry.add_to_hass(hass)

    dev_reg = dr.async_get(hass)
    device = dev_reg.async_get_or_create(
        config_entry_id=acme_entry.entry_id,
        identifiers={("acme", "dev-2")},
    )

    runtime = hass.data[DOMAIN][entry.entry_id]
    await runtime["registry"].async_add_block(
        device_id=device.id,
        update_entity_ids=["update.does_not_exist"],
        unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="r",
        last_known_version="1.0",
    )
    await runtime["coordinator"].async_request_refresh()

    client = await hass_client()
    resp = await client.get(f"/api/{DOMAIN}/blocks")
    data = await resp.json()
    assert data["blocks"][0]["integration_domain"] == "acme"


async def test_list_blocks_integration_domain_is_none_when_unresolvable(
    hass, hass_client
):
    """integration_domain is None when device cannot be found."""
    entry = await _setup(hass)
    runtime = hass.data[DOMAIN][entry.entry_id]
    await runtime["registry"].async_add_block(
        device_id="missing-device",
        update_entity_ids=[],
        unique_ids=[],
        fingerprint={"manufacturer": "", "model": "", "name": ""},
        reason="r",
        last_known_version="1.0",
    )
    await runtime["coordinator"].async_request_refresh()

    client = await hass_client()
    resp = await client.get(f"/api/{DOMAIN}/blocks")
    data = await resp.json()
    assert data["blocks"][0]["integration_domain"] is None
