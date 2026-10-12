#!/bin/sh
set -e

# Checks that the archived JS bundle really contains the MMKV ENCRYPTION_KEY
# configured for this workflow (see ci_post_clone.sh). react-native-dotenv
# takes it from the environment of the "Bundle React Native code and images"
# build phase. If it did not get there, the app opens wallet storage without
# the key and existing users lose access to their wallets after updating.

if [ "${CI_XCODEBUILD_ACTION:-}" != "archive" ] || [ "${CI_XCODEBUILD_EXIT_CODE:-0}" != "0" ]; then
  exit 0
fi

if [ -z "${ENCRYPTION_KEY:-}" ]; then
  echo "ERROR: ENCRYPTION_KEY is not set in this Xcode Cloud workflow's environment."
  exit 1
fi

BUNDLE="$(find "$CI_ARCHIVE_PATH/Products/Applications" -maxdepth 2 -name main.jsbundle | head -n 1)"
if [ -z "$BUNDLE" ]; then
  echo "ERROR: main.jsbundle not found in $CI_ARCHIVE_PATH"
  exit 1
fi

if ! grep -a -q -F -- "$ENCRYPTION_KEY" "$BUNDLE"; then
  echo "ERROR: $BUNDLE does not contain ENCRYPTION_KEY."
  echo "ERROR: Do not distribute this build: existing users' wallets would be unreadable."
  exit 1
fi

echo ">>> main.jsbundle contains ENCRYPTION_KEY"
