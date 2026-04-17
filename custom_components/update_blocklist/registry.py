"""Block registry — in-memory view backed by BlocksStore."""
from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant

from .const import (
    BLOCK_STATUS_ACTIVE,
    SCAN_STATUS_NEVER_SCANNED,
)
from .identity import Fingerprint
from .store import BlocksStore, StoredData


@dataclass
class Block:
    id: str
    device_id: str
    update_entity_ids: list[str]
    unique_ids: list[str]
    fingerprint: Fingerprint
    reason: str
    created_at: str
    last_known_version: str | None
    last_scan_at: str | None
    last_scan_status: str
    status: str = BLOCK_STATUS_ACTIVE

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Block:
        return cls(
            id=data["id"],
            device_id=data["device_id"],
            update_entity_ids=list(data.get("update_entity_ids", [])),
            unique_ids=list(data.get("unique_ids", [])),
            fingerprint=data.get("fingerprint", {"manufacturer": "", "model": "", "name": ""}),
            reason=data.get("reason", ""),
            created_at=data["created_at"],
            last_known_version=data.get("last_known_version"),
            last_scan_at=data.get("last_scan_at"),
            last_scan_status=data.get("last_scan_status", SCAN_STATUS_NEVER_SCANNED),
            status=data.get("status", BLOCK_STATUS_ACTIVE),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class BlockRegistry:
    """In-memory registry of blocks with persistence to BlocksStore."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store = BlocksStore(hass)
        self._blocks: dict[str, Block] = {}
        self._pending_rediscovery: list[dict[str, Any]] = []
        self._loaded = False

    async def async_load(self) -> None:
        data = await self._store.async_load()
        self._blocks = {b["id"]: Block.from_dict(b) for b in data["blocks"]}
        self._pending_rediscovery = list(data["pending_rediscovery"])
        self._loaded = True

    async def _persist(self) -> None:
        data: StoredData = {
            "blocks": [b.to_dict() for b in self._blocks.values()],
            "pending_rediscovery": list(self._pending_rediscovery),
        }
        await self._store.async_save(data)

    async def async_add_block(
        self,
        *,
        device_id: str,
        update_entity_ids: list[str],
        unique_ids: list[str],
        fingerprint: Fingerprint,
        reason: str,
        last_known_version: str | None,
    ) -> Block:
        if any(b.device_id == device_id for b in self._blocks.values()):
            raise ValueError(f"Device {device_id!r} is already blocked")

        block = Block(
            id=uuid.uuid4().hex,
            device_id=device_id,
            update_entity_ids=list(update_entity_ids),
            unique_ids=list(unique_ids),
            fingerprint=fingerprint,
            reason=reason,
            created_at=datetime.now(UTC).isoformat(),
            last_known_version=last_known_version,
            last_scan_at=None,
            last_scan_status=SCAN_STATUS_NEVER_SCANNED,
            status=BLOCK_STATUS_ACTIVE,
        )
        self._blocks[block.id] = block
        await self._persist()
        return block

    async def async_remove_block(self, block_id: str) -> Block | None:
        block = self._blocks.pop(block_id, None)
        if block is not None:
            await self._persist()
        return block

    async def async_update_block(self, block: Block) -> None:
        self._blocks[block.id] = block
        await self._persist()

    def get_block(self, block_id: str) -> Block | None:
        return self._blocks.get(block_id)

    def find_block_for_device(self, device_id: str) -> Block | None:
        return next(
            (b for b in self._blocks.values() if b.device_id == device_id), None
        )

    def find_block_for_entity(self, entity_id: str) -> Block | None:
        return next(
            (b for b in self._blocks.values() if entity_id in b.update_entity_ids),
            None,
        )

    def all_blocks(self) -> list[Block]:
        return list(self._blocks.values())

    @property
    def pending_rediscovery(self) -> list[dict[str, Any]]:
        return list(self._pending_rediscovery)

    async def async_set_pending_rediscovery(self, items: list[dict[str, Any]]) -> None:
        self._pending_rediscovery = list(items)
        await self._persist()

    def find_orphans(self, device_registry) -> list[Block]:
        """Return blocks whose device_id no longer resolves to a real device."""
        orphans: list[Block] = []
        for block in self._blocks.values():
            if device_registry.async_get(block.device_id) is None:
                orphans.append(block)
        return orphans

    def match_rediscovery_candidates(
        self, block: Block, device_registry, entity_registry
    ) -> list[dict[str, str]]:
        """Find devices that plausibly represent a re-paired version of `block`."""
        from .const import MATCH_FINGERPRINT, MATCH_UNIQUE_ID
        from .identity import fingerprint_matches, generate_fingerprint

        results: list[dict[str, str]] = []
        seen: set[str] = set()

        if block.unique_ids:
            for entry in entity_registry.entities.values():
                if entry.domain != "update":
                    continue
                if (
                    entry.unique_id in block.unique_ids
                    and entry.device_id
                    and entry.device_id not in seen
                ):
                    results.append(
                        {"device_id": entry.device_id, "match_type": MATCH_UNIQUE_ID}
                    )
                    seen.add(entry.device_id)

        for dev in device_registry.devices.values():
            if dev.id in seen:
                continue
            fp = generate_fingerprint(
                manufacturer=dev.manufacturer,
                model=dev.model,
                name=dev.name or dev.name_by_user,
            )
            if fingerprint_matches(block.fingerprint, fp):
                results.append({"device_id": dev.id, "match_type": MATCH_FINGERPRINT})
                seen.add(dev.id)

        return results
