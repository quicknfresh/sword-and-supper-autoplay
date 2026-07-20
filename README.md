# Sword & Supper Auto Play

A Tampermonkey userscript for **Sword & Supper** on Reddit, including fixes for Firefox on Android.

[![Install in Tampermonkey](https://img.shields.io/badge/Install%20in-Tampermonkey-00485B?style=for-the-badge&logo=tampermonkey)](https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js?full=1)

> **Previously installed version `3.16.15.1`?** That was an incorrect loader build. Delete it from Tampermonkey first, then use the install button above. The repository now serves the full autoplay script directly.

## Install

1. Install the **Tampermonkey** extension in your browser.
2. If Tampermonkey shows version `3.16.15.1` containing `GM_xmlhttpRequest`, delete that old script first.
3. Tap the **Install in Tampermonkey** button above.
4. Confirm that the installation screen shows the full autoplay source and `@grant none`, not the old loader.
5. Press **Install**.
6. Allow Tampermonkey access to both `reddit.com` and `devvit.net`.
7. Open Sword & Supper in a normal browser tab and reload the game.

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

## Disclaimer

This is an unofficial community userscript and is not affiliated with Reddit or the developers of Sword & Supper. Game updates may change page elements and temporarily break automation. Use it at your own discretion.

## Credits

Original script by **Eric** (`u/echo-foxtrot-delta`). Firefox Android compatibility update maintained in this repository by **quicknfresh**.
