#!/bin/zsh
set -e
GC_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GC_BUNDLE="$GC_ROOT/GradeCrew Control.app"
mkdir -p "$GC_BUNDLE/Contents/MacOS" "$GC_BUNDLE/Contents/Resources" "$GC_ROOT/.local/swift-cache"
cp "$GC_ROOT/server.mjs" "$GC_BUNDLE/Contents/Resources/"
cp -R "$GC_ROOT/public" "$GC_ROOT/data" "$GC_BUNDLE/Contents/Resources/"
/usr/libexec/PlistBuddy -c 'Clear dict' "$GC_BUNDLE/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c 'Add :CFBundleIdentifier string de.gradecrew.control.local' "$GC_BUNDLE/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Add :CFBundleName string GradeCrew Control' "$GC_BUNDLE/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Add :CFBundleExecutable string GradeCrewControl' "$GC_BUNDLE/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Add :CFBundlePackageType string APPL' "$GC_BUNDLE/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Add :CFBundleShortVersionString string 0.2.0' "$GC_BUNDLE/Contents/Info.plist"
/usr/libexec/PlistBuddy -c "Add :GCStateDirectory string $GC_ROOT/.local" "$GC_BUNDLE/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Add :NSAppTransportSecurity dict' "$GC_BUNDLE/Contents/Info.plist"
/usr/libexec/PlistBuddy -c 'Add :NSAppTransportSecurity:NSAllowsLocalNetworking bool true' "$GC_BUNDLE/Contents/Info.plist"
"$(xcrun --find swiftc)" -sdk "$(xcrun --show-sdk-path)" -swift-version 5 -module-cache-path "$GC_ROOT/.local/swift-cache" "$GC_ROOT/native/GradeCrew.swift" -o "$GC_BUNDLE/Contents/MacOS/GradeCrewControl" -framework AppKit -framework WebKit
codesign --force --sign - "$GC_BUNDLE"
echo "$GC_BUNDLE"
