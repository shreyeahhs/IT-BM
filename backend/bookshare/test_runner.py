import unittest

from django.test.runner import DiscoverRunner


class SymbolTextTestResult(unittest.TextTestResult):
    """Render test statuses with visual symbols in verbose mode."""

    def _write_status(self, test, status):
        normalized = str(status).strip().lower()

        if normalized == "ok":
            status = f"\x1b[92m✔ OK\x1b[0m"
        elif normalized in {"fail", "failed", "failure"}:
            status = f"\x1b[91m✘ FAIL\x1b[0m"
        elif normalized == "error":
            status = f"\x1b[91m✘ ERROR\x1b[0m"

        super()._write_status(test, status)


class SymbolTextTestRunner(unittest.TextTestRunner):
    resultclass = SymbolTextTestResult


class SymbolDiscoverRunner(DiscoverRunner):
    test_runner = SymbolTextTestRunner
