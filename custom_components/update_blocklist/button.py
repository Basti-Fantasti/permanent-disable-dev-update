"""Button platform — scan-all and per-block scan-now."""
from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo, EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import UpdateBlocklistCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    runtime = hass.data[DOMAIN][entry.entry_id]
    coordinator: UpdateBlocklistCoordinator = runtime["coordinator"]
    async_add_entities([ScanAllButton(coordinator, entry.entry_id)])
    known_ids: set[str] = set()

    @callback
    def _sync() -> None:
        current_ids = {b["id"] for b in coordinator.data.get("blocks", [])}
        new_ids = current_ids - known_ids
        if new_ids:
            async_add_entities(
                [ScanNowButton(coordinator, entry.entry_id, bid) for bid in new_ids]
            )
            known_ids.update(new_ids)

    _sync()
    entry.async_on_unload(coordinator.async_add_listener(_sync))


def _integration_device(entry_id: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, entry_id)},
        name="Update Blocklist",
        manufacturer="update_blocklist",
        entry_type="service",
    )


class ScanAllButton(CoordinatorEntity[UpdateBlocklistCoordinator], ButtonEntity):
    _attr_has_entity_name = True
    _attr_icon = "mdi:magnify-scan"

    def __init__(self, coordinator, entry_id: str):
        super().__init__(coordinator)
        self._entry_id = entry_id
        self._attr_unique_id = f"{entry_id}_scan_all"
        self._attr_device_info = _integration_device(entry_id)

    @property
    def name(self) -> str:
        return "Scan all"

    async def async_press(self) -> None:
        pass  # scan_all service registered in Task 25


class ScanNowButton(CoordinatorEntity[UpdateBlocklistCoordinator], ButtonEntity):
    _attr_has_entity_name = True
    _attr_icon = "mdi:magnify-scan"
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator, entry_id: str, block_id: str):
        super().__init__(coordinator)
        self._entry_id = entry_id
        self._block_id = block_id
        self._attr_unique_id = f"{entry_id}_{block_id}_scan_now"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{entry_id}:{block_id}")}
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
        return "Scan now"

    async def async_press(self) -> None:
        pass  # scan_now service registered in Task 25
