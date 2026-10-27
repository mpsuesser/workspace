#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
swift build -c release
bin_dir=$(swift build -c release --show-bin-path)
app="${QUICKSWITCH_INSTALL_DIR:-$HOME/Applications}/QuickSwitch.app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
mkdir -p "$app/Contents/Resources/Marks"
cp Sources/QuickSwitch/Assets/*.png "$app/Contents/Resources/Marks/"
cp Resources/Info.plist "$app/Contents/Info.plist"
cp "$bin_dir/QuickSwitch" "$app/Contents/MacOS/QuickSwitch"
# A stable designated requirement keeps Accessibility authorization across rebuilds.
# Use QUICKSWITCH_SIGN_IDENTITY for a personal signing certificate if available.
codesign --force --sign "${QUICKSWITCH_SIGN_IDENTITY:--}" \
    --identifier local.quickswitch \
    --requirements '=designated => identifier "local.quickswitch"' "$app"
codesign --verify --strict "$app"
printf 'Installed %s\n' "$app"
