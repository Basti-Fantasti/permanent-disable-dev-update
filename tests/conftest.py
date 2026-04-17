"""Shared fixtures for update_blocklist tests."""
from __future__ import annotations

import asyncio

import pytest


@pytest.fixture(scope="session", autouse=True)
def _warmup_aiohttp_background_thread():
    """Pre-warm aiohttp 3.11+ _run_safe_shutdown_loop thread at session start.

    aiohttp 3.11 lazily creates this thread on first connector use. Without this
    fixture it appears as a new thread in the first hass_client test, causing
    PHCC's verify_cleanup to fail with an unexpected-thread assertion.
    Session scope ensures the thread exists before any test's verify_cleanup
    captures threads_before.
    """
    import aiohttp

    async def _touch():
        conn = aiohttp.TCPConnector()
        await conn.close()

    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(_touch())
    finally:
        loop.close()


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable loading of custom_components during tests."""
    yield
