# Sword & Supper Auto Play

A Tampermonkey userscript for **Sword & Supper** on Reddit, including Firefox Android compatibility fixes.

## Install

[![Install in Tampermonkey](https://img.shields.io/badge/Install%20in-Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js?full=1)

> The experimental Android Mobile Lite build has been withdrawn because map creation, reward claiming and farming-gear equipping were not reliable. Android users should use the Standard version for now.

> **Previously installed Mobile Lite?** Disable or delete it in Tampermonkey before installing the Standard version. Never enable both at once.

## Android installation

1. Install **Tampermonkey** in Firefox for Android.
2. Open **Firefox menu → Extensions → Tampermonkey → Permissions**.
3. Allow access to both `reddit.com` and `devvit.net`.
4. Tap the installation button above in Firefox.
5. Confirm that the installation page contains the complete source and `@grant none`.
6. Press **Install**.
7. Open Sword & Supper in Firefox itself, not in the Reddit app's internal browser.

## Features

- Automatic battle advancing and skipping
- Automatic skill, shrine, monolith, house and miniboss choices
- Automatic item use and reward claiming
- Three-stage mission creation
- Optional mission looping
- Optional farming-gear equipping
- Saved preferences, panel position and panel size
- Touch-compatible panel dragging and resizing
- Firefox Android startup fixes

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

Original script by **Eric** (`u/echo-foxtrot-delta`). Firefox Android compatibility maintenance by **quicknfresh**.