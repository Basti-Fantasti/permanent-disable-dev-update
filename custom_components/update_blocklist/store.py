"""Persistent storage for the block registry with backup rotation."""
from __future__ import annotations

import asyncio
import logging
from typing import TypedDict

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)
_BACKUP_KEY = f"{STORAGE_KEY}.backup"


class StoredData(TypedDict):
    blocks: list[dict]
    pending_rediscovery: list[dict]


def _empty() -> StoredData:
    return {"blocks": [], "pending_rediscovery": []}


def _is_valid_shape(data: object) -> bool:
    return (
        isinstance(data, dict)
        and isinstance(data.get("blocks"), list)
        and isinstance(data.get("pending_rediscovery"), list)
    )


class BlocksStore:
    """Versioned JSON store with backup-on-write and corruption fallback."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[StoredData] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._backup: Store[StoredData] = Store(hass, STORAGE_VERSION, _BACKUP_KEY)
        self._lock = asyncio.Lock()

    async def async_load(self) -> StoredData:
        raw = await self._store.async_load()
        if _is_valid_shape(raw):
            assert raw is not None
            return {
                "blocks": list(raw.get("blocks", [])),
                "pending_rediscovery": list(raw.get("pending_rediscovery", [])),
            }

        if raw is not None:
            _LOGGER.warning(
                "Main storage shape invalid (%r); attempting backup.", type(raw).__name__
            )

        backup = await self._backup.async_load()
        if _is_valid_shape(backup):
            assert backup is not None
            _LOGGER.warning("Loaded from .backup after corruption of main file.")
            return {
                "blocks": list(backup.get("blocks", [])),
                "pending_rediscovery": list(backup.get("pending_rediscovery", [])),
            }

        return _empty()

    async def async_save(self, data: StoredData) -> None:
        async with self._lock:
            previous = await self._store.async_load()
            if _is_valid_shape(previous):
                await self._backup.async_save(previous)
            await self._store.async_save(data)

    async def async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: dict
    ) -> dict:
        """Schema migration entry point. Currently no migrations."""
        return old_data
