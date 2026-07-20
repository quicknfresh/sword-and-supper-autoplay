from pathlib import Path

SRC = Path('sword-and-supper-autoplay.user.js')
OUT = Path('sword-and-supper-autoplay-mobile.user.js')

text = SRC.read_text(encoding='utf-8')

replacements = [
    ('// @name         Sword & Supper Auto Play v3.16.15 (Firefox Android Fix)',
     '// @name         Sword & Supper Auto Play Mobile Compact'),
    ('// @version      3.16.15', '// @version      3.16.21'),
    ('// @description  Full Autoplay + Memory + Item-Use + Mission Auto-Creation + Auto-Claim + Auto-Farming Gear, with Firefox Android touch and startup fixes.',
     '// @description  Full proven Sword & Supper automation with a compact, low-overhead Android control dock.'),
    ('// @author       Eric', '// @author       Eric; mobile interface maintained by quicknfresh'),
    ('        log: true,', '        log: false,'),
]
for old, new in replacements:
    if old not in text:
        raise RuntimeError(f'Missing expected source text: {old}')
    text = text.replace(old, new, 1)

text = text.replace(
    '// @run-at       document-idle\n// ==/UserScript==',
    '// @run-at       document-idle\n'
    '// @homepageURL  https://github.com/quicknfresh/sword-and-supper-autoplay\n'
    '// @supportURL   https://github.com/quicknfresh/sword-and-supper-autoplay/issues\n'
    '// @downloadURL  https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js\n'
    '// @updateURL    https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile.user.js\n'
    '// ==/UserScript==',
    1,
)

css_start = text.index("        const btnStyle = document.createElement('style');")
css_end_marker = '        document.head.appendChild(btnStyle);'
css_end = text.index(css_end_marker, css_start) + len(css_end_marker)
mobile_css = r'''        const btnStyle = document.createElement('style');
        btnStyle.innerHTML = `
            #ios-ui-panel-wrapper {
                --panel-scale: 1;
                max-width: calc(100vw - 16px) !important;
                touch-action: none !important;
            }
            #ios-ui-panel-wrapper,
            #ios-ui-panel-wrapper * {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                box-sizing: border-box !important;
            }
            #ios-ui-panel-wrapper .ios-btn {
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex: 0 0 42px !important;
                width: 42px !important;
                height: 42px !important;
                padding: 0 !important;
                border: 1px solid rgba(255,255,255,.16) !important;
                border-radius: 12px !important;
                background: rgba(42,46,54,.96) !important;
                box-shadow: none !important;
                color: #fff !important;
                font-size: 20px !important;
                line-height: 1 !important;
                text-shadow: none !important;
                transition: transform .08s ease, opacity .15s ease !important;
                touch-action: manipulation !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            #ios-ui-panel-wrapper .ios-btn:active {
                transform: scale(.93) !important;
                opacity: .82 !important;
                box-shadow: none !important;
            }
            #ios-ui-panel-wrapper .ios-resize-handle { display: none !important; }
            #ios-ui-panel-wrapper .ios-editor-panel {
                position: fixed !important;
                left: 12px !important;
                right: 12px !important;
                bottom: calc(66px + env(safe-area-inset-bottom, 0px)) !important;
                top: auto !important;
                width: auto !important;
                max-height: 55vh !important;
                overflow: auto !important;
                padding: 14px !important;
                background: rgba(22,24,29,.98) !important;
                border: 1px solid rgba(255,255,255,.14) !important;
                border-radius: 16px !important;
                box-shadow: 0 8px 24px rgba(0,0,0,.38) !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                z-index: 2147483647 !important;
                display: flex !important;
                flex-direction: column !important;
                gap: 10px !important;
            }
            #ios-ui-panel-wrapper .ios-editor-label {
                font-weight: 700 !important;
                font-size: 14px !important;
                color: #fff !important;
                text-shadow: none !important;
            }
            #ios-ui-panel-wrapper .ios-textarea {
                width: 100% !important;
                min-height: 96px !important;
                font-size: 13px !important;
                line-height: 1.45 !important;
                resize: vertical !important;
                border-radius: 10px !important;
                background: #111318 !important;
                color: #fff !important;
                border: 1px solid rgba(255,255,255,.14) !important;
                padding: 10px !important;
                box-shadow: none !important;
                outline: none !important;
            }
            #ios-ui-panel-wrapper .ios-editor-btn-row {
                display: flex !important;
                justify-content: flex-end !important;
                gap: 8px !important;
            }
            #ios-ui-panel-wrapper .ios-editor-btn {
                cursor: pointer !important;
                border: 0 !important;
                padding: 9px 14px !important;
                border-radius: 10px !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                color: #fff !important;
                box-shadow: none !important;
                touch-action: manipulation !important;
            }
            #ios-ui-panel-wrapper .ios-editor-btn.save { background: #238636 !important; }
            #ios-ui-panel-wrapper .ios-editor-btn.close { background: #3b4048 !important; }
            #ios-ui-panel-wrapper .ss-mobile-scroll::-webkit-scrollbar { display: none; }
        `;
        document.head.appendChild(btnStyle);'''
text = text[:css_start] + mobile_css + text[css_end:]

ui_start = text.index('        const createPanel = () => {')
ui_end = text.index('    }\n\n    if (window.location.hostname.includes("reddit.com"))', ui_start)
ui = text[ui_start:ui_end]

ui = ui.replace('localStorage.getItem("panelScale")', 'localStorage.getItem("mobilePanelScale")')
ui = ui.replace('localStorage.setItem("panelScale"', 'localStorage.setItem("mobilePanelScale"')
ui = ui.replace('localStorage.getItem("panelPosition")', 'localStorage.getItem("mobilePanelPosition")')
ui = ui.replace('localStorage.setItem("panelPosition"', 'localStorage.setItem("mobilePanelPosition"')

old_wrapper = '''position: "fixed", zIndex: "2147483647", display: "inline-block",
                padding: "calc(8px * var(--panel-scale)) calc(12px * var(--panel-scale))",'''
new_wrapper = '''position: "fixed", zIndex: "2147483647", display: "inline-block",
                padding: "6px 8px",
                maxWidth: "calc(100vw - 16px)",
                background: "rgba(17,19,24,.96)",
                border: "1px solid rgba(255,255,255,.14)",
                borderRadius: "16px",
                boxShadow: "0 5px 18px rgba(0,0,0,.32)",'''
if old_wrapper not in ui:
    raise RuntimeError('Wrapper style block changed')
ui = ui.replace(old_wrapper, new_wrapper, 1)
ui = ui.replace(
    'wrapper.style.left = "20px"; wrapper.style.top = "45%";',
    'wrapper.style.left = "8px"; wrapper.style.bottom = "calc(8px + env(safe-area-inset-bottom, 0px))";',
    1,
)

old_bg = '''position: "absolute", top: "0", left: "0", right: "0", bottom: "0", zIndex: "1",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.0) 100%)",
                backdropFilter: "contrast(1.02)", webkitBackdropFilter: "contrast(1.02)",
                borderRadius: "calc(20px * var(--panel-scale))", border: "calc(1px * var(--panel-scale)) solid rgba(255, 255, 255, 0.35)",
                boxShadow: "inset 0 calc(1.5px * var(--panel-scale)) 0 rgba(255, 255, 255, 0.7), 0 calc(14px * var(--panel-scale)) calc(40px * var(--panel-scale)) rgba(0, 0, 0, 0.35)",'''
new_bg = '''position: "absolute", top: "0", left: "0", right: "0", bottom: "0", zIndex: "1",
                background: "transparent",
                borderRadius: "16px",
                pointerEvents: "none",'''
if old_bg not in ui:
    raise RuntimeError('Background style block changed')
ui = ui.replace(old_bg, new_bg, 1)

old_content = '''position: "relative",
                zIndex: "2",
                display: "flex",
                flexWrap: "wrap",
                maxWidth: "min(calc(410px * var(--panel-scale)), calc(100vw - 32px))",
                gap: "calc(6px * var(--panel-scale))",
                alignItems: "center"'''
new_content = '''position: "relative",
                zIndex: "2",
                display: "flex",
                flexWrap: "nowrap",
                width: "min(100%, calc(100vw - 32px))",
                maxWidth: "calc(100vw - 32px)",
                gap: "6px",
                alignItems: "center",
                overflowX: "auto",
                overflowY: "hidden",
                scrollbarWidth: "none",
                overscrollBehavior: "contain"'''
if old_content not in ui:
    raise RuntimeError('Content style block changed')
ui = ui.replace(old_content, new_content, 1)
ui = ui.replace(
    '            wrapper.appendChild(content);',
    '            content.classList.add("ss-mobile-scroll");\n            wrapper.appendChild(content);',
    1,
)

old_guard = '''        // Firefox Android can finish rendering the Devvit frame before the old
        // .advance-button observer starts. Inject immediately once <body> exists,
        // then keep a lightweight guard in case Reddit remounts the game interface.
        const ensurePanel = () => {
            if (document.body && !document.querySelector("#ios-ui-panel-wrapper")) {
                createPanel();
            }
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", ensurePanel, { once: true });
        } else {
            ensurePanel();
        }

        const obs = new MutationObserver(ensurePanel);
        obs.observe(document.documentElement, { childList: true, subtree: true });

        // Fallback for mobile Firefox/Devvit lifecycle quirks where a remount does
        // not produce a useful mutation in the subtree being observed.
        setInterval(ensurePanel, 2000);'''
new_guard = '''        const ensurePanel = () => {
            if (!document.body) return;

            const inlineStart = document.querySelector(".mc__button-area");
            const existing = document.querySelector("#ios-ui-panel-wrapper");
            const previewVisible = inlineStart && inlineStart.offsetParent !== null;

            if (previewVisible) {
                if (existing) existing.style.display = "none";
                return;
            }

            if (!existing) {
                createPanel();
            } else {
                existing.style.display = "inline-block";
            }
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", ensurePanel, { once: true });
        } else {
            ensurePanel();
        }

        // Low-frequency remount guard; avoids observing every game animation update.
        setInterval(ensurePanel, 3000);'''
if old_guard not in ui:
    raise RuntimeError('Panel guard block changed')
ui = ui.replace(old_guard, new_guard, 1)
text = text[:ui_start] + ui + text[ui_end:]

old_end = '''    if (window.location.hostname.includes("reddit.com")) {
        log("Running on Reddit subreddit page.");
        detectModalAndOpen();
    } else if (window.location.hostname.includes("devvit.net")) {
        log("Running inside actual game.");
        runAutomation();
    }'''
new_end = '''    if (window.location.hostname.includes("devvit.net")) {
        runAutomation();
    }'''
if old_end not in text:
    raise RuntimeError('Startup block changed')
text = text.replace(old_end, new_end, 1)

OUT.write_text(text, encoding='utf-8')
print(f'Built {OUT} ({len(text)} bytes)')
