#!/usr/bin/env bash
set -euo pipefail
echo "Dieser veraltete Deployment-Weg ist nach der Live/Staging-Trennung gesperrt." >&2
echo "Nutze tools/deploy-release.mjs mit expliziter Umgebung und Projekt-ID." >&2
exit 1
