import json
import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional

import requests
from packaging import version

from heimdallr.config.config import GITHUB_REPO_NAME, GITHUB_REPO_OWNER

logger = logging.getLogger(__name__)


class UpdateService:
    """Service for checking application updates from GitHub releases."""

    def __init__(self):
        self.cache_file = Path("update_cache.json")
        self.cache_duration = timedelta(hours=1)  # Cache for 1 hour

    def get_current_version(self) -> str:
        """Read current version from environment variable or VERSION file."""
        # First try environment variable (used in Docker)
        env_version = os.getenv("HEIMDALLR_VERSION")
        if env_version:
            return env_version.strip()

        # Fallback to VERSION file (for local development)
        try:
            version_file = Path(__file__).parent.parent.parent.parent / "VERSION"
            with open(version_file, "r", encoding="utf-8") as f:
                return f.read().strip()
        except Exception as e:
            logger.error(f"Failed to read VERSION file: {e}")
            return "0.0.0"

    def _load_cache(self) -> Optional[Dict[str, Any]]:
        """Load cached release data if valid."""
        if not self.cache_file.exists():
            return None

        try:
            with open(self.cache_file, "r", encoding="utf-8") as f:
                cache_data = json.load(f)

            # Check if cache is still valid
            cached_time = datetime.fromisoformat(cache_data.get("cached_at", ""))
            if datetime.now() - cached_time < self.cache_duration:
                return cache_data.get("release_data")
        except Exception as e:
            logger.error(f"Failed to load cache: {e}")

        return None

    def _save_cache(self, release_data: Dict[str, Any]) -> None:
        """Save release data to cache."""
        try:
            cache_data = {"cached_at": datetime.now().isoformat(), "release_data": release_data}
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(cache_data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")

    def _fetch_latest_release(self) -> Optional[Dict[str, Any]]:
        """Fetch latest release from GitHub API."""
        try:
            url = f"https://api.github.com/repos/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}/releases/latest"
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            release_data = response.json()
            self._save_cache(release_data)
            return release_data

        except requests.RequestException as e:
            logger.error(f"Failed to fetch latest release: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching release: {e}")
            return None

    def get_latest_release(self) -> Optional[Dict[str, Any]]:
        """Get latest release data, using cache if available."""
        # Try cache first
        cached_data = self._load_cache()
        if cached_data:
            logger.debug("Using cached release data")
            return cached_data

        # Fetch from API if cache miss
        logger.debug("Fetching latest release from GitHub API")
        return self._fetch_latest_release()

    def _normalize_version(self, version_str: str) -> str:
        """Normalize version string by removing 'v' prefix."""
        return version_str.lstrip("v")

    def _compare_versions(self, current: str, latest: str) -> bool:
        """Compare version strings. Returns True if latest is newer."""
        try:
            current_version = version.parse(self._normalize_version(current))
            latest_version = version.parse(self._normalize_version(latest))
            return latest_version > current_version
        except Exception as e:
            logger.error(f"Failed to compare versions {current} vs {latest}: {e}")
            return False

    def check_for_updates(self) -> Dict[str, Any]:
        """Check for updates and return version information."""
        current = self.get_current_version()

        # Get latest release
        release_data = self.get_latest_release()
        if not release_data:
            return {
                "current": current,
                "latest": None,
                "hasUpdate": False,
                "error": "Failed to fetch release information",
            }

        latest = release_data.get("tag_name", "")
        has_update = self._compare_versions(current, latest)

        result = {"current": current, "latest": self._normalize_version(latest), "hasUpdate": has_update}

        # Include release details if there's an update
        if has_update:
            result["release"] = {
                "tag_name": release_data.get("tag_name", ""),
                "name": release_data.get("name", ""),
                "body": release_data.get("body", ""),
                "html_url": release_data.get("html_url", ""),
                "published_at": release_data.get("published_at", ""),
            }

        return result
