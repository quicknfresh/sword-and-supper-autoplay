# Sword & Supper Auto Play

A Tampermonkey userscript for **Sword & Supper** on Reddit, including fixes for Firefox on Android.

[![Install in Tampermonkey](https://img.shields.io/badge/Install%20in-Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js)

## Install

1. Install the **Tampermonkey** extension in your browser.
2. Tap the **Install in Tampermonkey** button above.
3. Tampermonkey should open the installation screen automatically.
4. Press **Install**.
5. Allow Tampermonkey access to both `reddit.com` and `devvit.net`.
6. Open Sword & Supper in a normal browser tab and reload the game.

### Firefox Android

In Firefox, open **Menu → Extensions → Tampermonkey → Permissions** and allow access to Reddit and Devvit. The game must be opened in Firefox itself, not through the Reddit app's internal browser.

## Features

- Automatic battle advancing and skipping
- Automatic skill, shrine, monolith, house and miniboss choices
- Automatic item use and reward claiming
- Three-stage mission creation
- Optional mission looping
- Optional farming-gear equipping
- Saved preferences, panel position and panel size
- Touch-compatible panel dragging and resizing
- More reliable panel startup on Firefox Android

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

## Updates

The userscript contains `@downloadURL` and `@updateURL` metadata, so Tampermonkey can check this repository for future versions.

## Disclaimer

This is an unofficial community userscript and is not affiliated with Reddit or the developers of Sword & Supper. Game updates may change page elements and temporarily break automation. Use it at your own discretion.

## Credits

Original script by **Eric** (`u/echo-foxtrot-delta`). Firefox Android compatibility update maintained in this repository by **quicknfresh**.
