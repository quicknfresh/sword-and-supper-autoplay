# Sword & Supper Auto Play

Tampermonkey userscripts for **Sword & Supper** on Reddit.

## Install

### Android Mobile Simple

Uses the full Standard automation with a separate, simple **single-row** control panel. It has a solid dark background, compact buttons, horizontal scrolling, and no gradients, blur, backdrop filters or liquid-glass effects.

[![Install Android Mobile Simple](https://img.shields.io/badge/Install-Android%20Mobile%20Simple-2E7D32?style=for-the-badge&logo=android)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile-simple.user.js?full=1)

### Standard version

[![Install Standard Version](https://img.shields.io/badge/Install-Standard%20Version-00485B?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js?full=1)

> Enable only one version. On Android, disable or delete the Standard, Mobile Lite, Mobile Full and Mobile UI Skin scripts before enabling **Mobile Simple**.

## Android installation

1. Install **Tampermonkey** in Firefox for Android.
2. Open **Firefox menu → Extensions → Tampermonkey → Permissions**.
3. Allow access to both `reddit.com` and `devvit.net`.
4. Tap **Install Android Mobile Simple** above.
5. Confirm that Tampermonkey shows **Sword & Supper Auto Play Mobile Simple v3.16.15.2** and `@grant none`.
6. Press **Install**.
7. Open Sword & Supper in Firefox itself, not in the Reddit app's internal browser.

## Features

- Automatic battle advancing and skipping
- Automatic skill, shrine, monolith, house and miniboss choices
- Automatic item use and reward claiming
- Three-stage mission creation
- Optional mission looping
- Optional farming-gear equipping
- Saved preferences and panel position
- Touch-compatible panel dragging

## Mobile Simple panel

- One horizontally scrollable row
- Compact 38-pixel buttons
- Solid dark panel
- No blur, gradients or backdrop effects
- Hidden while the inline **Start Mission** preview is visible
- Double-tap `🥫`, `🏯` or `🗿` to edit priorities

The inline **Start Mission** button still requires a genuine tap because Devvit rejects JavaScript-generated untrusted events.

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

Original automation script by **Eric** (`u/echo-foxtrot-delta`). Firefox Android compatibility and the Mobile Simple panel are maintained by **quicknfresh**.