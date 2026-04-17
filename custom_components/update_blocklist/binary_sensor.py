"""Per-block diagnostic binary_sensor indicating active block status."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo, EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import BLOCK_STATUS_ACTIVE, DOMAIN
from .coordinator import UpdateBlocklistCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    runtime = hass.data[DOMAIN][entry.entry_id]
    coordinator: UpdateBlocklistCoordinator = runtime["coordinator"]
    known_ids: set[str] = set()

    @callback
    def _sync() -> None:
        current_ids = {b["id"] for b in coordinator.data.get("blocks", [])}
        new_ids = current_ids - known_ids
        if new_ids:
            async_add_entities(
                [BlockedBinarySensor(coordinator, entry.entry_id, bid) for bid in new_ids]
            )
            known_ids.update(new_ids)

    _sync()
    entry.async_on_unload(coordinator.async_add_listener(_sync))


class BlockedBinarySensor(
    CoordinatorEntity[UpdateBlocklistCoordinator], BinarySensorEntity
):
    _attr_has_entity_name = True
    _attr_icon = "mdi:lock-outline"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator, entry_id: str, block_id: str):
        super().__init__(coordinator)
        self._block_id = block_id
        self._attr_unique_id = f"{entry_id}_{block_id}_update_blocked"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{entry_id}:{block_id}")},
        )

    def _block(self) -> dict | None:
        for b in self.coordinator.data.get("blocks", []):
            if b["id"] == self._block_id:
                return b
        return None

    @property
    def available(self) -> bool:
        return self._block() is not None

    @property
    def name(self) -> str:
        return "Update blocked"

    @property
    def is_on(self) -> bool:
        b = self._block()
        return bool(b) and b.get("status") == BLOCK_STATUS_ACTIVE
