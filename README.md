# Sword & Supper Auto Play

Tampermonkey userscripts for **Sword & Supper** on Reddit.

## Android setup

Android now uses the proven Standard automation plus a separate lightweight UI skin. The skin contains no gameplay automation and does not load a second copy of the Standard script.

### 1. Install Standard automation

[![Install Standard Automation](https://img.shields.io/badge/1.%20Install-Standard%20Automation-00485B?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js?full=1)

### 2. Install Android UI skin

[![Install Android UI Skin](https://img.shields.io/badge/2.%20Install-Android%20UI%20Skin-2E7D32?style=for-the-badge&logo=android)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js?full=1)

Both scripts should be enabled on Android:

- **Sword & Supper Auto Play v3.16.15** performs the automation.
- **Sword & Supper Mobile UI Skin v3.16.21** only restyles the control panel.

> Delete the old **Sword & Supper Auto Play Mobile Full v3.16.20** before installing the UI skin. The old version loaded another copy of the automation and could slow game startup.

## Firefox Android installation

1. Install **Tampermonkey** in Firefox for Android.
2. Open **Firefox menu → Extensions → Tampermonkey → Permissions**.
3. Allow access to both `reddit.com` and `devvit.net`.
4. Install the Standard Automation button above.
5. Install the Android UI Skin button above.
6. Keep both enabled, but disable any older Mobile Lite or Mobile Full builds.
7. Open Sword & Supper in Firefox itself, not in the Reddit app's internal browser.

## Mobile UI

- Compact dark dock at the bottom
- One horizontally scrollable row of touch controls
- 42-pixel touch targets
- No blur or backdrop filters
- Hidden while the inline **Start Mission** preview is visible
- No observers, polling loops or duplicated automation in the UI skin

The **Start Mission** button still requires a genuine user or Android Accessibility tap because Devvit rejects JavaScript-generated untrusted events.

## Features

- Automatic battle advancing and skipping
- Automatic skill, shrine, monolith, house and miniboss choices
- Automatic item use and reward claiming
- Three-stage mission creation
- Optional mission looping
- Optional farming-gear equipping
- Saved preferences

## Controls

| Button | Function |
|---|---|
| `▶ / ⏸` | Start or pause autoplay |
| `🥫` | Toggle preferred-skill selection; double-tap to edit priorities |
| `🏯` | Toggle shrine choices; double-tap to edit priorities |
| `🗿` | Toggle monolith choices; double-tap to edit priorities |
| `🛖` | Toggle Yes/No for the mysterious building |
| `👻` | Toggle fighting dangerous creatures |
| `🗺️` | Toggle automatic map creation |
| `🧑‍🌾` | Toggle automatic farming-gear equipping |
| `🗑️` | Clear remembered mission history |
| `🔄` | Toggle automatic chaining into another mission |

## Disclaimer

This is an unofficial community userscript and is not affiliated with Reddit or the developers of Sword & Supper. Game updates may change page elements and temporarily break automation. Use it at your own discretion.

## Credits

Original automation script by **Eric** (`u/echo-foxtrot-delta`). Firefox Android compatibility and mobile interface maintenance by **quicknfresh**.