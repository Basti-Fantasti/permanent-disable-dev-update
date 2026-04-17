"""Persistent storage for the block registry."""
from __future__ import annotations

import asyncio
from typing import TypedDict

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION


class StoredData(TypedDict):
    blocks: list[dict]
    pending_rediscovery: list[dict]


def _empty() -> StoredData:
    return {"blocks": [], "pending_rediscovery": []}


class BlocksStore:
    """Versioned JSON store with a write lock."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[StoredData] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._lock = asyncio.Lock()

    async def async_load(self) -> StoredData:
        data = await self._store.async_load()
        if data is None:
            return _empty()
        return {
            "blocks": list(data.get("blocks", [])),
            "pending_rediscovery": list(data.get("pending_rediscovery", [])),
        }

    async def async_save(self, data: StoredData) -> None:
        async with self._lock:
            await self._store.async_save(data)

    async def async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: dict
    ) -> dict:
        """Schema migration entry point. Currently no migrations."""
        return old_data
