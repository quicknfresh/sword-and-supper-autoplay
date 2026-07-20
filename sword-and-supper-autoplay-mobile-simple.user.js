// ==UserScript==
// @name         Sword & Supper Auto Play Mobile Simple
// @namespace    https://reddit.com/user/echo-foxtrot-delta/
// @version      3.16.15.3
// @description  Full Standard automation with a simple single-row mobile control panel, plus UI.Vision Start Mission triggering through Loop.
// @author       Eric; simple mobile panel by quicknfresh
// @match        *://*.reddit.com/*
// @match        *://*.devvit.net/*
// @grant        none
// @run-at       document-idle
// @homepageURL  https://github.com/quicknfresh/sword-and-supper-autoplay
// @supportURL   https://github.com/quicknfresh/sword-and-supper-autoplay/issues
// @downloadURL  https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile-simple.user.js
// @updateURL    https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile-simple.user.js
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
const UIVISION_MACRO_NAME = "SwordSupperStartMission";
const UIVISION_STORAGE_MODE = "browser";
const UIVISION_REQUEST_TYPE = "SWORD_SUPPER_UIVISION_START_MISSION";
let running = false;
let intervalId = null;
const log = (msg) => CONFIG.log && console.log(`[Sword&Supper] ${msg}`);
const waitFor = (conditionFn, callback, timeoutMs = 5000, intervalMs = 200) => {
const start = Date.now();
const check = () => {
let ok = false;
try { ok = !!conditionFn(); } catch (e) { ok = false; }
if (ok) { callback(true); return; }
if (Date.now() - start > timeoutMs) {
log("waitFor: timed out waiting for condition, proceeding anyway.");
callback(false);
return;
}
setTimeout(check, intervalMs);
};
check();
};
const smartClick = (el) => {
if (!el) return;
if (el.tagName && el.tagName.toLowerCase() === 'a' && el.href && !el.href.startsWith('javascript:')) {
window.location.href = el.href;
return;
}
const reactKey = Object.keys(el).find(key => key.startsWith('__reactProps$') || key.startsWith('__reactEventHandlers$'));
if (reactKey && el[reactKey] && typeof el[reactKey].onClick === 'function') {
try {
el[reactKey].onClick({
isTrusted: true,
preventDefault: () => {},
stopPropagation: () => {},
target: el,
currentTarget: el,
nativeEvent: { isTrusted: true }
});
return;
} catch (err) {}
}
try {
el.focus();
el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
} catch(e) {}
['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(type => {
el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
});
};
function installUiVisionBridge() {
window.addEventListener("message", (event) => {
const data = event.data;
if (!data || data.type !== UIVISION_REQUEST_TYPE) return;
let sourceHostname = "";
try {
sourceHostname = new URL(event.origin).hostname;
} catch (_) {
return;
}
if (!sourceHostname.endsWith("devvit.net")) return;
window.dispatchEvent(
new CustomEvent("kantuRunMacro", {
detail: {
name: UIVISION_MACRO_NAME,
from: "bookmark",
storageMode: UIVISION_STORAGE_MODE,
closeRPA: 1,
},
})
);
log(`Loop: requested UI.Vision macro "${UIVISION_MACRO_NAME}".`);
});
}
function startMissionUiVisionWatcher() {
let triggeredForCurrentScreen = false;
const check = () => {
const button = document.querySelector(".mc__button-area");
const visible = Boolean(
button &&
button.isConnected &&
button.getClientRects().length > 0
);
if (!CONFIG.loopEnabled || !visible) {
triggeredForCurrentScreen = false;
return;
}
if (triggeredForCurrentScreen) return;
triggeredForCurrentScreen = true;
if (window.parent !== window) {
window.parent.postMessage({ type: UIVISION_REQUEST_TYPE }, "*");
log("Loop: Start Mission detected; requesting UI.Vision macro.");
}
};
setInterval(check, 1000);
check();
}
function detectModalAndOpen() {
const observer = new MutationObserver(() => {
const modal = document.querySelector("rpl-modal-card");
if (modal) {
const iframe = modal.querySelector("devvit-blocks-web-view[src]");
if (iframe && iframe.src.includes("devvit.net")) {
observer.disconnect();
log("Detected Sword & Supper modal.");
}
}
});
observer.observe(document.body, { childList: true, subtree: true });
}
function runAutomation() {
const clickAdvance = () => {
const btn = Array.from(document.querySelectorAll(".advance-button")).find(
(b) => {
const text = b.textContent.trim().toLowerCase();
return ((text.includes("advance") || text.includes("battle") || text.includes("descend") || text.includes("start")) && b.offsetParent !== null && !b.disabled);
}
);
if (btn) smartClick(btn);
};
const clickSkip = () => {
const btn = Array.from(document.querySelectorAll(".skip-button, .skip-text")).find((b) => b.textContent.trim().toLowerCase().includes("skip") && b.offsetParent !== null && !b.disabled);
if (btn) smartClick(btn);
};
const clickEndMission = () => {
if (!CONFIG.loopEnabled) return;
const btn = document.querySelector('.end-mission-button:not([data-loop-clicked])');
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
if (Date.now() - lastMissionLinkClickTime < MISSION_LINK_COOLDOWN_MS) return;
let seenMissions = JSON.parse(localStorage.getItem("seenMissions") || "[]");
const allLinks = Array.from(document.querySelectorAll('.mission-link-content'));
const availableLinks = allLinks.filter(link => {
const missionTitle = link.textContent.trim();
const isVisuallyCompleted = link.classList.contains("completed") ||
link.classList.contains("done") ||
missionTitle.toLowerCase().includes("completed");
return !seenMissions.includes(missionTitle) && !isVisuallyCompleted;
});
const targetLink = availableLinks[0];
if (targetLink && targetLink.offsetParent !== null) {
const missionTitle = targetLink.textContent.trim();
seenMissions.push(missionTitle);
if (seenMissions.length > 50) seenMissions.shift();
localStorage.setItem("seenMissions", JSON.stringify(seenMissions));
lastMissionLinkClickTime = Date.now();
log(`Loop: picking new mission: ${missionTitle}`);
smartClick(targetLink);
}
};
setInterval(() => {
clickEndMission();
clickMissionLink();
}, 500);
const autoUseMapItem = () => {
if (!CONFIG.mapAutoCreate) return; // Exit if map creation is toggled off
const modal = document.querySelector('.item-modal-body');
if (!modal || modal.offsetParent === null) return;
if (modal.dataset.processing === "true") return;
const actions = modal.querySelector('.item-modal-actions');
if (!actions) return;
const useBtn = actions.querySelector('button');
if (!useBtn || useBtn.offsetParent === null) return;
const titleEl = modal.querySelector('.item-title, .item-modal-title, .item-name, h1, h2, h3');
const itemName = titleEl ? titleEl.textContent.trim() : "(unknown item)";
modal.dataset.processing = "true";
log(`Item Modal detected: "${itemName}". Pausing before clicking Use/Equip...`);
setTimeout(() => {
smartClick(useBtn);
log(`Clicked Use/Equip on "${itemName}".`);
waitFor(
() => document.querySelector('.randomize-scenario-section') !== null,
() => { modal.dataset.processing = "false"; },
6000
);
}, 400);
};
setInterval(autoUseMapItem, 400);
const autoClaimRewards = () => {
const buttons = Array.from(document.querySelectorAll('.claim-button'));
const activeClaimBtn = buttons.find(btn =>
!btn.disabled &&
!btn.classList.contains('inactive') &&
btn.offsetParent !== null
);
if (activeClaimBtn && activeClaimBtn.dataset.processing !== "true") {
activeClaimBtn.dataset.processing = "true";
log("Active claim button found. Clicking...");
smartClick(activeClaimBtn);
setTimeout(() => {
if (activeClaimBtn) activeClaimBtn.dataset.processing = "false";
}, 100);
}
};
setInterval(autoClaimRewards, 500);
let isEquippingFarmingGear = false;
const autoEquipFarmingGears = () => {
if (!CONFIG.autoFarmingGear || isEquippingFarmingGear) return;
const grid = document.querySelector('.virtual-items-grid');
if (!grid || grid.offsetParent === null) return;
const modal = document.querySelector('.item-modal-body');
if (modal && modal.offsetParent !== null) return;
const targetGears = [
"Wrathful Visor EX",
"Sower's Lament Lvl 3", "Sower’s Lament Lvl 3",
"Ember Droplet Ultimate",
"Frostflake Band EX",
"Recovery Vest EX",
"Knife Collector's Belt Ultimate", "Knife Collector’s Belt Ultimate",
"Map: Mountain Pass", "Map: Outer Temple", "Map: Forbidden City", "Map: Ruined Path", "Map: Seaside Cliffs"
];
const allGridItems = Array.from(grid.querySelectorAll('img.item-image'));
const foundGear = allGridItems.find(img => {
if (!img.alt) return false;
return targetGears.some(t => img.alt.includes(t));
});
if (foundGear) {
isEquippingFarmingGear = true;
log(`Farming Gear: Found "${foundGear.alt}", clicking to equip...`);
smartClick(foundGear);
setTimeout(() => {
isEquippingFarmingGear = false;
}, 2500);
}
};
setInterval(autoEquipFarmingGears, 1000);
const autoFillMission = () => {
if (!CONFIG.mapAutoCreate) return;
const container = document.querySelector('.mission-create-container');
if (container && container.offsetParent !== null && container.dataset.processing !== "true") {
const scenarioSection = container.querySelector('.randomize-scenario-section');
if (scenarioSection && !scenarioSection.dataset.isProcessing) {
scenarioSection.dataset.isProcessing = "true";
container.dataset.processing = "true";
log("Mission Creation [Stage 1]: Scenario Screen detected.");
setTimeout(() => {
const diceBtn = container.querySelector('.autocomplete-button, img[alt*="Randomize"]');
if (diceBtn) {
smartClick(diceBtn);
log("Clicked Scenario Randomize Dice.");
}
setTimeout(() => {
const continueImg = container.querySelector('img[alt="Continue"]');
const continueBtn = continueImg ? continueImg.closest('.mission-create-submit-button, button') : container.querySelector('.mission-create-submit-button');
if (continueBtn) {
smartClick(continueBtn);
log("Clicked Continue.");
}
setTimeout(() => { container.dataset.processing = "false"; }, 800);
}, 1200);
}, 400);
return;
}
const foodChoicesSection = container.querySelector('.food-choices');
if (foodChoicesSection && !foodChoicesSection.dataset.isProcessing) {
foodChoicesSection.dataset.isProcessing = "true";
container.dataset.processing = "true";
log("Mission Creation [Stage 2]: Food Screen detected.");
setTimeout(() => {
const foods = container.querySelectorAll('.food-choice');
if (foods.length > 0) {
const randomFood = foods[Math.floor(Math.random() * foods.length)];
smartClick(randomFood);
log("Selected random food.");
}
setTimeout(() => {
const diceBtn = container.querySelector('.autocomplete-button, img[alt*="Randomize"]');
if (diceBtn) {
smartClick(diceBtn);
log("Clicked Food Randomize Dice.");
}
setTimeout(() => {
const continueImg = container.querySelector('img[alt="Continue"]');
const continueBtn = continueImg ? continueImg.closest('.mission-create-submit-button, button') : container.querySelector('.mission-create-submit-button');
if (continueBtn) {
smartClick(continueBtn);
log("Clicked Continue.");
}
setTimeout(() => { container.dataset.processing = "false"; }, 800);
}, 250);
}, 250);
}, 250);
return;
}
}
const form = document.querySelector('form.mission-create-form');
if (form && form.offsetParent !== null && form.dataset.processing !== "true") {
const summaryRows = document.querySelectorAll('.mission-create-summary');
if (summaryRows.length > 0) {
const input = form.querySelector('input[name="title"]');
if (!input) return;
if (document.activeElement === input) return;
let targetText = "", levelText = "", diffText = "⭐⭐⭐", foodText = "";
let isBossRush = false;
summaryRows.forEach(row => {
const text = row.textContent.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
if (text.toUpperCase().includes("BOSS RUSH")) isBossRush = true;
if (text.startsWith("Target:")) {
targetText = text.replace("Target:", "").trim();
} else if (text.includes("Rec. Level:")) {
levelText = text.split("Rec. Level:")[1].replace(/~/g, "-").replace(/\s+/g, "").trim();
} else if (text.startsWith("Food:")) {
foodText = text.replace("Food:", "").trim();
} else if (text.startsWith("Difficulty:")) {
const goldStars = Array.from(row.querySelectorAll('span')).filter(span => {
const style = span.getAttribute('style') || '';
return style.includes('gold') || span.style.color === 'gold';
});
if (goldStars.length > 0) diffText = "⭐".repeat(goldStars.length);
else {
const rawDiff = text.split("Difficulty:")[1].trim();
const starMatch = rawDiff.match(/⭐|★|🌟/g);
if (starMatch && starMatch.length > 0) diffText = "⭐".repeat(starMatch.length);
else if (rawDiff.length > 0) diffText = rawDiff;
}
}
});
if (isBossRush) diffText = "BOSS RUSH";
if (!targetText || !levelText) return;
const finalStr = `Level ${levelText} ${diffText} ${targetText} ${foodText}`.replace(/\s+/g, ' ').trim();
if (input.value !== finalStr) {
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
if (nativeInputValueSetter) nativeInputValueSetter.call(input, finalStr);
else input.value = finalStr;
if (input._valueTracker) input._valueTracker.setValue('');
input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}
form.dataset.processing = "true";
log("Mission Creation [Stage 3]: Summary Screen detected.");
setTimeout(() => {
const checkbox = form.querySelector('input#doRedirect');
if (checkbox && checkbox.checked) {
smartClick(checkbox);
log("Unticked 'Take me directly' checkbox.");
}
setTimeout(() => {
const createImg = form.querySelector('img[alt*="Create"]');
const createBtn = createImg ? createImg.closest('.mission-create-submit-button') : form.querySelector('.mission-create-submit-button');
if (createBtn) {
smartClick(createBtn);
log("Clicked 'CREATE' button.");
}
setTimeout(() => { form.dataset.processing = "false"; }, 3000);
}, 800);
}, 800);
}
}
};
setInterval(autoFillMission, 300);
const pickSkill = () => {
const header = document.querySelector(".ui-panel-header");
const headerText = header ? header.textContent.toLowerCase() : "";
if (CONFIG.shrineAuto && headerText.includes("shrine")) {
const shrineSkills = Array.from(document.querySelectorAll(".ui-panel-content-skills .skill-button-label")).filter((b) => /increase/i.test(b.textContent));
if (shrineSkills.length > 0) {
for (const stat of CONFIG.shrinePriority) {
const match = shrineSkills.find((b) => b.textContent.toLowerCase().includes(stat.toLowerCase()));
if (match) { smartClick(match); return; }
}
smartClick(shrineSkills[0]);
return;
}
}
if (headerText.includes("choose a bonus")) {
const bonusButtons = Array.from(document.querySelectorAll(".skill-button-label"));
if (bonusButtons.length > 0) {
const attackBonus = bonusButtons.find(b => b.textContent.toLowerCase().includes("attack"));
if (attackBonus) smartClick(attackBonus);
else smartClick(bonusButtons[0]);
return;
}
}
if (CONFIG.monolithAuto && headerText.includes("monolith")) {
const monolithOptions = Array.from(document.querySelectorAll(".skill-button-label"));
if (monolithOptions.length > 0) {
const loseHealthMatch = monolithOptions.find((b) => b.textContent.toLowerCase().includes("lose") && b.textContent.toLowerCase().includes("health"));
if (loseHealthMatch) { smartClick(loseHealthMatch); return; }
const refuse = monolithOptions.find((b) => /refuse/i.test(b.textContent));
if (refuse) smartClick(refuse);
}
return;
}
if (CONFIG.skillAuto && (headerText.includes("ancient machine") || headerText.includes("selection of abilities"))) {
const skillButtons = Array.from(document.querySelectorAll(".skill-button-label"));
if (skillButtons.length > 0) {
for (const pref of CONFIG.preferredSkills) {
const match = skillButtons.find((b) => b.textContent.trim().toLowerCase() === pref.toLowerCase());
if (match) { smartClick(match); return; }
}
smartClick(skillButtons[0]);
return;
}
}
const houseHeader = document.querySelector(".ui-panel-header");
if (houseHeader && /mysterious building/i.test(houseHeader.textContent)) {
const yesBtn = Array.from(document.querySelectorAll(".skill-button-label")).find((b) => /yes/i.test(b.textContent));
const noBtn = Array.from(document.querySelectorAll(".skill-button-label")).find((b) => /no/i.test(b.textContent));
if (CONFIG.houseAutoYes && yesBtn) smartClick(yesBtn);
else if (!CONFIG.houseAutoYes && noBtn) smartClick(noBtn);
return;
}
if (headerText.includes("dangerous creatures") && headerText.includes("investigate?")) {
const fightBtn = Array.from(document.querySelectorAll(".skill-button-label")).find((b) => /fight/i.test(b.textContent));
const nopeBtn = Array.from(document.querySelectorAll(".skill-button-label")).find((b) => /nope/i.test(b.textContent));
if (CONFIG.miniBossAutoFight && fightBtn) smartClick(fightBtn);
else if (!CONFIG.miniBossAutoFight && nopeBtn) smartClick(nopeBtn);
return;
}
};
const startAutomation = () => {
if (running) return;
clearInterval(intervalId);
running = true;
intervalId = setInterval(() => {
const continueBtn = document.querySelector(".button-container .continue-button, .continue-button-container .continue-button");
if (continueBtn && continueBtn.offsetParent !== null) {
smartClick(continueBtn);
stopAutomation();
return;
}
const difficultModal = document.querySelector(".ui-overlay-content .modal.shown .dismiss-button");
if (difficultModal && difficultModal.offsetParent !== null) smartClick(difficultModal);
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
const btnStyle = document.createElement('style');
btnStyle.innerHTML = `
#ios-ui-panel-wrapper { --panel-scale: 1; }
#ios-ui-panel-wrapper, #ios-ui-panel-wrapper * {
box-sizing: border-box !important;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
}
.ios-btn {
cursor: pointer !important;
display: inline-flex !important;
align-items: center !important;
justify-content: center !important;
flex: 0 0 calc(42px * var(--panel-scale)) !important;
width: calc(42px * var(--panel-scale)) !important;
height: calc(42px * var(--panel-scale)) !important;
padding: 0 !important;
border: calc(1px * var(--panel-scale)) solid #444955 !important;
border-radius: calc(10px * var(--panel-scale)) !important;
background: #2a2e37 !important;
color: #fff !important;
box-shadow: none !important;
text-shadow: none !important;
font-size: calc(20px * var(--panel-scale)) !important;
line-height: 1 !important;
touch-action: manipulation !important;
-webkit-tap-highlight-color: transparent !important;
}
.ios-btn:active { transform: scale(.94) !important; opacity: .82 !important; }
.ios-resize-handle { display: none !important; }
.ios-editor-panel {
position: absolute;
top: calc(100% + 8px);
left: 0;
width: min(calc(280px * var(--panel-scale)), calc(100vw - 24px));
padding: calc(12px * var(--panel-scale));
display: flex;
flex-direction: column;
gap: calc(10px * var(--panel-scale));
border ECB1