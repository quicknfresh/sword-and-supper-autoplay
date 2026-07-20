// ==UserScript==
// @name         Sword & Supper Auto Play Mobile Lite
// @namespace    https://reddit.com/user/echo-foxtrot-delta/
// @version      3.16.17
// @description  Android-optimised Sword & Supper autoplay with working map creation and farming-gear equipping.
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
    let busyUntil = 0;
    let lastMissionClick = 0;
    let farmingBusy = false;

    const visible = (el) => !!el && el.offsetParent !== null && !el.disabled;
    const save = (key) => localStorage.setItem(key, JSON.stringify(CONFIG[key]));
    const firstVisible = (selector, root = document) => Array.from(root.querySelectorAll(selector)).find(visible);

    function click(el) {
        if (!visible(el)) return false;
        try { el.click(); return true; } catch (_) {}
        try {
            el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
            return true;
        } catch (_) { return false; }
    }

    function closestButton(el) {
        return el?.closest("button, .mission-create-submit-button") || el;
    }

    function pickChoice() {
        const heading = document.querySelector(".ui-panel-header")?.textContent.trim().toLowerCase() || "";
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
                const text = el.textContent.toLowerCase();
                return text.includes("lose") && text.includes("health");
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
            return click(choices.find((el) => CONFIG.houseAutoYes ? /^yes$/i.test(el.textContent.trim()) : /^no$/i.test(el.textContent.trim())));
        }

        if (heading.includes("dangerous creatures") && heading.includes("investigate")) {
            return click(choices.find((el) => CONFIG.miniBossAutoFight ? /fight/i.test(el.textContent) : /nope|no/i.test(el.textContent)));
        }

        return false;
    }

    function useMapItem() {
        if (!CONFIG.mapAutoCreate) return false;
        const modal = firstVisible(".item-modal-body");
        if (!modal || modal.dataset.mobileLiteBusy === "1") return false;

        const actions = modal.querySelector(".item-modal-actions");
        const useButton = actions ? Array.from(actions.querySelectorAll("button")).find(visible) : null;
        if (!useButton) return false;

        modal.dataset.mobileLiteBusy = "1";
        setTimeout(() => click(useButton), 350);
        setTimeout(() => { delete modal.dataset.mobileLiteBusy; }, 5000);
        busyUntil = Date.now() + 900;
        return true;
    }

    function claimReward() {
        const claim = Array.from(document.querySelectorAll(".claim-button")).find((el) => visible(el) && !el.classList.contains("inactive"));
        if (!claim || claim.dataset.mobileLiteBusy === "1") return false;
        claim.dataset.mobileLiteBusy = "1";
        click(claim);
        setTimeout(() => delete claim.dataset.mobileLiteBusy, 1200);
        return true;
    }

    function equipFarmingGear() {
        if (!CONFIG.autoFarmingGear || farmingBusy) return false;
        const grid = firstVisible(".virtual-items-grid");
        if (!grid) return false;
        if (firstVisible(".item-modal-body")) return false;

        const target = Array.from(grid.querySelectorAll("img.item-image")).find((img) =>
            visible(img) && img.alt && FARMING_TARGETS.some((name) => img.alt.includes(name))
        );
        if (!target) return false;

        farmingBusy = true;
        click(target);
        setTimeout(() => { farmingBusy = false; }, 3000);
        busyUntil = Date.now() + 900;
        return true;
    }

    function createMission() {
        if (!CONFIG.mapAutoCreate || Date.now() < busyUntil) return false;

        const container = firstVisible(".mission-create-container");
        if (container) {
            const scenario = container.querySelector(".randomize-scenario-section");
            if (scenario && scenario.dataset.mobileLiteBusy !== "1") {
                scenario.dataset.mobileLiteBusy = "1";
                const dice = container.querySelector(".autocomplete-button, img[alt*='Randomize']");
                if (dice) click(closestButton(dice));
                setTimeout(() => {
                    const image = container.querySelector("img[alt='Continue']");
                    const button = image ? closestButton(image) : container.querySelector(".mission-create-submit-button");
                    click(button);
                }, 1150);
                setTimeout(() => delete scenario.dataset.mobileLiteBusy, 3000);
                busyUntil = Date.now() + 1500;
                return true;
            }

            const foodSection = container.querySelector(".food-choices");
            if (foodSection && foodSection.dataset.mobileLiteBusy !== "1") {
                foodSection.dataset.mobileLiteBusy = "1";
                const foods = Array.from(container.querySelectorAll(".food-choice")).filter(visible);
                if (foods.length) click(foods[Math.floor(Math.random() * foods.length)]);
                setTimeout(() => {
                    const dice = container.querySelector(".autocomplete-button, img[alt*='Randomize']");
                    if (dice) click(closestButton(dice));
                }, 300);
                setTimeout(() => {
                    const image = container.querySelector("img[alt='Continue']");
                    const button = image ? closestButton(image) : container.querySelector(".mission-create-submit-button");
                    click(button);
                }, 700);
                setTimeout(() => delete foodSection.dataset.mobileLiteBusy, 3000);
                busyUntil = Date.now() + 1400;
                return true;
            }
        }

        const form = firstVisible("form.mission-create-form");
        if (!form || form.dataset.mobileLiteBusy === "1") return false;
        const input = form.querySelector("input[name='title']");
        const rows = Array.from(document.querySelectorAll(".mission-create-summary"));
        if (!input || !rows.length || document.activeElement === input) return false;

        let target = "", level = "", difficulty = "⭐⭐⭐", food = "";
        let bossRush = false;
        for (const row of rows) {
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
        }
        if (bossRush) difficulty = "BOSS RUSH";
        if (!target || !level) return false;

        const title = `Level ${level} ${difficulty} ${target} ${food}`.replace(/\s+/g, " ").trim();
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        if (setter) setter.call(input, title); else input.value = title;
        if (input._valueTracker) input._valueTracker.setValue("");
        input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));

        form.dataset.mobileLiteBusy = "1";
        setTimeout(() => {
            const redirect = form.querySelector("input#doRedirect");
            if (redirect?.checked) click(redirect);
        }, 500);
        setTimeout(() => {
            const image = form.querySelector("img[alt*='Create']");
            const button = image ? closestButton(image) : form.querySelector(".mission-create-submit-button");
            click(button);
        }, 1100);
        setTimeout(() => delete form.dataset.mobileLiteBusy, 4200);
        busyUntil = Date.now() + 1700;
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
        if (!link) return false;
        lastMissionClick = Date.now();
        return click(link);
    }

    function battle() {
        if (click(firstVisible(".button-container .continue-button, .continue-button-container .continue-button"))) return true;
        if (click(firstVisible(".ui-overlay-content .modal.shown .dismiss-button"))) return true;
        if (pickChoice()) return true;

        const advance = Array.from(document.querySelectorAll(".advance-button")).find((el) => {
            const text = el.textContent.trim().toLowerCase();
            return visible(el) && ["advance", "battle", "descend", "start"].some((word) => text.includes(word));
        });
        if (click(advance)) return true;

        return click(Array.from(document.querySelectorAll(".skip-button, .skip-text")).find((el) => visible(el) && /skip/i.test(el.textContent)));
    }

    function tick() {
        ensurePanel();
        if (!running || document.hidden || Date.now() < busyUntil) return;
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
            makeToggle("🧑‍🌾", "autoFarmingGear", "Automatic farming-gear equipping"),
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