"""Verify native artwork names are generated from canonical GradeCrew assets."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
manifest = json.loads((root / "shared/gradecrew-design/assets.json").read_text())
swift = (root / "native/Shared/GradeCrewAssets.swift").read_text()
generator = (root / "tools/generate-gradecrew-design.mjs").read_text()
preparer = (root / "native/GradeCrewTeacher/prepare_testflight_assets.py").read_text()

expected = {
    "cocoWelcome": "GradeCrewCocoWelcome",
    "remyWelcome": "GradeCrewRemyWelcome",
    "brandIcon": "GradeCrewBrandIcon",
    "remyMicrophone": "GradeCrewRemyMicrophone",
}
for semantic_name, image_name in expected.items():
    assert f"static let {semantic_name} = \"{image_name}\"" in swift, f"Missing generated native image name: {semantic_name}"
    assert image_name in generator, f"Generator does not emit native image name: {image_name}"
    assert image_name in preparer, f"Native asset preparation does not package: {image_name}"

assert manifest["mascots"]["coco"]["welcome"] == "penguin-guide-welcome.svg"
assert manifest["mascots"]["remy"]["welcome"] == "elephant-create-welcome.svg"
assert manifest["mascots"]["remy"]["microphone"] == "remy-microphone-v1.png"
assert manifest["mascots"]["remy"]["microphone"] == "remy-microphone-v1.png"
assert manifest["brand"]["icon"] == "brand-icon-v1.svg"
print("GradeCrew native artwork sources: passed (Coco, Remy, and brand icon map to canonical manifest assets)")
