import { Main } from "./modules/worker/Main";

// When the extension is first installed,
// when the extension is updated to a new version,
// and when Chrome is updated to a new version
chrome.runtime.onInstalled.addListener((details) => {
  const controller = new Main();
  controller.run();
  if (details.reason === "install") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("options.html"),
    });
  }
});

// When a user profile starts
chrome.runtime.onStartup.addListener(() => {
  const controller = new Main();
  controller.run();
});
