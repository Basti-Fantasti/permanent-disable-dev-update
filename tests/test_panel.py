"""Tests for panel registration."""
from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from custom_components.update_blocklist.const import DOMAIN, PANEL_URL
from custom_components.update_blocklist.panel import async_register_panel


@pytest.mark.asyncio
async def test_async_register_panel_uses_versioned_module_url(hass):
    """module_url passed to panel_custom must carry ?v=<manifest_version>."""
    fake_integration = SimpleNamespace(version="9.9.9")
    # The bare `hass` fixture from pytest-homeassistant-custom-component does
    # not initialise hass.http, so we replace it wholesale with a mock that
    # exposes async_register_static_paths.
    hass.http = SimpleNamespace(async_register_static_paths=AsyncMock())

    with (
        patch(
            "custom_components.update_blocklist.panel.async_get_integration",
            AsyncMock(return_value=fake_integration),
        ),
        patch(
            "custom_components.update_blocklist.panel.panel_custom.async_register_panel",
            AsyncMock(),
        ) as mock_register,
    ):
        await async_register_panel(hass)

    assert mock_register.await_count == 1
    kwargs = mock_register.await_args.kwargs
    assert kwargs["module_url"] == f"{PANEL_URL}?v=9.9.9"
    assert kwargs["frontend_url_path"] == DOMAIN
