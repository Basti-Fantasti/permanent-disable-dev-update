"""Update Blocklist integration."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN, PLATFORMS
from .coordinator import UpdateBlocklistCoordinator
from .registry import BlockRegistry

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up update_blocklist from a config entry."""
    from .const import (
        CONF_PER_DEVICE_TIMEOUT_SECONDS,
        CONF_SCAN_MAX_DURATION_MINUTES,
        CONF_SCAN_START_TIME,
        DEFAULT_PER_DEVICE_TIMEOUT_SECONDS,
        DEFAULT_SCAN_MAX_DURATION_MINUTES,
        DEFAULT_SCAN_START_TIME,
    )

    hass.data.setdefault(DOMAIN, {})

    registry = BlockRegistry(hass)
    await registry.async_load()

    # Task 41: Startup cleanup — re-disable entities that are part of an active block
    # but have disabled_by=None (e.g., left enabled by an interrupted scan).
    from homeassistant.helpers import entity_registry as er
    _ent_reg = er.async_get(hass)
    for _block in registry.all_blocks():
        if _block.status != "active":
            continue
        for _eid in _block.update_entity_ids:
            _existing = _ent_reg.async_get(_eid)
            if _existing is not None and _existing.disabled_by is None:
                _ent_reg.async_update_entity(
                    _eid, disabled_by=er.RegistryEntryDisabler.INTEGRATION
                )

    options = {
        CONF_SCAN_START_TIME: entry.options.get(CONF_SCAN_START_TIME, DEFAULT_SCAN_START_TIME),
        CONF_SCAN_MAX_DURATION_MINUTES: entry.options.get(
            CONF_SCAN_MAX_DURATION_MINUTES, DEFAULT_SCAN_MAX_DURATION_MINUTES
        ),
        CONF_PER_DEVICE_TIMEOUT_SECONDS: entry.options.get(
            CONF_PER_DEVICE_TIMEOUT_SECONDS, DEFAULT_PER_DEVICE_TIMEOUT_SECONDS
        ),
    }

    coordinator = UpdateBlocklistCoordinator(hass, registry)
    await coordinator.async_refresh()

    from .scanner import Scanner
    scanner = Scanner(hass, registry, coordinator, options)

    hass.data[DOMAIN][entry.entry_id] = {
        "registry": registry,
        "coordinator": coordinator,
        "options": options,
        "scanner": scanner,
    }

    remove_schedule = scanner.start_schedule()
    entry.async_on_unload(remove_schedule)

    entry.async_on_unload(entry.add_update_listener(_async_options_reload))

    # Task 39: Re-pair detection — listen for device registry changes and run on startup.
    from homeassistant.helpers.device_registry import EVENT_DEVICE_REGISTRY_UPDATED

    async def _on_device_registry_update(_event) -> None:
        await scanner.async_detect_rediscovery()

    entry.async_on_unload(
        hass.bus.async_listen(EVENT_DEVICE_REGISTRY_UPDATED, _on_device_registry_update)
    )

    await scanner.async_detect_rediscovery()

    # Task 41b: Listen for user-initiated re-enables of blocked entities.
    from homeassistant.helpers.entity_registry import EVENT_ENTITY_REGISTRY_UPDATED

    from .const import BLOCK_STATUS_USER_OVERRIDDEN

    _ent_reg_listener = er.async_get(hass)

    async def _on_entity_registry_updated(event) -> None:
        if event.data.get("action") != "update":
            return
        changes: dict = event.data.get("changes", {})
        if "disabled_by" not in changes:
            return

        entity_id = event.data.get("entity_id")
        block = registry.find_block_for_entity(entity_id)
        if block is None or block.status != "active":
            return

        ent_entry = _ent_reg_listener.async_get(entity_id)
        if ent_entry is None:
            return

        if ent_entry.disabled_by is None:
            block.status = BLOCK_STATUS_USER_OVERRIDDEN
            await registry.async_update_block(block)
            await coordinator.async_request_refresh()

    entry.async_on_unload(
        hass.bus.async_listen(EVENT_ENTITY_REGISTRY_UPDATED, _on_entity_registry_updated)
    )

    # Register services and views once on first (only) setup.
    if len(hass.data[DOMAIN]) == 1:
        from .api import async_register_views
        from .panel import async_register_panel, async_remove_panel
        from .services import async_register_services, async_unregister_services

        async_register_services(hass)
        async_register_views(hass)
        await async_register_panel(hass)

        @callback
        def _on_remove():
            async_unregister_services(hass)

        entry.async_on_unload(_on_remove)

        async def _remove_panel():
            await async_remove_panel(hass)

        entry.async_on_unload(_remove_panel)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Clean up when the integration is removed from HA."""
    from homeassistant.helpers import entity_registry as er

    # Runtime is already gone at this point; reload registry straight from store.
    from .registry import BlockRegistry

    registry = BlockRegistry(hass)
    await registry.async_load()

    ent_reg = er.async_get(hass)
    for block in registry.all_blocks():
        for eid in block.update_entity_ids:
            existing = ent_reg.async_get(eid)
            if existing and existing.disabled_by == er.RegistryEntryDisabler.INTEGRATION:
                ent_reg.async_update_entity(eid, disabled_by=None)

    # Purge storage file by saving empty data (Store does not expose a delete).
    await registry._store.async_save({"blocks": [], "pending_rediscovery": []})


async def _async_options_reload(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the integration when options change."""
    await hass.config_entries.async_reload(entry.entry_id)
