"""Register the sidebar panel."""
from __future__ import annotations

from pathlib import Path

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN, PANEL_ICON, PANEL_TITLE, PANEL_URL


async def async_register_panel(hass: HomeAssistant) -> None:
    """Serve panel.js and register the custom sidebar panel.

    The module_url is suffixed with ?v=<manifest version> so browsers treat
    each release as a distinct resource and bypass any cached copy of an
    earlier panel.js.
    """
    panel_js = Path(__file__).parent / "www" / "panel.js"

    await hass.http.async_register_static_paths(
        [StaticPathConfig(PANEL_URL, str(panel_js), cache_headers=False)]
    )

    integration = await async_get_integration(hass, DOMAIN)
    module_url = f"{PANEL_URL}?v={integration.version}"

    await panel_custom.async_register_panel(
        hass,
        webcomponent_name="update-blocklist-panel",
        frontend_url_path=DOMAIN,
        module_url=module_url,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=True,
    )


async def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel on unload."""
    from homeassistant.components import frontend

    frontend.async_remove_panel(hass, DOMAIN)
