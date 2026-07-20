// ==UserScript==
// @name         Sword & Supper Auto Play Mobile Lite
// @namespace    https://reddit.com/user/echo-foxtrot-delta/
// @version      3.16.18
// @description  Android-optimised autoplay with React-aware map creation and farming-gear equipping.
// @author       Eric; mobile optimisation by quicknfresh
// @match        *://*.reddit.com/*
// @match        *://*.devvit.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    const CONFIG = {
        tickMs: 850,
        skillAuto: JSON.parse(localStorage.getItem("skillAuto") || "true"),
        shrineAuto: JSON.parse(localStorage.getItem("shrineAuto") || "true"),
        monolithAuto: JSON.parse(localStorage.getItem("monolithAuto") || "true"),
        houseAutoYes: JSON.parse(localStorage.getItem("houseAutoYes") || "true"),
        miniBossAutoFight: JSON.parse(localStorage.getItem("miniBossAutoFight") || "true"),
        mapAutoCreate: JSON.parse(localStorage.getItem("mapAutoCreate") || "true"),
        autoFarmingGear: JSON.parse(localStorage.getItem("autoFarmingGear") || "false"),
        loopEnabled: JSON.parse(localStorage.getItem("loopEnabled") || "false"),
        preferredSkills: JSON.parse(localStorage.getItem("preferredSkills") || '["bolt on rage","heal on rage","add rage on heal"]'),
        shrinePriority: JSON.parse(localStorage.getItem("shrinePriority") || '["attack","crit rate","defense","hp","speed"]'),
        monolithPriority: JSON.parse(localStorage.getItem("monolithPriority") || '["attack","dodge rate","heal"]')
    };

    const FARMING_TARGETS = [
        "Wrathful Visor EX",
        "Sower's Lament Lvl 3", "Sower’s Lament Lvl 3",
        "Ember Droplet Ultimate",
        "Frostflake Band EX",
        "Recovery Vest EX",
        "Knife Collector's Belt Ultimate", "Knife Collector’s Belt Ultimate",
        "Map: Mountain Pass", "Map: Outer Temple", "Map: Forbidden City",
        "Map: Ruined Path", "Map: Seaside Cliffs"
    ];

    let running = localStorage.getItem("mobileLiteRunning") === "true";
    let nextActionAt = 0;
    let farmingBusy = false;
    let lastMissionClick = 0;

    const visible = (el) => !!el && el.offsetParent !== null && !el.disabled;
    const save = (key) => localStorage.setItem(key, JSON.stringify(CONFIG[key]));
    const firstVisible = (selector, root = document) => Array.from(root.querySelectorAll(selector)).find(visible);

    function reactClick(el) {
        if (!el || !visible(el)) return false;

        const clickable = el.closest?.("button, a, .mission-create-submit-button, .autocomplete-button, .food-choice, .skill-button-label") || el;

        const reactKey = Object.keys(clickable).find((key) =>
            key.startsWith("__reactProps$") || key.startsWith("__reactEventHandlers$")
        );
        const props = reactKey ? clickable[reactKey] : null;
        if (props && typeof props.onClick === "function") {
            try {
                props.onClick({
                    type: "click",
                    bubbles: true,
                    cancelable: true,
                    defaultPrevented: false,
                    isTrusted: false,
                    target: clickable,
                    currentTarget: clickable,
                    preventDefault() { this.defaultPrevented = true; },
                    stopPropagation() {},
                    nativeEvent: new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
                });
                return true;
            } catch (_) {}
        }

        try {
            clickable.click();
            return true;
        } catch (_) {}

        try {
            ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach((type) => {
                clickable.dispatchEvent(new MouseEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    view: window
                }));
            });
            return true;
        } catch (_) {
            return false;
        }
    }

    function useMapItem() {
        if (!CONFIG.mapAutoCreate) return false;
        const modal = firstVisible(".item-modal-body");
        if (!modal || modal.dataset.mobileMapBusy === "1") return false;

        const actions = modal.querySelector(".item-modal-actions");
        const useButton = actions ? Array.from(actions.querySelectorAll("button")).find(visible) : null;
        if (!useButton) return false;

        modal.dataset.mobileMapBusy = "1";
        setTimeout(() => reactClick(useButton), 400);
        setTimeout(() => delete modal.dataset.mobileMapBusy, 6000);
        nextActionAt = Date.now() + 1000;
        return true;
    }

    function createMission() {
        if (!CONFIG.mapAutoCreate || Date.now() < nextActionAt) return false;

        const container = document.querySelector(".mission-create-container");
        if (container && container.offsetParent !== null && container.dataset.mobileMapBusy !== "1") {
            const scenario = container.querySelector(".randomize-scenario-section");
            if (scenario && scenario.offsetParent !== null) {
                container.dataset.mobileMapBusy = "1";

                setTimeout(() => {
                    const diceImage = container.querySelector("img[alt*='Randomize']");
                    const diceButton = diceImage?.closest(".autocomplete-button, button") || container.querySelector(".autocomplete-button");
                    reactClick(diceButton);
                }, 350);

                setTimeout(() => {
                    const continueImage = container.querySelector("img[alt='Continue']");
                    const continueButton = continueImage?.closest(".mission-create-submit-button, button") || container.querySelector(".mission-create-submit-button");
                    reactClick(continueButton);
                }, 1700);

                setTimeout(() => delete container.dataset.mobileMapBusy, 4500);
                nextActionAt = Date.now() + 2200;
                return true;
            }

            const foodSection = container.querySelector(".food-choices");
            if (foodSection && foodSection.offsetParent !== null) {
                container.dataset.mobileMapBusy = "1";

                setTimeout(() => {
                    const foods = Array.from(container.querySelectorAll(".food-choice")).filter(visible);
                    if (foods.length) reactClick(foods[Math.floor(Math.random() * foods.length)]);
                }, 250);

                setTimeout(() => {
                    const diceImage = container.querySelector("img[alt*='Randomize']");
                    const diceButton = diceImage?.closest(".autocomplete-button, button") || container.querySelector(".autocomplete-button");
                    reactClick(diceButton);
                }, 700);

                setTimeout(() => {
                    const continueImage = container.querySelector("img[alt='Continue']");
                    const continueButton = continueImage?.closest(".mission-create-submit-button, button") || container.querySelector(".mission-create-submit-button");
                    reactClick(continueButton);
                }, 1500);

                setTimeout(() => delete container.dataset.mobileMapBusy, 4500);
                nextActionAt = Date.now() + 2100;
                return true;
            }
        }

        const form = document.querySelector("form.mission-create-form");
        if (!form || form.offsetParent === null || form.dataset.mobileMapBusy === "1") return false;

        const rows = Array.from(document.querySelectorAll(".mission-create-summary"));
        const input = form.querySelector("input[name='title']");
        if (!rows.length || !input || document.activeElement === input) return false;

        let target = "";
        let level = "";
        let difficulty = "⭐⭐⭐";
        let food = "";
        let bossRush = false;

        rows.forEach((row) => {
            const text = row.textContent.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim();
            if (text.toUpperCase().includes("BOSS RUSH")) bossRush = true;
            if (text.startsWith("Target:")) target = text.replace("Target:", "").trim();
            else if (text.includes("Rec. Level:")) level = text.split("Rec. Level:")[1].replace(/~/g, "-").replace(/\s+/g, "").trim();
            else if (text.startsWith("Food:")) food = text.replace("Food:", "").trim();
            else if (text.startsWith("Difficulty:")) {
                const goldStars = Array.from(row.querySelectorAll("span")).filter((span) => {
                    const style = span.getAttribute("style") || "";
                    return style.includes("gold") || span.style.color === "gold";
                });
                const textStars = text.match(/⭐|★|🌟/g);
                if (goldStars.length) difficulty = "⭐".repeat(goldStars.length);
                else if (textStars?.length) difficulty = "⭐".repeat(textStars.length);
            }
        });

        if (bossRush) difficulty = "BOSS RUSH";
        if (!target || !level) return false;

        const title = `Level ${level} ${difficulty} ${target} ${food}`.replace(/\s+/g, " ").trim();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(input, title);
        else input.value = title;
        if (input._valueTracker) input._valueTracker.setValue("");
        input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));

        form.dataset.mobileMapBusy = "1";

        setTimeout(() => {
            const redirect = form.querySelector("input#doRedirect");
            if (redirect?.checked) reactClick(redirect);
        }, 700);

        setTimeout(() => {
            const createImage = form.querySelector("img[alt*='Create']");
            const createButton = createImage?.closest(".mission-create-submit-button, button") || form.querySelector(".mission-create-submit-button");
            reactClick(createButton);
        }, 1800);

        setTimeout(() => delete form.dataset.mobileMapBusy, 5500);
        nextActionAt = Date.now() + 2400;
        return true;
    }

    function equipFarmingGear() {
        if (!CONFIG.autoFarmingGear || farmingBusy) return false;
        const grid = firstVisible(".virtual-items-grid");
        if (!grid || firstVisible(".item-modal-body")) return false;

        const target = Array.from(grid.querySelectorAll("img.item-image")).find((img) =>
            img.alt && FARMING_TARGETS.some((name) => img.alt.includes(name))
        );
        if (!target) return false;

        farmingBusy = true;
        reactClick(target);
        setTimeout(() => { farmingBusy = false; }, 3500);
        nextActionAt = Date.now() + 1100;
        return true;
    }

    function claimReward() {
        const button = Array.from(document.querySelectorAll(".claim-button")).find((el) =>
            visible(el) && !el.classList.contains("inactive") && el.dataset.mobileClaimBusy !== "1"
        );
        if (!button) return false;
        button.dataset.mobileClaimBusy = "1";
        reactClick(button);
        setTimeout(() => delete button.dataset.mobileClaimBusy, 1500);
        return true;
    }

    function pickChoice() {
        const heading = document.querySelector(".ui-panel-header")?.textContent.toLowerCase() || "";
        const choices = Array.from(document.querySelectorAll(".skill-button-label")).filter(visible);
        if (!choices.length) return false;

        if (CONFIG.shrineAuto && heading.includes("shrine")) {
            for (const stat of CONFIG.shrinePriority) {
                const choice = choices.find((el) => el.textContent.toLowerCase().includes(stat));
                if (choice) return reactClick(choice);
            }
            return reactClick(choices[0]);
        }

        if (heading.includes("choose a bonus")) {
            return reactClick(choices.find((el) => /attack/i.test(el.textContent)) || choices[0]);
        }

        if (CONFIG.monolithAuto && heading.includes("monolith")) {
            const loseHealth = choices.find((el) => /lose/i.test(el.textContent) && /health/i.test(el.textContent));
            return reactClick(loseHealth || choices.find((el) => /refuse/i.test(el.textContent)) || choices[0]);
        }

        if (CONFIG.skillAuto && (heading.includes("ancient machine") || heading.includes("selection of abilities"))) {
            for (const preferred of CONFIG.preferredSkills) {
                const choice = choices.find((el) => el.textContent.trim().toLowerCase() === preferred.toLowerCase());
                if (choice) return reactClick(choice);
            }
            return reactClick(choices[0]);
        }

        if (heading.includes("mysterious building")) {
            return reactClick(choices.find((el) => CONFIG.houseAutoYes ? /^yes$/i.test(el.textContent.trim()) : /^no$/i.test(el.textContent.trim())));
        }

        if (heading.includes("dangerous creatures") && heading.includes("investigate")) {
            return reactClick(choices.find((el) => CONFIG.miniBossAutoFight ? /fight/i.test(el.textContent) : /nope|no/i.test(el.textContent)));
        }

        return false;
    }

    function missionLoop() {
        if (!CONFIG.loopEnabled) return false;
        const end = document.querySelector(".end-mission-button:not([data-mobile-loop-clicked])");
        if (visible(end)) {
            end.dataset.mobileLoopClicked = "1";
            return reactClick(end);
        }
        if (Date.now() - lastMissionClick < 6000) return false;
        const link = Array.from(document.querySelectorAll(".mission-link-content")).find((el) => visible(el) && !/completed/i.test(el.textContent));
        if (!link) return false;
        lastMissionClick = Date.now();
        return reactClick(link);
    }

    function battle() {
        if (reactClick(firstVisible(".button-container .continue-button, .continue-button-container .continue-button"))) return true;
        if (reactClick(firstVisible(".ui-overlay-content .modal.shown .dismiss-button"))) return true;
        if (pickChoice()) return true;

        const advance = Array.from(document.querySelectorAll(".advance-button")).find((el) => {
            const text = el.textContent.trim().toLowerCase();
            return visible(el) && ["advance", "battle", "descend", "start"].some((word) => text.includes(word));
        });
        if (reactClick(advance)) return true;

        const skip = Array.from(document.querySelectorAll(".skip-button, .skip-text")).find((el) => visible(el) && /skip/i.test(el.textContent));
        return reactClick(skip);
    }

    function tick() {
        ensurePanel();
        if (!running || Date.now() < nextActionAt) return;
        if (useMapItem()) return;
        if (claimReward()) return;
        if (equipFarmingGear()) return;
        if (createMission()) return;
        if (missionLoop()) return;
        battle();
    }

    function makeToggle(label, key, title) {
        const button = document.createElement("button");
        button.textContent = label;
        button.title = title;
        button.style.cssText = "width:34px;height:34px;border:1px solid #777;border-radius:8px;color:#fff;font-size:18px";
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
            makeToggle("🧑‍🌾", "autoFarmingGear", "Automatic farming-gear equipping"),
            makeToggle("🔄", "loopEnabled", "Automatically continue to another mission")
        );

        let dragId = null;
        let offsetX = 0;
        let offsetY = 0;

        panel.addEventListener("pointerdown", (event) => {
            if (event.target.closest("button")) return;
            dragId = event.pointerId;
            offsetX = event.clientX - panel.offsetLeft;
            offsetY = event.clientY - panel.offsetTop;
            try { panel.setPointerCapture(dragId); } catch (_) {}
        });

        panel.addEventListener("pointermove", (event) => {
            if (event.pointerId !== dragId) return;
            panel.style.left = `${Math.max(0, Math.min(event.clientX - offsetX, innerWidth - panel.offsetWidth))}px`;
            panel.style.top = `${Math.max(0, Math.min(event.clientY - offsetY, innerHeight - panel.offsetHeight))}px`;
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