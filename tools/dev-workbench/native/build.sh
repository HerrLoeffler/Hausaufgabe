#!/bin/zsh
set -eu
TOOL_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$TOOL_DIR/GradeCrew Entwickler.app"
mkdir -p "$APP_DIR/Contents/MacOS" /private/tmp/gradecrew-swift-module-cache
xcrun swiftc -module-cache-path /private/tmp/gradecrew-swift-module-cache "$TOOL_DIR/GradeCrewWorkbench.swift" -o "$APP_DIR/Contents/MacOS/GradeCrewWorkbench" -framework AppKit -framework CoreGraphics
cat > "$APP_DIR/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>CFBundleIdentifier</key><string>de.gradecrew.development-tool</string><key>CFBundleName</key><string>GradeCrew Entwickler</string><key>CFBundleExecutable</key><string>GradeCrewWorkbench</string><key>CFBundleVersion</key><string>1</string><key>CFBundlePackageType</key><string>APPL</string><key>LSUIElement</key><true/><key>NSHighResolutionCapable</key><true/><key>NSPrincipalClass</key><string>NSApplication</string></dict></plist>
PLIST
/usr/bin/codesign --force --sign - "$APP_DIR"
printf '%s\n' "$APP_DIR"
