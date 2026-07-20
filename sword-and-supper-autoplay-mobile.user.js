// ==UserScript==
// @name         Sword & Supper Auto Play Mobile Full
// @namespace    https://github.com/quicknfresh/sword-and-supper-autoplay
// @version      3.16.20
// @description  Full Sword & Supper automation with a mobile-friendly bottom control panel.
// @author       Eric; mobile interface by quicknfresh
// @match        *://*.reddit.com/*
// @match        *://*.devvit.net/*
// @require      https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js?mobile-full=3.16.20
// @grant        none
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js
// @updateURL    https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js
// ==/UserScript==

(function () {
    "use strict";

    // The @require above runs the complete Standard script unchanged.
    // This wrapper only restyles and reorganises its existing controls.
    if (!location.hostname.includes("devvit.net")) return;

    const STYLE_ID = "ss-mobile-full-style";
    const HEADER_ID = "ss-mobile-full-header";
    const COLLAPSE_KEY = "ssMobilePanelCollapsed";

    function installStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `
            #ios-ui-panel-wrapper.ss-mobile-full {
                --panel-scale: 1 !important;
                position: fixed !important;
                left: 8px !important;
                right: 8px !important;
                top: auto !important;
                bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important;
                width: auto !important;
                max-width: none !important;
                padding: 6px !important;
                box-sizing: border-box !important;
                border-radius: 16px !important;
                overflow: visible !important;
                touch-action: manipulation !important;
            }

            #ios-ui-panel-wrapper.ss-mobile-full > div:first-child {
                background: rgba(22, 26, 31, 0.96) !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4) !important;
                border-radius: 16px !important;
                border: 1px solid rgba(255, 255, 255, 0.18) !important;
            }

            #${HEADER_ID} {
                position: relative;
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 38px;
                padding: 2px 4px 6px;
                color: rgba(255, 255, 255, 0.95);
                font: 600 13px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                user-select: none;
                -webkit-user-select: none;
            }

            #${HEADER_ID} .ss-mobile-title {
                display: flex;
                align-items: center;
                gap: 7px;
                overflow: hidden;
                white-space: nowrap;
            }

            #${HEADER_ID} .ss-mobile-title::before {
                content: "⚔️";
                font-size: 17px;
            }

            #${HEADER_ID} .ss-mobile-collapse {
                width: 38px;
                height: 32px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 18px;
                line-height: 1;
                touch-action: manipulation;
            }

            #ios-ui-panel-wrapper.ss-mobile-full .ss-mobile-controls {
                position: relative !important;
                z-index: 3 !important;
                display: grid !important;
                grid-template-columns: repeat(5, minmax(44px, 1fr)) !important;
                gap: 7px !important;
                width: 100% !important;
                max-width: none !important;
                align-items: center !important;
            }

            #ios-ui-panel-wrapper.ss-mobile-full .ss-mobile-controls.is-collapsed {
                display: none !important;
            }

            #ios-ui-panel-wrapper.ss-mobile-full .ios-btn {
                width: 100% !important;
                min-width: 44px !important;
                height: 48px !important;
                border-radius: 12px !important;
                font-size: 22px !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: transparent !important;
                box-shadow: inset 0 1px rgba(255,255,255,0.35), 0 2px 5px rgba(0,0,0,0.22) !important;
            }

            #ios-ui-panel-wrapper.ss-mobile-full .ios-resize-handle {
                display: none !important;
            }

            #ios-ui-panel-wrapper.ss-mobile-full .ios-editor-panel {
                position: fixed !important;
                left: 8px !important;
                right: 8px !important;
                top: auto !important;
                bottom: calc(118px + env(safe-area-inset-bottom, 0px)) !important;
                width: auto !important;
                max-height: 55vh !important;
                overflow: auto !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                background: rgba(20, 22, 26, 0.98) !important;
                border-radius: 16px !important;
            }

            @media (max-width: 420px) {
                #ios-ui-panel-wrapper.ss-mobile-full .ss-mobile-controls {
                    grid-template-columns: repeat(5, minmax(40px, 1fr)) !important;
                    gap: 5px !important;
                }

                #ios-ui-panel-wrapper.ss-mobile-full .ios-btn {
                    min-width: 40px !important;
                    height: 46px !important;
                    font-size: 21px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function findControls(wrapper) {
        return Array.from(wrapper.children).find((child) =>
            child.id !== HEADER_ID && child.querySelector?.(".ios-btn")
        );
    }

    function setCollapsed(wrapper, controls, collapsed, save = true) {
        controls.classList.toggle("is-collapsed", collapsed);
        wrapper.classList.toggle("is-collapsed", collapsed);

        const button = wrapper.querySelector(".ss-mobile-collapse");
        if (button) {
            button.textContent = collapsed ? "▲" : "▼";
            button.setAttribute("aria-label", collapsed ? "Expand controls" : "Collapse controls");
        }

        if (save) localStorage.setItem(COLLAPSE_KEY, String(collapsed));
    }

    function addHeader(wrapper, controls) {
        let header = document.getElementById(HEADER_ID);
        if (header) return header;

        header = document.createElement("div");
        header.id = HEADER_ID;
        header.innerHTML = `
            <div class="ss-mobile-title">Sword & Supper Auto Play</div>
            <button type="button" class="ss-mobile-collapse" aria-label="Collapse controls">▼</button>
        `;

        const collapse = header.querySelector(".ss-mobile-collapse");
        collapse.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            setCollapsed(wrapper, controls, !controls.classList.contains("is-collapsed"));
        });

        header.addEventListener("pointerdown", (event) => event.stopPropagation());
        wrapper.insertBefore(header, controls);
        return header;
    }

    function applyMobilePanel() {
        const wrapper = document.getElementById("ios-ui-panel-wrapper");
        if (!wrapper) return false;

        installStyles();
        wrapper.classList.add("ss-mobile-full");
        wrapper.style.setProperty("--panel-scale", "1");

        const controls = findControls(wrapper);
        if (!controls) return false;
        controls.classList.add("ss-mobile-controls");
        addHeader(wrapper, controls);

        // On the inline Reddit preview, keep the controls collapsed so they do
        // not cover the genuine Start Mission button. Expanded gameplay uses
        // the user's saved panel state.
        const inlinePreview = !!document.querySelector(".mc__button-area");
        const savedCollapsed = localStorage.getItem(COLLAPSE_KEY) === "true";
        setCollapsed(wrapper, controls, inlinePreview || savedCollapsed, false);

        wrapper.dataset.mobileFullApplied = "true";
        return true;
    }

    let lastPreviewState = null;
    function refreshPreviewState() {
        const wrapper = document.getElementById("ios-ui-panel-wrapper");
        if (!wrapper) return;
        const controls = wrapper.querySelector(".ss-mobile-controls");
        if (!controls) return;

        const inlinePreview = !!document.querySelector(".mc__button-area");
        if (inlinePreview === lastPreviewState) return;
        lastPreviewState = inlinePreview;

        if (inlinePreview) {
            setCollapsed(wrapper, controls, true, false);
        } else {
            setCollapsed(wrapper, controls, localStorage.getItem(COLLAPSE_KEY) === "true", false);
        }
    }

    const observer = new MutationObserver(() => {
        if (applyMobilePanel()) refreshPreviewState();
    });

    if (document.documentElement) {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    applyMobilePanel();
    setInterval(refreshPreviewState, 1500);
})();