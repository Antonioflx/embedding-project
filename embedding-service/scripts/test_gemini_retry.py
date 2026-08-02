import asyncio
import sys
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from google.genai import errors  # noqa: E402

from src.modules.generation import client  # noqa: E402


async def test_recovers_after_transient_503() -> None:
    call_count = 0

    async def flaky(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise errors.ServerError(503, {"error": {"message": "simulated high demand"}})
        return type("Response", (), {"text": "ok after retry"})()

    with patch.object(
        client._client.aio.models, "generate_content", side_effect=flaky
    ):
        answer = await client.generate("test prompt")

    assert call_count == 3, f"expected 3 attempts, got {call_count}"
    assert answer == "ok after retry"
    print(f"OK: recovered after {call_count} attempts (2 failures + 1 success)")


async def test_recovers_after_transient_429() -> None:
    call_count = 0

    async def rate_limited(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 2:
            raise errors.ClientError(429, {"error": {"message": "simulated quota exceeded"}})
        return type("Response", (), {"text": "ok after quota retry"})()

    with patch.object(
        client._client.aio.models, "generate_content", side_effect=rate_limited
    ):
        answer = await client.generate("test prompt")

    assert call_count == 2, f"expected 2 attempts, got {call_count}"
    assert answer == "ok after quota retry"
    print(f"OK: recovered after {call_count} attempts (1 x 429 + 1 success)")


async def test_does_not_retry_client_error() -> None:
    call_count = 0

    async def broken_key(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        raise errors.ClientError(401, {"error": {"message": "simulated invalid API key"}})

    with patch.object(
        client._client.aio.models, "generate_content", side_effect=broken_key
    ):
        try:
            await client.generate("test prompt")
            raise AssertionError("expected ClientError to propagate")
        except errors.ClientError:
            pass

    assert call_count == 1, f"expected exactly 1 attempt (no retry), got {call_count}"
    print(f"OK: client error (401) failed fast after {call_count} attempt, no retry")


async def main() -> None:
    await test_recovers_after_transient_503()
    await test_recovers_after_transient_429()
    await test_does_not_retry_client_error()


asyncio.run(main())
