/* v8 ignore file -- @preserve */
import { Main } from "./modules/worker/Main";

const controller = new Main();

// When the extension is first installed,
// when the extension is updated to a new version,
// and when Chrome is updated to a new version
chrome.runtime.onInstalled.addListener((details) => {
  controller.run(); // restart
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("options.html"),
    });
  }
});

// When a user profile starts
chrome.runtime.onStartup.addListener(() => {
  controller.run(); // restart
});

// When the service worker is resumed
controller.run();
