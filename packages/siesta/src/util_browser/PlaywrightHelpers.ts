import playwright from "playwright"
import { SupportedBrowsers } from "../siesta/launcher/LauncherDescriptorNodejs.js"


export const browserType = (browser : SupportedBrowsers) : playwright.BrowserType => {
    switch (browser) {
        case 'chrome':
            return playwright.chromium
        case 'edge':
            return playwright.chromium
        case 'firefox':
            return playwright.firefox
        case 'safari':
            return playwright.webkit
    }
}
