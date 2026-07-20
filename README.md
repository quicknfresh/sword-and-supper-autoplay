# Sword & Supper Auto Play

Tampermonkey userscripts for **Sword & Supper** on Reddit.

## Install

### Standard version

Best for desktop and faster devices. Includes the full feature set and Firefox Android compatibility fixes.

[![Install Standard Version](https://img.shields.io/badge/Install-Standard%20Version-00485B?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js?full=1)

### Android Mobile Lite

Recommended when the game animation is choppy on an Android phone. Version **3.16.17** restores the full three-stage map-creation flow and farming-gear equipping while retaining slower polling and a lightweight control panel.

[![Install Android Mobile Lite](https://img.shields.io/badge/Install-Android%20Mobile%20Lite-2E7D32?style=for-the-badge&logo=android)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile-lite.user.js?full=1)

> Do not enable both versions at the same time. Disable or remove the Standard version before testing Mobile Lite on Android.

> **Previously installed version `3.16.15.1`?** That was an incorrect loader build. Delete it from Tampermonkey first, then install one of the full scripts above.

## Android installation

1. Install **Tampermonkey** in Firefox for Android.
2. Open **Firefox menu → Extensions → Tampermonkey → Permissions**.
3. Allow access to both `reddit.com` and `devvit.net`.
4. Open the relevant installation button above in Firefox.
5. Confirm that the installation page contains the complete source and `@grant none`.
6. Press **Install**.
7. Open Sword & Supper in Firefox itself, not in the Reddit app's internal browser.

## Features

### Standard

- Automatic battle advancing and skipping
- Automatic skill, shrine, monolith, house and miniboss choices
- Automatic item use and reward claiming
- Three-stage mission creation
- Optional mission looping
- Optional farming-gear equipping
- Saved preferences, panel position and panel size
- Touch-compatible panel dragging and resizing

### Mobile Lite

- Core battle autoplay and skipping
- Automatic skill, shrine, monolith, house and miniboss choices
- Automatic item use and reward claiming
- Three-stage automatic mission creation
- Optional farming-gear equipping
- Optional mission looping
- Lightweight draggable Android control panel
- Reduced polling and rendering overhead

## Controls

| Button | Function |
|---|---|
| `▶ / ⏸` | Start or pause autoplay |
| `🥫` | Toggle preferred-skill selection |
| `🏯` | Toggle shrine choices |
| `🗿` | Toggle monolith choices |
| `🛖` | Toggle Yes/No for the mysterious building |
| `👻` | Toggle fighting dangerous creatures |
| `🗺️` | Toggle automatic map creation |
| `🧑‍🌾` | Toggle automatic farming-gear equipping |
| `🔄` | Toggle automatic chaining into another mission |

The Standard version additionally includes `🗑️` for clearing remembered mission history and editable preference lists.

## Disclaimer

This is an unofficial community userscript and is not affiliated with Reddit or the developers of Sword & Supper. Game updates may change page elements and temporarily break automation. Use it at your own discretion.

## Credits

Original script by **Eric** (`u/echo-foxtrot-delta`). Firefox Android compatibility and Mobile Lite maintenance by **quicknfresh**.