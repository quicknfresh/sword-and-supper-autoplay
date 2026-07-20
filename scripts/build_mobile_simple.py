from pathlib import Path

SOURCE = Path("sword-and-supper-autoplay.user.js")
OUTPUT = Path("sword-and-supper-autoplay-mobile-simple.user.js")

text = SOURCE.read_text(encoding="utf-8")

text = text.replace(
    "// @name         Sword & Supper Auto Play v3.16.15 (Firefox Android Fix)",
    "// @name         Sword & Supper Auto Play Mobile Simple",
    1,
)
text = text.replace("// @version      3.16.15", "// @version      3.16.15.2", 1)
text = text.replace(
    "// @description  Full Autoplay + Memory + Item-Use + Mission Auto-Creation + Auto-Claim + Auto-Farming Gear, with Firefox Android touch and startup fixes.",
    "// @description  Full Standard automation with a simple single-row mobile control panel and no glass effects.",
    1,
)
text = text.replace(
    "// @author       Eric",
    "// @author       Eric; simple mobile panel by quicknfresh",
    1,
)

metadata_anchor = "// @run-at       document-idle\n"
metadata_extra = (
    "// @run-at       document-idle\n"
    "// @homepageURL  https://github.com/quicknfresh/sword-and-supper-autoplay\n"
    "// @supportURL   https://github.com/quicknfresh/sword-and-supper-autoplay/issues\n"
    "// @downloadURL  https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile-simple.user.js\n"
    "// @updateURL    https://raw.githubusercontent.com/quicknfresh/sword-and-supper-autoplay/main/sword-and-supper-autoplay-mobile-simple.user.js\n"
)
text = text.replace(metadata_anchor, metadata_extra, 1)

style_anchor = "        document.head.appendChild(btnStyle);\n"
mobile_style = r'''        document.head.appendChild(btnStyle);

        // Mobile Simple changes presentation only. The automation and control
        // event handlers remain the same as the Standard script.
        const mobileSimpleStyle = document.createElement("style");
        mobileSimpleStyle.textContent = `
            body:has(.mc__button-area) #ios-ui-panel-wrapper {
                display: none !important;
            }

            #ios-ui-panel-wrapper {
                --panel-scale: 1 !important;
                display: flex !important;
                align-items: center !important;
                width: min(520px, calc(100vw - 16px)) !important;
                max-width: calc(100vw - 16px) !important;
                padding: 6px !important;
                background: #18181b !important;
                border: 1px solid #3f3f46 !important;
                border-radius: 12px !important;
                box-shadow: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }

            #ios-ui-panel-wrapper > div:first-child {
                background: #18181b !important;
                border: 0 !important;
                border-radius: 12px !important;
                box-shadow: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }

            #ios-ui-panel-wrapper > div:nth-child(2) {
                display: flex !important;
                flex-wrap: nowrap !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                gap: 6px !important;
                overflow-x: auto !important;
                overflow-y: hidden !important;
                scrollbar-width: none !important;
                overscroll-behavior-x: contain !important;
                -webkit-overflow-scrolling: touch !important;
            }

            #ios-ui-panel-wrapper > div:nth-child(2)::-webkit-scrollbar {
                display: none !important;
            }

            #ios-ui-panel-wrapper .ios-btn {
                flex: 0 0 38px !important;
                width: 38px !important;
                height: 38px !important;
                padding: 0 !important;
                border: 1px solid #52525b !important;
                border-radius: 9px !important;
                box-shadow: none !important;
                text-shadow: none !important;
                font-size: 19px !important;
                transition: none !important;
            }

            #ios-ui-panel-wrapper .ios-btn:active {
                opacity: 0.72 !important;
                box-shadow: none !important;
            }

            #ios-ui-panel-wrapper .ios-resize-handle {
                display: none !important;
            }

            #ios-ui-panel-wrapper .ios-editor-panel {
                background: #18181b !important;
                border: 1px solid #3f3f46 !important;
                border-radius: 12px !important;
                box-shadow: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
            }

            #ios-ui-panel-wrapper .ios-textarea {
                background: #09090b !important;
                border: 1px solid #52525b !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(mobileSimpleStyle);
'''

if style_anchor not in text:
    raise RuntimeError("Could not find the Standard panel style anchor")
text = text.replace(style_anchor, mobile_style, 1)

OUTPUT.write_text(text, encoding="utf-8")
