// ==UserScript==
// @name         Sword & Supper Auto Play v3.16.15 (Firefox Android Fix)
// @namespace    https://reddit.com/user/echo-foxtrot-delta/
// @version      3.16.15
// @description  Full Autoplay + Memory + Item-Use + Mission Auto-Creation + Auto-Claim + Auto-Farming Gear, with Firefox Android touch and startup fixes.
// @author       Eric
// @match        *://*.reddit.com/*
// @match        *://*.devvit.net/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    const CONFIG = {
        clickInterval: 500,
        preferredSkills: JSON.parse(localStorage.getItem("preferredSkills") || '["bolt on rage","heal on rage","add rage on heal"]'),
        shrinePriority: JSON.parse(localStorage.getItem("shrinePriority") || '["attack","crit rate","defense","hp","speed"]'),
        houseAutoYes: JSON.parse(localStorage.getItem("houseAutoYes") || "true"),
        monolithPriority: JSON.parse(localStorage.getItem("monolithPriority") || '["attack","dodge rate","heal"]'),
        miniBossAutoFight: JSON.parse(localStorage.getItem("miniBossAutoFight") || "true"),
        skillAuto: JSON.parse(localStorage.getItem("skillAuto") || "true"),
        shrineAuto: JSON.parse(localStorage.getItem("shrineAuto") || "true"),
        monolithAuto: JSON.parse(localStorage.getItem("monolithAuto") || "true"),
        loopEnabled: JSON.parse(localStorage.getItem("loopEnabled") || "false"),
        mapAutoCreate: JSON.parse(localStorage.getItem("mapAutoCreate") || "true"),
        autoFarmingGear: JSON.parse(localStorage.getItem("autoFarmingGear") || "false"),
        log: true,
    };

    let running = false;
    let intervalId = null;
    const log = (msg) => CONFIG.log && console.log(`[Sword&Supper] ${msg}`);

    // ========================================================
    // GENERIC "WAIT UNTIL READY" POLLER
    // ========================================================
    const waitFor = (conditionFn, callback, timeoutMs = 5000, intervalMs = 200) => {
        const start = Date.now();
        const check = () => {
            let ok = false;
            try { ok = !!conditionFn(); } catch (e) { ok = false; }

            if (ok) {
                callback(true);
                return;
            }

            if (Date.now() - start > timeoutMs) {
                log("waitFor: timed out waiting for condition, proceeding anyway.");
                callback(false);
                return;
            }

            setTimeout(check, intervalMs);
        };

        check();
    };

    // ========================================================
    // ULTIMATE ANTI-BOT CLICKER
    // ========================================================
    const smartClick = (el) => {
        if (!el) return;

        if (
            el.tagName &&
            el.tagName.toLowerCase() === "a" &&
            el.href &&
            !el.href.startsWith("javascript:")
        ) {
            window.location.href = el.href;
            return;
        }

        const reactKey = Object.keys(el).find(
            (key) =>
                key.startsWith("__reactProps$") ||
                key.startsWith("__reactEventHandlers$")
        );

        if (
            reactKey &&
            el[reactKey] &&
            typeof el[reactKey].onClick === "function"
        ) {
            try {
                el[reactKey].onClick({
                    isTrusted: true,
                    preventDefault: () => {},
                    stopPropagation: () => {},
                    target: el,
                    currentTarget: el,
                    nativeEvent: { isTrusted: true },
                });

                return;
            } catch (err) {}
        }

        try {
            el.focus();

            el.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true,
                })
            );

            el.dispatchEvent(
                new KeyboardEvent("keyup", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    bubbles: true,
                    cancelable: true,
                })
            );
        } catch (e) {}

        ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(
            (type) => {
                el.dispatchEvent(
                    new MouseEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                    })
                );
            }
        );
    };

    function detectModalAndOpen() {
        const observer = new MutationObserver(() => {
            const modal = document.querySelector("rpl-modal-card");

            if (modal) {
                const iframe = modal.querySelector(
                    "devvit-blocks-web-view[src]"
                );

                if (iframe && iframe.src.includes("devvit.net")) {
                    observer.disconnect();
                    log("Detected Sword & Supper modal.");
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    function runAutomation() {
        const clickAdvance = () => {
            const btn = Array.from(
                document.querySelectorAll(".advance-button")
            ).find((b) => {
                const text = b.textContent.trim().toLowerCase();

                return (
                    (text.includes("advance") ||
                        text.includes("battle") ||
                        text.includes("descend") ||
                        text.includes("start")) &&
                    b.offsetParent !== null &&
                    !b.disabled
                );
            });

            if (btn) smartClick(btn);
        };

        const clickSkip = () => {
            const btn = Array.from(
                document.querySelectorAll(".skip-button, .skip-text")
            ).find(
                (b) =>
                    b.textContent.trim().toLowerCase().includes("skip") &&
                    b.offsetParent !== null &&
                    !b.disabled
            );

            if (btn) smartClick(btn);
        };

        const clickEndMission = () => {
            if (!CONFIG.loopEnabled) return;

            const btn = document.querySelector(
                ".end-mission-button:not([data-loop-clicked])"
            );

            if (btn && btn.offsetParent !== null) {
                btn.dataset.loopClicked = "true";
                log("Loop: mission ended, clicking end-mission-button (once).");
                smartClick(btn);
            }
        };

        let lastMissionLinkClickTime = 0;
        const MISSION_LINK_COOLDOWN_MS = 6000;

        const clickMissionLink = () => {
            if (!CONFIG.loopEnabled) return;

            if (
                Date.now() - lastMissionLinkClickTime <
                MISSION_LINK_COOLDOWN_MS
            ) {
                return;
            }

            let seenMissions = JSON.parse(
                localStorage.getItem("seenMissions") || "[]"
            );

            const allLinks = Array.from(
                document.querySelectorAll(".mission-link-content")
            );

            const availableLinks = allLinks.filter((link) => {
                const missionTitle = link.textContent.trim();

                const isVisuallyCompleted =
                    link.classList.contains("completed") ||
                    link.classList.contains("done") ||
                    missionTitle.toLowerCase().includes("completed");

                return (
                    !seenMissions.includes(missionTitle) &&
                    !isVisuallyCompleted
                );
            });

            const targetLink = availableLinks[0];

            if (targetLink && targetLink.offsetParent !== null) {
                const missionTitle = targetLink.textContent.trim();

                seenMissions.push(missionTitle);

                if (seenMissions.length > 50) {
                    seenMissions.shift();
                }

                localStorage.setItem(
                    "seenMissions",
                    JSON.stringify(seenMissions)
                );

                lastMissionLinkClickTime = Date.now();

                log(`Loop: picking new mission: ${missionTitle}`);
                smartClick(targetLink);
            }
        };

        setInterval(() => {
            clickEndMission();
            clickMissionLink();
        }, 500);

        // ========================================================
        // STAGE 0: ITEM USE MODAL
        // ========================================================
        const autoUseMapItem = () => {
            if (!CONFIG.mapAutoCreate) return;

            const modal = document.querySelector(".item-modal-body");

            if (!modal || modal.offsetParent === null) return;
            if (modal.dataset.processing === "true") return;

            const actions = modal.querySelector(".item-modal-actions");

            if (!actions) return;

            const useBtn = actions.querySelector("button");

            if (!useBtn || useBtn.offsetParent === null) return;

            const titleEl = modal.querySelector(
                ".item-title, .item-modal-title, .item-name, h1, h2, h3"
            );

            const itemName = titleEl
                ? titleEl.textContent.trim()
                : "(unknown item)";

            modal.dataset.processing = "true";

            log(
                `Item Modal detected: "${itemName}". Pausing before clicking Use/Equip...`
            );

            setTimeout(() => {
                smartClick(useBtn);
                log(`Clicked Use/Equip on "${itemName}".`);

                waitFor(
                    () =>
                        document.querySelector(
                            ".randomize-scenario-section"
                        ) !== null,
                    () => {
                        modal.dataset.processing = "false";
                    },
                    6000
                );
            }, 400);
        };

        setInterval(autoUseMapItem, 400);

        // ========================================================
        // AUTO CLAIM REWARDS
        // ========================================================
        const autoClaimRewards = () => {
            const buttons = Array.from(
                document.querySelectorAll(".claim-button")
            );

            const activeClaimBtn = buttons.find(
                (btn) =>
                    !btn.disabled &&
                    !btn.classList.contains("inactive") &&
                    btn.offsetParent !== null
            );

            if (
                activeClaimBtn &&
                activeClaimBtn.dataset.processing !== "true"
            ) {
                activeClaimBtn.dataset.processing = "true";

                log("Active claim button found. Clicking...");
                smartClick(activeClaimBtn);

                setTimeout(() => {
                    if (activeClaimBtn) {
                        activeClaimBtn.dataset.processing = "false";
                    }
                }, 100);
            }
        };

        setInterval(autoClaimRewards, 500);

        // ========================================================
        // AUTO FARMING GEAR EQUIPPER
        // ========================================================
        let isEquippingFarmingGear = false;

        const autoEquipFarmingGears = () => {
            if (
                !CONFIG.autoFarmingGear ||
                isEquippingFarmingGear
            ) {
                return;
            }

            const grid = document.querySelector(".virtual-items-grid");

            if (!grid || grid.offsetParent === null) return;

            const modal = document.querySelector(".item-modal-body");

            if (modal && modal.offsetParent !== null) return;

            const targetGears = [
                "Wrathful Visor EX",
                "Sower's Lament Lvl 3",
                "Sower’s Lament Lvl 3",
                "Ember Droplet Ultimate",
                "Frostflake Band EX",
                "Recovery Vest EX",
                "Knife Collector's Belt Ultimate",
                "Knife Collector’s Belt Ultimate",
                "Map: Mountain Pass",
                "Map: Outer Temple",
                "Map: Forbidden City",
                "Map: Ruined Path",
                "Map: Seaside Cliffs",
            ];

            const allGridItems = Array.from(
                grid.querySelectorAll("img.item-image")
            );

            const foundGear = allGridItems.find((img) => {
                if (!img.alt) return false;

                return targetGears.some((target) =>
                    img.alt.includes(target)
                );
            });

            if (foundGear) {
                isEquippingFarmingGear = true;

                log(
                    `Farming Gear: Found "${foundGear.alt}", clicking to equip...`
                );

                smartClick(foundGear);

                setTimeout(() => {
                    isEquippingFarmingGear = false;
                }, 2500);
            }
        };

        setInterval(autoEquipFarmingGears, 1000);

        // ========================================================
        // MULTI-STAGE MISSION CREATION
        // ========================================================
        const autoFillMission = () => {
            if (!CONFIG.mapAutoCreate) return;

            const container = document.querySelector(
                ".mission-create-container"
            );

            if (
                container &&
                container.offsetParent !== null &&
                container.dataset.processing !== "true"
            ) {
                const scenarioSection = container.querySelector(
                    ".randomize-scenario-section"
                );

                if (
                    scenarioSection &&
                    !scenarioSection.dataset.isProcessing
                ) {
                    scenarioSection.dataset.isProcessing = "true";
                    container.dataset.processing = "true";

                    log(
                        "Mission Creation [Stage 1]: Scenario Screen detected."
                    );

                    setTimeout(() => {
                        const diceBtn = container.querySelector(
                            '.autocomplete-button, img[alt*="Randomize"]'
                        );

                        if (diceBtn) {
                            smartClick(diceBtn);
                            log("Clicked Scenario Randomize Dice.");
                        }

                        setTimeout(() => {
                            const continueImg = container.querySelector(
                                'img[alt="Continue"]'
                            );

                            const continueBtn = continueImg
                                ? continueImg.closest(
                                      ".mission-create-submit-button, button"
                                  )
                                : container.querySelector(
                                      ".mission-create-submit-button"
                                  );

                            if (continueBtn) {
                                smartClick(continueBtn);
                                log("Clicked Continue.");
                            }

                            setTimeout(() => {
                                container.dataset.processing = "false";
                            }, 800);
                        }, 1200);
                    }, 400);

                    return;
                }

                const foodChoicesSection =
                    container.querySelector(".food-choices");

                if (
                    foodChoicesSection &&
                    !foodChoicesSection.dataset.isProcessing
                ) {
                    foodChoicesSection.dataset.isProcessing = "true";
                    container.dataset.processing = "true";

                    log(
                        "Mission Creation [Stage 2]: Food Screen detected."
                    );

                    setTimeout(() => {
                        const foods =
                            container.querySelectorAll(".food-choice");

                        if (foods.length > 0) {
                            const randomFood =
                                foods[
                                    Math.floor(
                                        Math.random() * foods.length
                                    )
                                ];

                            smartClick(randomFood);
                            log("Selected random food.");
                        }

                        setTimeout(() => {
                            const diceBtn = container.querySelector(
                                '.autocomplete-button, img[alt*="Randomize"]'
                            );

                            if (diceBtn) {
                                smartClick(diceBtn);
                                log("Clicked Food Randomize Dice.");
                            }

                            setTimeout(() => {
                                const continueImg =
                                    container.querySelector(
                                        'img[alt="Continue"]'
                                    );

                                const continueBtn = continueImg
                                    ? continueImg.closest(
                                          ".mission-create-submit-button, button"
                                      )
                                    : container.querySelector(
                                          ".mission-create-submit-button"
                                      );

                                if (continueBtn) {
                                    smartClick(continueBtn);
                                    log("Clicked Continue.");
                                }

                                setTimeout(() => {
                                    container.dataset.processing =
                                        "false";
                                }, 800);
                            }, 250);
                        }, 250);
                    }, 250);

                    return;
                }
            }

            const form = document.querySelector(
                "form.mission-create-form"
            );

            if (
                form &&
                form.offsetParent !== null &&
                form.dataset.processing !== "true"
            ) {
                const summaryRows = document.querySelectorAll(
                    ".mission-create-summary"
                );

                if (summaryRows.length > 0) {
                    const input = form.querySelector(
                        'input[name="title"]'
                    );

                    if (!input) return;
                    if (document.activeElement === input) return;

                    let targetText = "";
                    let levelText = "";
                    let diffText = "⭐⭐⭐";
                    let foodText = "";
                    let isBossRush = false;

                    summaryRows.forEach((row) => {
                        const text = row.textContent
                            .replace(/[\n\r]+/g, " ")
                            .replace(/\s+/g, " ")
                            .trim();

                        if (
                            text
                                .toUpperCase()
                                .includes("BOSS RUSH")
                        ) {
                            isBossRush = true;
                        }

                        if (text.startsWith("Target:")) {
                            targetText = text
                                .replace("Target:", "")
                                .trim();
                        } else if (
                            text.includes("Rec. Level:")
                        ) {
                            levelText = text
                                .split("Rec. Level:")[1]
                                .replace(/~/g, "-")
                                .replace(/\s+/g, "")
                                .trim();
                        } else if (text.startsWith("Food:")) {
                            foodText = text
                                .replace("Food:", "")
                                .trim();
                        } else if (
                            text.startsWith("Difficulty:")
                        ) {
                            const goldStars = Array.from(
                                row.querySelectorAll("span")
                            ).filter((span) => {
                                const style =
                                    span.getAttribute("style") || "";

                                return (
                                    style.includes("gold") ||
                                    span.style.color === "gold"
                                );
                            });

                            if (goldStars.length > 0) {
                                diffText = "⭐".repeat(
                                    goldStars.length
                                );
                            } else {
                                const rawDiff = text
                                    .split("Difficulty:")[1]
                                    .trim();

                                const starMatch =
                                    rawDiff.match(/⭐|★|🌟/g);

                                if (
                                    starMatch &&
                                    starMatch.length > 0
                                ) {
                                    diffText = "⭐".repeat(
                                        starMatch.length
                                    );
                                } else if (
                                    rawDiff.length > 0
                                ) {
                                    diffText = rawDiff;
                                }
                            }
                        }
                    });

                    if (isBossRush) {
                        diffText = "BOSS RUSH";
                    }

                    if (!targetText || !levelText) return;

                    const finalStr =
                        `Level ${levelText} ${diffText} ${targetText} ${foodText}`
                            .replace(/\s+/g, " ")
                            .trim();

                    if (input.value !== finalStr) {
                        const nativeInputValueSetter =
                            Object.getOwnPropertyDescriptor(
                                window.HTMLInputElement.prototype,
                                "value"
                            )?.set;

                        if (nativeInputValueSetter) {
                            nativeInputValueSetter.call(
                                input,
                                finalStr
                            );
                        } else {
                            input.value = finalStr;
                        }

                        if (input._valueTracker) {
                            input._valueTracker.setValue("");
                        }

                        input.dispatchEvent(
                            new Event("input", {
                                bubbles: true,
                                composed: true,
                            })
                        );

                        input.dispatchEvent(
                            new Event("change", {
                                bubbles: true,
                                composed: true,
                            })
                        );
                    }

                    form.dataset.processing = "true";

                    log(
                        "Mission Creation [Stage 3]: Summary Screen detected."
                    );

                    setTimeout(() => {
                        const checkbox = form.querySelector(
                            "input#doRedirect"
                        );

                        if (
                            checkbox &&
                            checkbox.checked
                        ) {
                            smartClick(checkbox);

                            log(
                                "Unticked 'Take me directly' checkbox."
                            );
                        }

                        setTimeout(() => {
                            const createImg = form.querySelector(
                                'img[alt*="Create"]'
                            );

                            const createBtn = createImg
                                ? createImg.closest(
                                      ".mission-create-submit-button"
                                  )
                                : form.querySelector(
                                      ".mission-create-submit-button"
                                  );

                            if (createBtn) {
                                smartClick(createBtn);

                                log(
                                    "Clicked 'CREATE' button."
                                );
                            }

                            setTimeout(() => {
                                form.dataset.processing = "false";
                            }, 3000);
                        }, 800);
                    }, 800);
                }
            }
        };

        setInterval(autoFillMission, 300);

        const pickSkill = () => {
            const header =
                document.querySelector(".ui-panel-header");

            const headerText = header
                ? header.textContent.toLowerCase()
                : "";

            if (
                CONFIG.shrineAuto &&
                headerText.includes("shrine")
            ) {
                const shrineSkills = Array.from(
                    document.querySelectorAll(
                        ".ui-panel-content-skills .skill-button-label"
                    )
                ).filter((button) =>
                    /increase/i.test(button.textContent)
                );

                if (shrineSkills.length > 0) {
                    for (const stat of CONFIG.shrinePriority) {
                        const match = shrineSkills.find(
                            (button) =>
                                button.textContent
                                    .toLowerCase()
                                    .includes(
                                        stat.toLowerCase()
                                    )
                        );

                        if (match) {
                            smartClick(match);
                            return;
                        }
                    }

                    smartClick(shrineSkills[0]);
                    return;
                }
            }

            if (headerText.includes("choose a bonus")) {
                const bonusButtons = Array.from(
                    document.querySelectorAll(
                        ".skill-button-label"
                    )
                );

                if (bonusButtons.length > 0) {
                    const attackBonus = bonusButtons.find(
                        (button) =>
                            button.textContent
                                .toLowerCase()
                                .includes("attack")
                    );

                    if (attackBonus) {
                        smartClick(attackBonus);
                    } else {
                        smartClick(bonusButtons[0]);
                    }

                    return;
                }
            }

            if (
                CONFIG.monolithAuto &&
                headerText.includes("monolith")
            ) {
                const monolithOptions = Array.from(
                    document.querySelectorAll(
                        ".skill-button-label"
                    )
                );

                if (monolithOptions.length > 0) {
                    const loseHealthMatch =
                        monolithOptions.find(
                            (button) =>
                                button.textContent
                                    .toLowerCase()
                                    .includes("lose") &&
                                button.textContent
                                    .toLowerCase()
                                    .includes("health")
                        );

                    if (loseHealthMatch) {
                        smartClick(loseHealthMatch);
                        return;
                    }

                    const refuse = monolithOptions.find(
                        (button) =>
                            /refuse/i.test(
                                button.textContent
                            )
                    );

                    if (refuse) smartClick(refuse);
                }

                return;
            }

            if (
                CONFIG.skillAuto &&
                (headerText.includes("ancient machine") ||
                    headerText.includes(
                        "selection of abilities"
                    ))
            ) {
                const skillButtons = Array.from(
                    document.querySelectorAll(
                        ".skill-button-label"
                    )
                );

                if (skillButtons.length > 0) {
                    for (
                        const pref of CONFIG.preferredSkills
                    ) {
                        const match = skillButtons.find(
                            (button) =>
                                button.textContent
                                    .trim()
                                    .toLowerCase() ===
                                pref.toLowerCase()
                        );

                        if (match) {
                            smartClick(match);
                            return;
                        }
                    }

                    smartClick(skillButtons[0]);
                    return;
                }
            }

            const houseHeader =
                document.querySelector(".ui-panel-header");

            if (
                houseHeader &&
                /mysterious building/i.test(
                    houseHeader.textContent
                )
            ) {
                const yesBtn = Array.from(
                    document.querySelectorAll(
                        ".skill-button-label"
                    )
                ).find((button) =>
                    /yes/i.test(button.textContent)
                );

                const noBtn = Array.from(
                    document.querySelectorAll(
                        ".skill-button-label"
                    )
                ).find((button) =>
                    /no/i.test(button.textContent)
                );

                if (
                    CONFIG.houseAutoYes &&
                    yesBtn
                ) {
                    smartClick(yesBtn);
                } else if (
                    !CONFIG.houseAutoYes &&
                    noBtn
                ) {
                    smartClick(noBtn);
                }

                return;
            }

            if (
                headerText.includes(
                    "dangerous creatures"
                ) &&
                headerText.includes("investigate?")
            ) {
                const fightBtn = Array.from(
                    document.querySelectorAll(
                        ".skill-button-label"
                    )
                ).find((button) =>
                    /fight/i.test(button.textContent)
                );

                const nopeBtn = Array.from(
                    document.querySelectorAll(
                        ".skill-button-label"
                    )
                ).find((button) =>
                    /nope/i.test(button.textContent)
                );

                if (
                    CONFIG.miniBossAutoFight &&
                    fightBtn
                ) {
                    smartClick(fightBtn);
                } else if (
                    !CONFIG.miniBossAutoFight &&
                    nopeBtn
                ) {
                    smartClick(nopeBtn);
                }

                return;
            }
        };

        const startAutomation = () => {
            if (running) return;

            clearInterval(intervalId);
            running = true;

            intervalId = setInterval(() => {
                const continueBtn =
                    document.querySelector(
                        ".button-container .continue-button, .continue-button-container .continue-button"
                    );

                if (
                    continueBtn &&
                    continueBtn.offsetParent !== null
                ) {
                    smartClick(continueBtn);
                    stopAutomation();
                    return;
                }

                const difficultModal =
                    document.querySelector(
                        ".ui-overlay-content .modal.shown .dismiss-button"
                    );

                if (
                    difficultModal &&
                    difficultModal.offsetParent !== null
                ) {
                    smartClick(difficultModal);
                }

                pickSkill();
                clickAdvance();
                clickSkip();
            }, CONFIG.clickInterval);
        };

        const stopAutomation = () => {
            if (!running) return;

            clearInterval(intervalId);
            running = false;
        };

        // ========================================================
        // DYNAMIC UI CSS
        // ========================================================
        const btnStyle =
            document.createElement("style");

        btnStyle.innerHTML = `
            #ios-ui-panel-wrapper {
                --panel-scale: 1;
            }

            #ios-ui-panel-wrapper,
            #ios-ui-panel-wrapper * {
                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    "Segoe UI",
                    Roboto,
                    Helvetica,
                    Arial,
                    sans-serif !important;
            }

            .ios-btn {
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 0 !important;
                background: linear-gradient(
                    135deg,
                    rgba(255,255,255,0.45) 0%,
                    rgba(255,255,255,0.08) 45%,
                    rgba(255,255,255,0.02) 100%
                ) !important;
                border:
                    calc(1px * var(--panel-scale))
                    solid rgba(255,255,255,0.35) !important;
                border-radius:
                    calc(10px * var(--panel-scale)) !important;
                width:
                    calc(34px * var(--panel-scale)) !important;
                height:
                    calc(34px * var(--panel-scale)) !important;
                font-size:
                    calc(18px * var(--panel-scale)) !important;
                box-shadow:
                    inset 0 calc(1px * var(--panel-scale)) 0
                        rgba(255,255,255,0.95),
                    inset 0 calc(-1.5px * var(--panel-scale))
                        calc(3px * var(--panel-scale))
                        rgba(0,0,0,0.25),
                    inset calc(1px * var(--panel-scale)) 0
                        calc(1px * var(--panel-scale))
                        rgba(255,255,255,0.25),
                    0 calc(2px * var(--panel-scale))
                        calc(5px * var(--panel-scale))
                        rgba(0,0,0,0.18) !important;
                color: rgba(255,255,255,0.95) !important;
                text-shadow:
                    0 calc(1px * var(--panel-scale))
                    calc(2px * var(--panel-scale))
                    rgba(0,0,0,0.25) !important;
                box-sizing: border-box !important;
                transition:
                    background 0.2s,
                    box-shadow 0.2s !important;
                flex-shrink: 0 !important;
                touch-action: manipulation !important;
            }

            .ios-btn:active {
                box-shadow:
                    inset 0 calc(1px * var(--panel-scale))
                        calc(4px * var(--panel-scale))
                        rgba(0,0,0,0.3),
                    inset 0 calc(-1px * var(--panel-scale)) 0
                        rgba(255,255,255,0.4) !important;
            }

            .ios-resize-handle {
                position: absolute;
                right: 0;
                bottom: 0;
                width:
                    calc(20px * var(--panel-scale));
                height:
                    calc(20px * var(--panel-scale));
                cursor: nwse-resize;
                z-index: 10;
                opacity: 0.6;
                touch-action: none;
            }

            .ios-resize-handle::after {
                content: "";
                position: absolute;
                right:
                    calc(4px * var(--panel-scale));
                bottom:
                    calc(4px * var(--panel-scale));
                width:
                    calc(7px * var(--panel-scale));
                height:
                    calc(7px * var(--panel-scale));
                border-right:
                    calc(2px * var(--panel-scale))
                    solid rgba(255,255,255,0.8);
                border-bottom:
                    calc(2px * var(--panel-scale))
                    solid rgba(255,255,255,0.8);
            }

            .ios-editor-panel {
                position: absolute;
                top: calc(100% + 10px);
                left: 10px;
                padding:
                    calc(14px * var(--panel-scale));
                background: rgba(20,20,20,0.85);
                backdrop-filter:
                    blur(12px) saturate(150%);
                -webkit-backdrop-filter:
                    blur(12px) saturate(150%);
                border:
                    calc(1px * var(--panel-scale))
                    solid rgba(255,255,255,0.15);
                border-radius:
                    calc(16px * var(--panel-scale));
                box-shadow:
                    0 calc(10px * var(--panel-scale))
                        calc(30px * var(--panel-scale))
                        rgba(0,0,0,0.5);
                width:
                    min(
                        calc(260px * var(--panel-scale)),
                        calc(100vw - 40px)
                    );
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap:
                    calc(10px * var(--panel-scale));
            }

            .ios-editor-label {
                font-weight: 600;
                font-size:
                    calc(13px * var(--panel-scale));
                color: rgba(255,255,255,0.95);
            }

            .ios-textarea {
                width: 100%;
                height:
                    calc(85px * var(--panel-scale));
                font-size:
                    calc(11px * var(--panel-scale));
                font-family:
                    ui-monospace,
                    SFMono-Regular,
                    Menlo,
                    Monaco,
                    Consolas,
                    monospace !important;
                line-height: 1.5;
                resize: vertical;
                box-sizing: border-box;
                border-radius:
                    calc(8px * var(--panel-scale));
                background: rgba(0,0,0,0.3);
                color: #fff;
                border:
                    calc(1px * var(--panel-scale))
                    solid rgba(255,255,255,0.1);
                padding:
                    calc(10px * var(--panel-scale));
                outline: none;
            }

            .ios-editor-btn-row {
                display: flex;
                justify-content: flex-end;
                gap:
                    calc(8px * var(--panel-scale));
            }

            .ios-editor-btn {
                cursor: pointer;
                border: none;
                outline: none;
                padding:
                    calc(6px * var(--panel-scale))
                    calc(14px * var(--panel-scale));
                border-radius:
                    calc(8px * var(--panel-scale));
                font-size:
                    calc(12px * var(--panel-scale));
                font-weight: 600;
                color: white;
                touch-action: manipulation;
            }

            .ios-editor-btn.save {
                background:
                    rgba(48,209,88,0.9);
            }

            .ios-editor-btn.close {
                background:
                    rgba(255,255,255,0.2);
            }
        `;

        document.head.appendChild(btnStyle);

        const createPanel = () => {
            if (
                !document.body ||
                document.querySelector(
                    "#ios-ui-panel-wrapper"
                )
            ) {
                return;
            }

            const wrapper =
                document.createElement("div");

            wrapper.id = "ios-ui-panel-wrapper";

            let currentScale =
                parseFloat(
                    localStorage.getItem("panelScale")
                ) || 1;

            wrapper.style.setProperty(
                "--panel-scale",
                currentScale
            );

            Object.assign(wrapper.style, {
                position: "fixed",
                zIndex: "2147483647",
                display: "inline-block",
                padding:
                    "calc(8px * var(--panel-scale)) calc(12px * var(--panel-scale))",
                maxWidth: "calc(100vw - 16px)",
                boxSizing: "border-box",
            });

            let savedPos = null;

            try {
                savedPos = JSON.parse(
                    localStorage.getItem(
                        "panelPosition"
                    )
                );
            } catch (e) {
                savedPos = null;
            }

            if (savedPos) {
                wrapper.style.left = savedPos.left;
                wrapper.style.top = savedPos.top;
            } else {
                wrapper.style.left = "8px";
                wrapper.style.top = "45%";
            }

            const clearBackground =
                document.createElement("div");

            Object.assign(clearBackground.style, {
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                zIndex: "1",
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.15))",
                backdropFilter: "contrast(1.02)",
                webkitBackdropFilter:
                    "contrast(1.02)",
                borderRadius:
                    "calc(20px * var(--panel-scale))",
                border:
                    "calc(1px * var(--panel-scale)) solid rgba(255,255,255,0.35)",
                boxShadow:
                    "0 calc(8px * var(--panel-scale)) calc(25px * var(--panel-scale)) rgba(0,0,0,0.4)",
            });

            wrapper.appendChild(clearBackground);

            const content =
                document.createElement("div");

            Object.assign(content.style, {
                position: "relative",
                zIndex: "2",
                display: "flex",
                flexWrap: "wrap",
                maxWidth:
                    "min(calc(410px * var(--panel-scale)), calc(100vw - 40px))",
                gap:
                    "calc(6px * var(--panel-scale))",
                alignItems: "center",
            });

            wrapper.appendChild(content);

            let dragPointerId = null;
            let winOffsetX = 0;
            let winOffsetY = 0;

            wrapper.style.touchAction = "none";

            const finishDragging = (event) => {
                if (
                    dragPointerId === null ||
                    (event.pointerId !== undefined &&
                        event.pointerId !==
                            dragPointerId)
                ) {
                    return;
                }

                localStorage.setItem(
                    "panelPosition",
                    JSON.stringify({
                        left: wrapper.style.left,
                        top: wrapper.style.top,
                    })
                );

                try {
                    wrapper.releasePointerCapture(
                        dragPointerId
                    );
                } catch (e) {}

                dragPointerId = null;
            };

            wrapper.addEventListener(
                "pointerdown",
                (event) => {
                    if (
                        !event.isPrimary ||
                        event.button > 0
                    ) {
                        return;
                    }

                    if (
                        event.target.closest(
                            "button, input, textarea, .ios-resize-handle, .ios-editor-panel"
                        )
                    ) {
                        return;
                    }

                    dragPointerId = event.pointerId;

                    winOffsetX =
                        event.clientX -
                        wrapper.offsetLeft;

                    winOffsetY =
                        event.clientY -
                        wrapper.offsetTop;

                    try {
                        wrapper.setPointerCapture(
                            event.pointerId
                        );
                    } catch (e) {}

                    event.preventDefault();
                }
            );

            wrapper.addEventListener(
                "pointermove",
                (event) => {
                    if (
                        dragPointerId !==
                        event.pointerId
                    ) {
                        return;
                    }

                    event.preventDefault();

                    const maxLeft = Math.max(
                        0,
                        window.innerWidth -
                            wrapper.offsetWidth
                    );

                    const maxTop = Math.max(
                        0,
                        window.innerHeight -
                            wrapper.offsetHeight
                    );

                    const nextLeft = Math.max(
                        0,
                        Math.min(
                            event.clientX -
                                winOffsetX,
                            maxLeft
                        )
                    );

                    const nextTop = Math.max(
                        0,
                        Math.min(
                            event.clientY -
                                winOffsetY,
                            maxTop
                        )
                    );

                    wrapper.style.left =
                        `${nextLeft}px`;

                    wrapper.style.top =
                        `${nextTop}px`;
                }
            );

            wrapper.addEventListener(
                "pointerup",
                finishDragging
            );

            wrapper.addEventListener(
                "pointercancel",
                finishDragging
            );

            const resizeHandle =
                document.createElement("div");

            resizeHandle.className =
                "ios-resize-handle";

            resizeHandle.style.touchAction = "none";

            wrapper.appendChild(resizeHandle);

            let resizePointerId = null;
            let startX = 0;
            let startScale = 1;

            const finishResizing = (event) => {
                if (
                    resizePointerId === null ||
                    (event.pointerId !== undefined &&
                        event.pointerId !==
                            resizePointerId)
                ) {
                    return;
                }

                localStorage.setItem(
                    "panelScale",
                    currentScale
                );

                try {
                    resizeHandle.releasePointerCapture(
                        resizePointerId
                    );
                } catch (e) {}

                resizePointerId = null;
            };

            resizeHandle.addEventListener(
                "pointerdown",
                (event) => {
                    if (
                        !event.isPrimary ||
                        event.button > 0
                    ) {
                        return;
                    }

                    event.stopPropagation();
                    event.preventDefault();

                    resizePointerId =
                        event.pointerId;

                    startX = event.clientX;

                    startScale =
                        parseFloat(
                            wrapper.style.getPropertyValue(
                                "--panel-scale"
                            )
                        ) || 1;

                    try {
                        resizeHandle.setPointerCapture(
                            event.pointerId
                        );
                    } catch (e) {}
                }
            );

            resizeHandle.addEventListener(
                "pointermove",
                (event) => {
                    if (
                        resizePointerId !==
                        event.pointerId
                    ) {
                        return;
                    }

                    event.preventDefault();

                    const scaleChange =
                        (event.clientX - startX) /
                        200;

                    const newScale = Math.max(
                        0.4,
                        Math.min(
                            startScale +
                                scaleChange,
                            1.8
                        )
                    );

                    wrapper.style.setProperty(
                        "--panel-scale",
                        newScale
                    );

                    currentScale = newScale;
                }
            );

            resizeHandle.addEventListener(
                "pointerup",
                finishResizing
            );

            resizeHandle.addEventListener(
                "pointercancel",
                finishResizing
            );

            const closeAllEditors = () => {
                [
                    "#skills-editor",
                    "#shrine-editor",
                    "#monolith-editor",
                ].forEach((id) => {
                    const el =
                        document.querySelector(id);

                    if (el) el.remove();
                });
            };

            const createEditor = (
                id,
                labelText,
                configKey
            ) => {
                const existing =
                    document.querySelector(`#${id}`);

                if (existing) {
                    existing.remove();
                    return;
                }

                closeAllEditors();

                const editor =
                    document.createElement("div");

                editor.id = id;
                editor.className =
                    "ios-editor-panel";

                editor.addEventListener(
                    "pointerdown",
                    (event) =>
                        event.stopPropagation()
                );

                const label =
                    document.createElement("div");

                label.className =
                    "ios-editor-label";

                label.textContent = labelText;

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.className =
                    "ios-textarea";

                textarea.value =
                    CONFIG[configKey].join(", ");

                const btnRow =
                    document.createElement("div");

                btnRow.className =
                    "ios-editor-btn-row";

                const saveBtn =
                    document.createElement("button");

                saveBtn.className =
                    "ios-editor-btn save";

                saveBtn.textContent = "Save";

                saveBtn.onpointerdown = (
                    event
                ) => {
                    event.stopPropagation();
                    event.preventDefault();

                    CONFIG[configKey] =
                        textarea.value
                            .split(",")
                            .map((text) =>
                                text
                                    .trim()
                                    .toLowerCase()
                            )
                            .filter(Boolean);

                    localStorage.setItem(
                        configKey,
                        JSON.stringify(
                            CONFIG[configKey]
                        )
                    );

                    editor.remove();
                };

                const closeBtn =
                    document.createElement("button");

                closeBtn.className =
                    "ios-editor-btn close";

                closeBtn.textContent = "Close";

                closeBtn.onpointerdown = (
                    event
                ) => {
                    event.stopPropagation();
                    event.preventDefault();
                    editor.remove();
                };

                btnRow.append(
                    closeBtn,
                    saveBtn
                );

                editor.append(
                    label,
                    textarea,
                    btnRow
                );

                wrapper.appendChild(editor);
            };

            const makeSmartBtn = (
                label,
                toggleKey,
                arrayKey,
                editorId,
                editorLabel
            ) => {
                const button =
                    document.createElement("button");

                button.className = "ios-btn";
                button.textContent = label;

                let clickTimer = null;
                let lastClickTime = 0;

                const updateStyle = () => {
                    const isActive =
                        CONFIG[toggleKey];

                    button.style.setProperty(
                        "background",
                        isActive
                            ? "rgba(48,209,88,0.3)"
                            : "rgba(255,69,58,0.3)",
                        "important"
                    );
                };

                updateStyle();

                button.onpointerdown = (
                    event
                ) => {
                    event.stopPropagation();
                    event.preventDefault();

                    const currentTime =
                        Date.now();

                    const timeSinceLastClick =
                        currentTime -
                        lastClickTime;

                    lastClickTime =
                        currentTime;

                    if (
                        timeSinceLastClick < 400
                    ) {
                        clearTimeout(clickTimer);

                        createEditor(
                            editorId,
                            editorLabel,
                            arrayKey
                        );
                    } else {
                        clickTimer =
                            setTimeout(() => {
                                CONFIG[toggleKey] =
                                    !CONFIG[
                                        toggleKey
                                    ];

                                localStorage.setItem(
                                    toggleKey,
                                    JSON.stringify(
                                        CONFIG[
                                            toggleKey
                                        ]
                                    )
                                );

                                updateStyle();
                            }, 400);
                    }
                };

                button.oncontextmenu = (
                    event
                ) => {
                    event.preventDefault();
                    clearTimeout(clickTimer);

                    createEditor(
                        editorId,
                        editorLabel,
                        arrayKey
                    );
                };

                return button;
            };

            const houseToggle =
                document.createElement("button");

            houseToggle.className = "ios-btn";
            houseToggle.textContent = "🛖";

            const updateHouseStyle = () => {
                houseToggle.style.setProperty(
                    "background",
                    CONFIG.houseAutoYes
                        ? "rgba(48,209,88,0.3)"
                        : "rgba(255,69,58,0.3)",
                    "important"
                );
            };

            updateHouseStyle();

            houseToggle.onpointerdown = (
                event
            ) => {
                event.stopPropagation();
                event.preventDefault();

                CONFIG.houseAutoYes =
                    !CONFIG.houseAutoYes;

                localStorage.setItem(
                    "houseAutoYes",
                    JSON.stringify(
                        CONFIG.houseAutoYes
                    )
                );

                updateHouseStyle();
            };

            const miniBossToggle =
                document.createElement("button");

            miniBossToggle.className =
                "ios-btn";

            miniBossToggle.textContent = "👻";

            const updateMiniBossStyle =
                () => {
                    miniBossToggle.style.setProperty(
                        "background",
                        CONFIG.miniBossAutoFight
                            ? "rgba(48,209,88,0.3)"
                            : "rgba(255,69,58,0.3)",
                        "important"
                    );
                };

            updateMiniBossStyle();

            miniBossToggle.onpointerdown = (
                event
            ) => {
                event.stopPropagation();
                event.preventDefault();

                CONFIG.miniBossAutoFight =
                    !CONFIG.miniBossAutoFight;

                localStorage.setItem(
                    "miniBossAutoFight",
                    JSON.stringify(
                        CONFIG.miniBossAutoFight
                    )
                );

                updateMiniBossStyle();
            };

            const loopToggle =
                document.createElement("button");

            loopToggle.className = "ios-btn";
            loopToggle.textContent = "🔄";

            loopToggle.title =
                "Toggle auto-chaining into the next mission";

            const updateLoopStyle = () => {
                loopToggle.style.setProperty(
                    "background",
                    CONFIG.loopEnabled
                        ? "rgba(48,209,88,0.3)"
                        : "rgba(255,69,58,0.3)",
                    "important"
                );
            };

            updateLoopStyle();

            loopToggle.onpointerdown = (
                event
            ) => {
                event.stopPropagation();
                event.preventDefault();

                CONFIG.loopEnabled =
                    !CONFIG.loopEnabled;

                localStorage.setItem(
                    "loopEnabled",
                    JSON.stringify(
                        CONFIG.loopEnabled
                    )
                );

                updateLoopStyle();
            };

            const mapToggle =
                document.createElement("button");

            mapToggle.className = "ios-btn";
            mapToggle.textContent = "🗺️";

            mapToggle.title =
                "Toggle Auto Map Creation";

            const updateMapStyle = () => {
                mapToggle.style.setProperty(
                    "background",
                    CONFIG.mapAutoCreate
                        ? "rgba(48,209,88,0.3)"
                        : "rgba(255,69,58,0.3)",
                    "important"
                );
            };

            updateMapStyle();

            mapToggle.onpointerdown = (
                event
            ) => {
                event.stopPropagation();
                event.preventDefault();

                CONFIG.mapAutoCreate =
                    !CONFIG.mapAutoCreate;

                localStorage.setItem(
                    "mapAutoCreate",
                    JSON.stringify(
                        CONFIG.mapAutoCreate
                    )
                );

                updateMapStyle();
            };

            const farmingToggle =
                document.createElement("button");

            farmingToggle.className =
                "ios-btn";

            farmingToggle.textContent =
                "🧑‍🌾";

            farmingToggle.title =
                "Toggle Auto Farming Gear";

            const updateFarmingStyle =
                () => {
                    farmingToggle.style.setProperty(
                        "background",
                        CONFIG.autoFarmingGear
                            ? "rgba(48,209,88,0.3)"
                            : "rgba(255,69,58,0.3)",
                        "important"
                    );
                };

            updateFarmingStyle();

            farmingToggle.onpointerdown = (
                event
            ) => {
                event.stopPropagation();
                event.preventDefault();

                CONFIG.autoFarmingGear =
                    !CONFIG.autoFarmingGear;

                localStorage.setItem(
                    "autoFarmingGear",
                    JSON.stringify(
                        CONFIG.autoFarmingGear
                    )
                );

                updateFarmingStyle();
            };

            const autoPlayToggle =
                document.createElement("button");

            autoPlayToggle.className =
                "ios-btn";

            const updateAutoPlayButtonState =
                () => {
                    autoPlayToggle.textContent =
                        running ? "⏸" : "▶";

                    autoPlayToggle.style.setProperty(
                        "background",
                        running
                            ? "rgba(48,209,88,0.3)"
                            : "rgba(255,69,58,0.3)",
                        "important"
                    );
                };

            autoPlayToggle.onpointerdown = (
                event
            ) => {
                event.stopPropagation();
                event.preventDefault();

                if (!running) {
                    startAutomation();

                    localStorage.setItem(
                        "autoPlayRunning",
                        "true"
                    );
                } else {
                    stopAutomation();

                    localStorage.setItem(
                        "autoPlayRunning",
                        "false"
                    );
                }

                updateAutoPlayButtonState();
            };

            const savedAutoPlay =
                localStorage.getItem(
                    "autoPlayRunning"
                ) === "true";

            if (savedAutoPlay) {
                startAutomation();
            }

            updateAutoPlayButtonState();

            const resetMissionsBtn =
                document.createElement("button");

            resetMissionsBtn.className =
                "ios-btn";

            resetMissionsBtn.textContent =
                "🗑️";

            resetMissionsBtn.title =
                "Clear mission history";

            resetMissionsBtn.onpointerdown = (
                event
            ) => {
                event.stopPropagation();
                event.preventDefault();

                localStorage.setItem(
                    "seenMissions",
                    "[]"
                );

                log("Mission history cleared.");
                alert("Mission history reset!");
            };

            content.append(
                autoPlayToggle,
                makeSmartBtn(
                    "🥫",
                    "skillAuto",
                    "preferredSkills",
                    "skills-editor",
                    "Preferred Skills:"
                ),
                makeSmartBtn(
                    "🏯",
                    "shrineAuto",
                    "shrinePriority",
                    "shrine-editor",
                    "Shrine Priority:"
                ),
                makeSmartBtn(
                    "🗿",
                    "monolithAuto",
                    "monolithPriority",
                    "monolith-editor",
                    "Monolith Priority:"
                ),
                houseToggle,
                miniBossToggle,
                mapToggle,
                farmingToggle,
                resetMissionsBtn,
                loopToggle
            );

            document.body.appendChild(wrapper);

            log("Control panel injected.");
        };

        const ensurePanel = () => {
            if (
                document.body &&
                !document.querySelector(
                    "#ios-ui-panel-wrapper"
                )
            ) {
                createPanel();
            }
        };

        if (
            document.readyState === "loading"
        ) {
            document.addEventListener(
                "DOMContentLoaded",
                ensurePanel,
                { once: true }
            );
        } else {
            ensurePanel();
        }

        const panelObserver =
            new MutationObserver(ensurePanel);

        panelObserver.observe(
            document.documentElement,
            {
                childList: true,
                subtree: true,
            }
        );

        setInterval(ensurePanel, 2000);
    }

    if (
        window.location.hostname.includes(
            "reddit.com"
        )
    ) {
        log(
            "Running on Reddit subreddit page."
        );

        detectModalAndOpen();
    } else if (
        window.location.hostname.includes(
            "devvit.net"
        )
    ) {
        log("Running inside actual game.");
        runAutomation();
    }
})();
