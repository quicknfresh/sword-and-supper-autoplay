# Sword & Supper Auto Play

Tampermonkey userscripts for **Sword & Supper** on Reddit.

## Install

### Android Mobile Full

Uses the complete Standard automation logic, with a touch-friendly bottom control panel for Android.

[![Install Android Mobile Full](https://img.shields.io/badge/Install-Android%20Mobile%20Full-2E7D32?style=for-the-badge&logo=android)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js?full=1)

### Standard version

Recommended for desktop and available as a fallback on Android.

[![Install Standard Version](https://img.shields.io/badge/Install-Standard%20Version-00485B?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js?full=1)

> Enable only one Sword & Supper userscript at a time. Disable or delete the Standard version before enabling Mobile Full.

## Android installation

1. Install **Tampermonkey** in Firefox for Android.
2. Open **Firefox menu → Extensions → Tampermonkey → Permissions**.
3. Allow access to both `reddit.com` and `devvit.net`.
4. Open the **Android Mobile Full** installation button above in Firefox.
5. Press **Install** in Tampermonkey.
6. Open Sword & Supper in Firefox itself, not in the Reddit app's internal browser.

## Mobile Full panel

- Large touch-friendly buttons in a two-row bottom panel
- Collapse and expand control
- Automatically collapses on the inline Reddit preview so it does not cover **Start Mission**
- No blur or backdrop effects
- Full Standard automation is loaded unchanged through `@require`

The Start Mission button itself requires a genuine user or Android Accessibility tap because Devvit rejects JavaScript-generated untrusted events.

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

Original script by **Eric** (`u/echo-foxtrot-delta`). Firefox Android compatibility and mobile interface maintenance by **quicknfresh**.