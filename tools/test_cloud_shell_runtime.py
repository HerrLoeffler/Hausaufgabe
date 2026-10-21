"""Exercise the actual shell bootstrap with a disposable Cloud Shell stand-in."""

import os
import pathlib
import subprocess
import tempfile
import unittest


RUNTIME = pathlib.Path(__file__).with_name("cloud-shell-runtime.sh")
PIN = "977563e97ddc66facf3a8e31c6cff01d236f09bd"


class RuntimeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = pathlib.Path(self.tmp.name)
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.env = os.environ.copy()
        self.env.update({
            "PATH": f"{self.bin}:/usr/bin:/bin",
            "XDG_CACHE_HOME": str(self.root / "cache"),
            "NVM_DIR": str(self.root / "missing-nvm"),
            "GC_TEST_MAJOR": "20",
            "GC_TEST_NVM_SHA": PIN,
            "GC_TEST_GIT_LOG": str(self.root / "git.log"),
        })
        self.make_executable("node", """#!/usr/bin/env bash
if [[ "$1" == "-p" ]]; then printf '%s\\n' "$GC_TEST_MAJOR"; else printf 'v%s.0.0\\n' "$GC_TEST_MAJOR"; fi
""")
        self.make_executable("npm", """#!/usr/bin/env bash
if [[ "$1" == "install" ]]; then
  for ((i=1;i<=$#;i++)); do
    if [[ "${!i}" == "--prefix" ]]; then
      j=$((i+1)); mkdir -p "${!j}/node_modules/.bin"
      printf '#!/usr/bin/env bash\\nexit 0\\n' > "${!j}/node_modules/.bin/firebase"
      chmod +x "${!j}/node_modules/.bin/firebase"
    fi
  done
fi
""")
        self.make_executable("git", """#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$GC_TEST_GIT_LOG"
if [[ "$1" == "clone" ]]; then
  [[ "${GC_TEST_GIT_FAIL:-}" == 1 ]] && exit 1
  target="${@: -1}"
  mkdir -p "$target"
  printf '%s\\n' 'nvm() { [[ "$1" == install || "$1" == use ]] && export GC_TEST_MAJOR=22; }' > "$target/nvm.sh"
elif [[ "$1" == "-C" && "$3" == "rev-parse" ]]; then
  printf '%s\\n' "$GC_TEST_NVM_SHA"
fi
""")

    def make_executable(self, name, content):
        path = self.bin / name
        path.write_text(content, encoding="utf-8")
        path.chmod(0o755)

    def run_bootstrap(self, command):
        return subprocess.run(
            ["bash", "-c", f'set -euo pipefail; . "{RUNTIME}"; {command}'],
            env=self.env, capture_output=True, text=True, check=False,
        )

    def test_existing_node22_needs_no_nvm_or_network(self):
        self.env["GC_TEST_MAJOR"] = "22"
        result = self.run_bootstrap("gradecrew_use_node22; node -p x")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(result.stdout.splitlines()[-1], "22")
        self.assertFalse((self.root / "git.log").exists())

    def test_fresh_shell_installs_pinned_nvm_and_activates_node22(self):
        result = self.run_bootstrap('gradecrew_use_node22; node -p x; printf "%s\\n" "$NVM_DIR"')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(result.stdout.splitlines()[-2], "22")
        self.assertTrue(result.stdout.splitlines()[-1].endswith("/gradecrew/nvm-v0.40.3"))
        self.assertIn("https://github.com/nvm-sh/nvm.git", (self.root / "git.log").read_text())

    def test_rejects_unexpected_download_commit_before_execution(self):
        self.env["GC_TEST_NVM_SHA"] = "0" * 40
        result = self.run_bootstrap("gradecrew_use_node22")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("entspricht nicht der geprüften Version", result.stdout)
        self.assertFalse((self.root / "cache/gradecrew/nvm-v0.40.3").exists())

    def test_failed_download_stops_before_deploy(self):
        self.env["GC_TEST_GIT_FAIL"] = "1"
        result = self.run_bootstrap("gradecrew_use_node22")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Es wird nichts deployed", result.stdout)

    def test_firebase_installs_without_global_rights(self):
        result = self.run_bootstrap('gradecrew_use_firebase; command -v firebase')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("/cache/gradecrew/firebase-cli/node_modules/.bin/firebase", result.stdout)


if __name__ == "__main__":
    unittest.main()
