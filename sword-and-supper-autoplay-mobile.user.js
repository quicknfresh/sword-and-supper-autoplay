// ==UserScript==
// @name         Sword & Supper Mobile UI Skin
// @namespace    https://github.com/quicknfresh/sword-and-supper-autoplay
// @version      3.16.21
// @description  Lightweight Android-friendly styling for the Standard Sword & Supper autoplay control panel.
// @author       quicknfresh
// @match        *://*.devvit.net/*
// @grant        none
// @run-at       document-idle
// @homepageURL  https://github.com/quicknfresh/sword-and-supper-autoplay
// @supportURL   https://github.com/quicknfresh/sword-and-supper-autoplay/issues
// @downloadURL  https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js
// @updateURL    https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js
// ==/UserScript==

(function () {
    "use strict";

    const style = document.createElement("style");
    style.id = "ss-mobile-ui-skin";
    style.textContent = `
        body:has(.mc__button-area) #ios-ui-panel-wrapper {
            display: none !important;
        }

        #ios-ui-panel-wrapper {
            --panel-scale: 1 !important;
            left: 8px !important;
            right: 8px !important;
            top: auto !important;
            bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;
            width: auto !important;
            max-width: none !important;
            padding: 6px 8px !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            background: rgba(17,19,24,.96) !important;
            box-shadow: 0 5px 18px rgba(0,0,0,.32) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            touch-action: none !important;
        }

        #ios-ui-panel-wrapper > div:first-child {
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            pointer-events: none !important;
        }

        #ios-ui-panel-wrapper > div:nth-child(2) {
            display: flex !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
            max-width: none !important;
            gap: 6px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scrollbar-width: none !important;
            overscroll-behavior: contain !important;
            -webkit-overflow-scrolling: touch !important;
        }

        #ios-ui-panel-wrapper > div:nth-child(2)::-webkit-scrollbar {
            display: none !important;
        }

        #ios-ui-panel-wrapper .ios-btn {
            flex: 0 0 42px !important;
            width: 42px !important;
            height: 42px !important;
            padding: 0 !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            color: #fff !important;
            font-size: 20px !important;
            line-height: 1 !important;
            text-shadow: none !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
        }

        #ios-ui-panel-wrapper .ios-btn:active {
            transform: scale(.93) !important;
            opacity: .82 !important;
            box-shadow: none !important;
        }

        #ios-ui-panel-wrapper .ios-resize-handle {
            display: none !important;
        }

        #ios-ui-panel-wrapper .ios-editor-panel {
            position: fixed !important;
            left: 12px !important;
            right: 12px !important;
            top: auto !important;
            bottom: calc(66px + env(safe-area-inset-bottom, 0px)) !important;
            width: auto !important;
            max-height: 55vh !important;
            overflow: auto !important;
            padding: 14px !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            background: rgba(22,24,29,.98) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.38) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        #ios-ui-panel-wrapper .ios-textarea {
            width: 100% !important;
            min-height: 96px !important;
            padding: 10px !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            border-radius: 10px !important;
            background: #111318 !important;
            box-shadow: none !important;
            color: #fff !important;
            font-size: 13px !important;
        }

        #ios-ui-panel-wrapper .ios-editor-btn {
            padding: 9px 14px !important;
            border: 0 !important;
            border-radius: 10px !important;
            box-shadow: none !important;
            font-size: 13px !important;
            font-weight: 700 !important;
        }
    `;

    (document.head || document.documentElement).appendChild(style);
})();
