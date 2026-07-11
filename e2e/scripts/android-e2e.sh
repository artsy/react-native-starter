#!/usr/bin/env bash
#
# android-e2e.sh — install the release APK on the booted emulator and run the
# agent-device e2e flows, retrying to absorb agent-device's occasional
# app-launch flake (sometimes the home launcher stays foreground after install
# instead of the app, so step 2 of the smoke check times out).
#
# Runs the suite with `--debug` (verbose CLI/daemon diagnostics) and
# `--record-video` + `--artifacts-dir`, and captures a device screenshot, an
# accessibility snapshot, the current foreground window/activity, and recent
# logcat on every attempt (pass or fail) so a run can be inspected after the
# fact. All evidence lands under
# $E2E_ARTIFACTS_DIR (default: e2e-artifacts/) which CI uploads as an artifact.
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
ART="${E2E_ARTIFACTS_DIR:-e2e-artifacts}"
mkdir -p "$ART"

# capture_evidence <label> — dump a screenshot, an agent-device accessibility
# snapshot, the foreground window/activity, and recent logcat into $ART/<label>/.
# Best-effort: never fails the run.
capture_evidence() {
  label="$1"
  dir="$ART/$label"
  mkdir -p "$dir"
  echo "Capturing device evidence -> $dir"
  adb exec-out screencap -p > "$dir/screen.png" 2>"$dir/screencap.err" \
    || echo "screencap failed (see screencap.err)"
  # Accessibility snapshot of whatever is on screen right now. `--platform
  # android` lets it attach to the foreground app without the (now closed)
  # test session; captured before the force-stop below so it reflects the
  # failed state. Structured (--json) + human-readable text side by side.
  yarn agent-device snapshot --platform android --json --timeout 20000 \
    > "$dir/snapshot.json" 2>"$dir/snapshot.err" || echo "snapshot (json) failed (see snapshot.err)"
  yarn agent-device snapshot --platform android --timeout 20000 \
    > "$dir/snapshot.txt" 2>>"$dir/snapshot.err" || echo "snapshot (text) failed (see snapshot.err)"
  {
    echo "== dumpsys window (focus) =="
    adb shell dumpsys window 2>/dev/null | grep -E 'mCurrentFocus|mFocusedApp' || true
    echo
    echo "== dumpsys activity (resumed) =="
    adb shell dumpsys activity activities 2>/dev/null \
      | grep -E 'mResumedActivity|topResumedActivity|ResumedActivity' || true
  } > "$dir/foreground.txt" 2>&1 || true
  adb logcat -d -v time -t 2000 > "$dir/logcat.txt" 2>&1 || true
  # Echo the textual evidence into the CI log too. The uploaded artifact lives
  # on Azure blob storage, which some egress policies block, so surfacing the
  # foreground + snapshot inline keeps a run diagnosable straight from the logs
  # (the screenshot PNG + recording.mp4 remain in the downloadable artifact).
  echo "----- $label: foreground -----"
  cat "$dir/foreground.txt" 2>/dev/null || true
  echo "----- $label: accessibility snapshot (first 60 lines) -----"
  head -n 60 "$dir/snapshot.txt" 2>/dev/null || true
  echo "----- end $label evidence (screenshot: $dir/screen.png) -----"
}

echo "Installing $APK"
adb install -r "$APK"

# The emulator-runner returns as soon as `sys.boot_completed=1`, which fires
# while the system is still settling — the home launcher and PackageManager
# aren't fully ready, and a launch intent issued this early can be dropped
# (the app never comes to foreground). Wait for the boot animation to stop and
# give the launcher a few more seconds before the first attempt.
echo "Waiting for the device to finish settling after boot..."
adb wait-for-device
boot_wait=0
until [ "$(adb shell getprop init.svc.bootanim 2>/dev/null | tr -d '[:space:]')" = "stopped" ]; do
  boot_wait=$((boot_wait + 2))
  if [ "$boot_wait" -ge 60 ]; then
    echo "bootanim still not stopped after ${boot_wait}s; proceeding anyway"
    break
  fi
  sleep 2
done
# Suppress system ANR/crash dialogs. Under CI emulator load the Pixel launcher
# itself sometimes ANRs right as the app cold-starts; its "Application Not
# Responding" dialog steals window focus, so agent-device sees
# com.google.android.apps.nexuslauncher (not net.artsy.energy) as the foreground
# window and `wait` fails — even though our MainActivity is the resumed/top
# activity. Hiding error dialogs stops them from grabbing focus.
adb shell settings put global hide_error_dialogs 1 || true
# Extra settle so the launcher finishes initializing before we cold-start the
# app (reduces the launcher-ANR window).
sleep 25
echo "Device settled; starting e2e."

attempts=3
n=0
until [ "$n" -ge "$attempts" ]; do
  n=$((n + 1))
  echo "::group::agent-device e2e attempt $n/$attempts"
  # --debug: verbose CLI/daemon diagnostics. --record-video + --artifacts-dir:
  # persist a per-attempt recording.mp4 and replay logs under $ART/agent-device.
  # shellcheck disable=SC2086 # $FLOWS is an intentionally word-split flow list
  if yarn agent-device test $FLOWS --debug --record-video --artifacts-dir "$ART/agent-device"; then
    echo "::endgroup::"
    echo "agent-device e2e passed on attempt $n"
    capture_evidence "pass"
    exit 0
  fi
  echo "::endgroup::"
  echo "attempt $n failed; capturing evidence, force-stopping the app and retrying"
  capture_evidence "attempt-${n}-failure"
  adb shell am force-stop "$APP_ID" || true
  sleep 5
done

echo "agent-device e2e failed after $attempts attempts"
exit 1
