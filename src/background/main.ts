/**
 * Background service worker. Opens side panel when extension icon is clicked.
 */

chrome.action.onClicked.addListener((tab) => {
  if (tab.windowId) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
