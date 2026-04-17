"""Coordinator — exposes registry snapshots to entities and the panel."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN
from .registry import BlockRegistry

_LOGGER = logging.getLogger(__name__)


class UpdateBlocklistCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Publishes the current registry snapshot to entities and the panel."""

    def __init__(self, hass: HomeAssistant, registry: BlockRegistry) -> None:
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=None)
        self._registry = registry

    async def _async_update_data(self) -> dict[str, Any]:
        return {
            "blocks": [b.to_dict() for b in self._registry.all_blocks()],
            "pending_rediscovery": list(self._registry.pending_rediscovery),
        }
