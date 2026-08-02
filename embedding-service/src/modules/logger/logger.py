import json
import sys
from datetime import UTC, datetime


class Logger:
    def debug(self, message: str) -> None:
        self._write("debug", message)

    def info(self, message: str) -> None:
        self._write("info", message)

    def warn(self, message: str) -> None:
        self._write("warn", message)

    def error(self, message: str) -> None:
        self._write("error", message)

    def _write(self, level: str, message: str) -> None:
        entry = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": level,
            "message": message,
        }
        stream = sys.stderr if level in ("error", "warn") else sys.stdout
        print(json.dumps(entry), file=stream)


logger = Logger()
