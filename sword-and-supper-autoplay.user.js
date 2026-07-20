// ==UserScript==
// @name         Sword & Supper Auto Play v3.16.15 (Firefox Android Fix)
// @namespace    https://reddit.com/user/echo-foxtrot-delta/
// @version      3.16.15.1
// @description  Full Sword & Supper autoplay with Firefox Android touch and startup fixes.
// @author       Eric; Firefox Android packaging by quicknfresh
// @match        *://*.reddit.com/*
// @match        *://*.devvit.net/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// @homepageURL  https://github.com/quicknfresh/sword-and-supper-autoplay
// @supportURL   https://github.com/quicknfresh/sword-and-supper-autoplay/issues
// @downloadURL  https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js
// @updateURL    https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay.user.js
// ==/UserScript==

(function () {
    "use strict";

    const base = "https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/.build/";
    const parts = [
        "part-01.b64",
        "part-02.b64",
        "part-03.b64",
        "part-04.b64",
        "part-05.b64",
    ];

    const loadPart = (name) => new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: base + name,
            timeout: 20000,
            onload: (response) => {
                if (response.status >= 200 && response.status < 300) {
                    resolve(response.responseText.trim());
                } else {
                    reject(new Error(`${name} returned HTTP ${response.status}`));
                }
            },
            onerror: () => reject(new Error(`Could not download ${name}`)),
            ontimeout: () => reject(new Error(`Timed out downloading ${name}`)),
        });
    });

    Promise.all(parts.map(loadPart))
        .then((encodedParts) => {
            const binary = atob(encodedParts.join(""));
            const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
            const source = new TextDecoder("utf-8").decode(bytes);
            (0, eval)(source);
        })
        .catch((error) => {
            console.error("[Sword&Supper] Loader failed:", error);
            alert(`Sword & Supper autoplay could not load. ${error.message}`);
        });
})();
