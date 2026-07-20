// ==UserScript==
// @name         Sword & Supper Auto Play Mobile Lite
// @namespace    https://reddit.com/user/echo-foxtrot-delta/
// @version      3.16.16
// @description  Android-optimised Sword & Supper autoplay with one lightweight scheduler and simple controls.
// @author       Eric; mobile optimisation by quicknfresh
// @match        *://*.reddit.com/*
// @match        *://*.devvit.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    const CONFIG = {
        tickMs: 900,
        skillAuto: JSON.parse(localStorage.getItem("skillAuto") || "true"),
        shrineAuto: JSON.parse(localStorage.getItem("shrineAuto") || "true"),
        monolithAuto: JSON.parse(localStorage.getItem("monolithAuto") || "true"),
        houseAutoYes: JSON.parse(localStorage.getItem("houseAutoYes") || "true"),
        miniBossAutoFight: JSON.parse(localStorage.getItem("miniBossAutoFight") || "true"),
        mapAutoCreate: JSON.parse(localStorage.getItem("mapAutoCreate") || "true"),
        loopEnabled: JSON.parse(localStorage.getItem("loopEnabled") || "false"),
        preferredSkills: JSON.parse(localStorage.getItem("preferredSkills") || '["bolt on rage","heal on rage","add rage on heal"]'),
        shrinePriority: JSON.parse(localStorage.getItem("shrinePriority") || '["attack","crit rate","defense","hp","speed"]'),
        monolithPriority: JSON.parse(localStorage.getItem("monolithPriority") || '["attack","dodge rate","heal"]')
    };

    let running = localStorage.getItem("mobileLiteRunning") === "true";
    let busyUntil = 0;
    let lastMissionClick = 0;

    const visible = (el) => !!el && el.offsetParent !== null && !el.disabled;
    const click = (el) => {
        if (!visible(el)) return false;
        try { el.click(); return true; } catch (_) {}
        try {
            el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
            return true;
        } catch (_) { return false; }
    };
    const firstVisible = (selector) => Array.from(document.querySelectorAll(selector)).find(visible);
    const buttonsByText = (selector, matcher) => Array.from(document.querySelectorAll(selector)).find((el) => visible(el) && matcher(el.textContent.trim().toLowerCase()));
    const save = (key) => localStorage.setItem(key, JSON.stringify(CONFIG[key]));

    function pickChoice() {
        const header = document.querySelector(".ui-panel-header");
        const heading = header ? header.textContent.trim().toLowerCase() : "";
        const choices = Array.from(document.querySelectorAll(".skill-button-label")).filter(visible);
        if (!choices.length) return false;

        if (CONFIG.shrineAuto && heading.includes("shrine")) {
            for (const stat of CONFIG.shrinePriority) {
                const target = choices.find((el) => el.textContent.toLowerCase().includes(stat));
                if (target) return click(target);
            }
            return click(choices[0]);
        }

        if (heading.includes("choose a bonus")) {
            return click(choices.find((el) => el.textContent.toLowerCase().includes("attack")) || choices[0]);
        }

        if (CONFIG.monolithAuto && heading.includes("monolith")) {
            const loseHealth = choices.find((el) => {
                const t = el.textContent.toLowerCase();
                return t.includes("lose") && t.includes("health");
            });
            return click(loseHealth || choices.find((el) => /refuse/i.test(el.textContent)) || choices[0]);
        }

        if (CONFIG.skillAuto && (heading.includes("ancient machine") || heading.includes("selection of abilities"))) {
            for (const preferred of CONFIG.preferredSkills) {
                const target = choices.find((el) => el.textContent.trim().toLowerCase() === preferred.toLowerCase());
                if (target) return click(target);
            }
            return click(choices[0]);
        }

        if (heading.includes("mysterious building")) {
            const target = choices.find((el) => CONFIG.houseAutoYes ? /^yes$/i.test(el.textContent.trim()) : /^no$/i.test(el.textContent.trim()));
            return click(target);
        }

        if (heading.includes("dangerous creatures") && heading.includes("investigate")) {
            const target = choices.find((el) => CONFIG.miniBossAutoFight ? /fight/i.test(el.textContent) : /nope|no/i.test(el.textContent));
            return click(target);
        }

        return false;
    }

    function useItemOrClaim() {
        if (CONFIG.mapAutoCreate) {
            const modal = firstVisible(".item-modal-body");
            if (modal && modal.dataset.mobileLiteBusy !== "1") {
                const use = firstVisible.call ? null : null;
                const useButton = Array.from(modal.querySelectorAll("button")).find(visible);
                if (useButton) {
                    modal.dataset.mobileLiteBusy = "1";
                    click(useButton);
                    setTimeout(() => { delete modal.dataset.mobileLiteBusy; }, 2500);
                    busyUntil = Date.now() + 800;
                    return true;
                }
            }
        }

        const claim = Array.from(document.querySelectorAll(".claim-button")).find((el) => visible(el) && !el.classList.contains("inactive"));
        return click(claim);
    }

    function createMission() {
        if (!CONFIG.mapAutoCreate || Date.now() < busyUntil) return false;

        const container = firstVisible(".mission-create-container");
        if (container) {
            const scenario = container.querySelector(".randomize-scenario-section");
            if (scenario && scenario.dataset.mobileLiteBusy !== "1") {
                scenario.dataset.mobileLiteBusy = "1";
                click(container.querySelector(".autocomplete-button, img[alt*='Randomize']"));
                setTimeout(() => click(container.querySelector(".mission-create-submit-button, img[alt='Continue']")?.closest("button, .mission-create-submit-button") || container.querySelector(".mission-create-submit-button")), 700);
                setTimeout(() => delete scenario.dataset.mobileLiteBusy, 2500);
                busyUntil = Date.now() + 1200;
                return true;
            }

            const food = container.querySelector(".food-choices");
            if (food && food.dataset.mobileLiteBusy !== "1") {
                food.dataset.mobileLiteBusy = "1";
                const foods = Array.from(container.querySelectorAll(".food-choice")).filter(visible);
                if (foods.length) click(foods[Math.floor(Math.random() * foods.length)]);
                setTimeout(() => click(container.querySelector(".autocomplete-button, img[alt*='Randomize']")), 350);
                setTimeout(() => click(container.querySelector(".mission-create-submit-button, img[alt='Continue']")?.closest("button, .mission-create-submit-button") || container.querySelector(".mission-create-submit-button")), 800);
                setTimeout(() => delete food.dataset.mobileLiteBusy, 2800);
                busyUntil = Date.now() + 1500;
                return true;
            }
        }

        const form = firstVisible("form.mission-create-form");
        if (!form || form.dataset.mobileLiteBusy === "1") return false;
        const input = form.querySelector("input[name='title']");
        const summaries = Array.from(document.querySelectorAll(".mission-create-summary"));
        if (!input || !summaries.length || document.activeElement === input) return false;

        let target = "", level = "", difficulty = "⭐⭐⭐", food = "";
        for (const row of summaries) {
            const text = row.textContent.replace(/\s+/g, " ").trim();
            if (text.startsWith("Target:")) target = text.replace("Target:", "").trim();
            else if (text.includes("Rec. Level:")) level = text.split("Rec. Level:")[1].replace(/~/g, "-").replace(/\s+/g, "").trim();
            else if (text.startsWith("Food:")) food = text.replace("Food:", "").trim();
            else if (text.startsWith("Difficulty:")) {
                const stars = text.match(/⭐|★|🌟/g);
                if (stars?.length) difficulty = "⭐".repeat(stars.length);
            }
        }
        if (!target || !level) return false;

        const title = `Level ${level} ${difficulty} ${target} ${food}`.replace(/\s+/g, " ").trim();
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(input, title); else input.value = title;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));

        const redirect = form.querySelector("input#doRedirect");
        if (redirect?.checked) click(redirect);
        form.dataset.mobileLiteBusy = "1";
        setTimeout(() => click(form.querySelector("img[alt*='Create']")?.closest(".mission-create-submit-button, button") || form.querySelector(".mission-create-submit-button")), 500);
        setTimeout(() => delete form.dataset.mobileLiteBusy, 3500);
        busyUntil = Date.now() + 1200;
        return true;
    }

    function missionLoop() {
        if (!CONFIG.loopEnabled) return false;
        const end = document.querySelector(".end-mission-button:not([data-mobile-lite-clicked])");
        if (visible(end)) {
            end.dataset.mobileLiteClicked = "1";
            return click(end);
        }
        if (Date.now() - lastMissionClick < 6000) return false;
        const link = Array.from(document.querySelectorAll(".mission-link-content")).find((el) => visible(el) && !/completed/i.test(el.textContent));
        if (link) {
            lastMissionClick = Date.now();
            return click(link);
        }
        return false;
    }

    function battle() {
        const continueButton = firstVisible(".button-container .continue-button, .continue-button-container .continue-button");
        if (click(continueButton)) return true;
        const dismiss = firstVisible(".ui-overlay-content .modal.shown .dismiss-button");
        if (click(dismiss)) return true;
        if (pickChoice()) return true;
        const advance = buttonsByText(".advance-button", (text) => ["advance", "battle", "descend", "start"].some((word) => text.includes(word)));
        if (click(advance)) return true;
        const skip = buttonsByText(".skip-button, .skip-text", (text) => text.includes("skip"));
        return click(skip);
    }

    function tick() {
        ensurePanel();
        if (!running || document.hidden || Date.now() < busyUntil) return;
        if (useItemOrClaim()) return;
        if (createMission()) return;
        if (missionLoop()) return;
        battle();
    }

    function makeToggle(label, key, title) {
        const button = document.createElement("button");
        button.textContent = label;
        button.title = title;
        button.style.cssText = "width:34px;height:34px;border:1px solid #777;border-radius:8px;color:#fff;font-size:18px;background:#472b2b";
        const paint = () => button.style.background = CONFIG[key] ? "#245b37" : "#472b2b";
        paint();
        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            CONFIG[key] = !CONFIG[key];
            save(key);
            paint();
        });
        return button;
    }

    function ensurePanel() {
        if (!document.body || document.getElementById("ss-mobile-lite-panel")) return;
        const panel = document.createElement("div");
        panel.id = "ss-mobile-lite-panel";
        panel.style.cssText = "position:fixed;left:10px;top:45%;z-index:2147483647;display:flex;flex-wrap:wrap;gap:5px;max-width:160px;padding:7px;background:#181818;border:1px solid #666;border-radius:10px;box-shadow:0 2px 7px rgba(0,0,0,.4);touch-action:none";

        const play = document.createElement("button");
        play.style.cssText = "width:34px;height:34px;border:1px solid #777;border-radius:8px;color:#fff;font-size:18px";
        const paintPlay = () => {
            play.textContent = running ? "⏸" : "▶";
            play.style.background = running ? "#245b37" : "#472b2b";
        };
        paintPlay();
        play.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            event.stopPropagation();
            running = !running;
            localStorage.setItem("mobileLiteRunning", String(running));
            paintPlay();
        });

        panel.append(
            play,
            makeToggle("🥫", "skillAuto", "Automatic skill choices"),
            makeToggle("🏯", "shrineAuto", "Automatic shrine choices"),
            makeToggle("🗿", "monolithAuto", "Automatic monolith choices"),
            makeToggle("🛖", "houseAutoYes", "Choose Yes at the mysterious building"),
            makeToggle("👻", "miniBossAutoFight", "Fight dangerous creatures"),
            makeToggle("🗺️", "mapAutoCreate", "Automatic map creation"),
            makeToggle("🔄", "loopEnabled", "Automatically continue to another mission")
        );

        let dragId = null, dx = 0, dy = 0;
        panel.addEventListener("pointerdown", (event) => {
            if (event.target.closest("button")) return;
            dragId = event.pointerId;
            dx = event.clientX - panel.offsetLeft;
            dy = event.clientY - panel.offsetTop;
            try { panel.setPointerCapture(dragId); } catch (_) {}
        });
        panel.addEventListener("pointermove", (event) => {
            if (event.pointerId !== dragId) return;
            panel.style.left = `${Math.max(0, Math.min(event.clientX - dx, innerWidth - panel.offsetWidth))}px`;
            panel.style.top = `${Math.max(0, Math.min(event.clientY - dy, innerHeight - panel.offsetHeight))}px`;
        });
        panel.addEventListener("pointerup", () => { dragId = null; });
        panel.addEventListener("pointercancel", () => { dragId = null; });

        document.body.appendChild(panel);
    }

    if (location.hostname.includes("devvit.net")) {
        ensurePanel();
        setInterval(tick, CONFIG.tickMs);
    }
})();