import { Main } from "./modules/worker/Main";

// When the extension is first installed,
// when the extension is updated to a new version,
// and when Chrome is updated to a new version
chrome.runtime.onInstalled.addListener(function () {
  const controller = new Main();
  controller.run();
});

// When a user profile starts
chrome.runtime.onStartup.addListener(function () {
  const controller = new Main();
  controller.run();
});
