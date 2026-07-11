#!/usr/bin/env bash
#
# android-e2e.sh — install the release APK on the booted emulator and run the
# agent-device e2e flows, retrying to absorb agent-device's occasional
# app-launch flake (sometimes the home launcher stays foreground after install
# instead of the app, so step 2 of the smoke check times out).
#
# IMPORTANT: this MUST live in a standalone script, NOT inline in the workflow's
# `script:` block. reactivecircus/android-emulator-runner executes that input
# line-by-line, each line in its own `sh -c`, so a multi-line `until … done`
# loop is split across shells and fails with:
#   sh: 1: Syntax error: end of file unexpected (expecting "done")
# Keeping the loop in one file runs it in a single shell, which works.
set -euo pipefail

APK="android/app/build/outputs/apk/release/app-release.apk"
FLOWS="${E2E_FLOWS:-e2e/flows}"
APP_ID="net.artsy.energy"

echo "Installing $APK"
adb install -r "$APK"

attempts=3
n=0
until [ "$n" -ge "$attempts" ]; do
  n=$((n + 1))
  echo "::group::agent-device e2e attempt $n/$attempts"
  # shellcheck disable=SC2086 # $FLOWS is an intentionally word-split flow list
  if yarn agent-device test $FLOWS; then
    echo "::endgroup::"
    echo "agent-device e2e passed on attempt $n"
    exit 0
  fi
  echo "::endgroup::"
  echo "attempt $n failed; force-stopping the app and retrying"
  adb shell am force-stop "$APP_ID" || true
  sleep 5
done

echo "agent-device e2e failed after $attempts attempts"
exit 1
