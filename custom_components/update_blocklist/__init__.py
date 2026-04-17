"""Update Blocklist integration."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .registry import BlockRegistry

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up update_blocklist from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    registry = BlockRegistry(hass)
    await registry.async_load()

    hass.data[DOMAIN][entry.entry_id] = {"registry": registry}
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True
