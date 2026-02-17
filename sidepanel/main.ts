/**
 * Side panel entry point. Composition root - wires dependencies.
 * Listens to tab events and refreshes the tree. Open for extension (new listeners, features).
 */

import "./styles.css";
import { ChromeTabService } from "../src/core/ChromeTabService";
import { TabTreeBuilder } from "../src/core/TabTreeBuilder";
import { TabTreeRenderer } from "../src/ui/TabTreeRenderer";
import { ChromeTabActionHandler } from "../src/ui/ChromeTabActionHandler";

const tabService = new ChromeTabService();
const treeBuilder = new TabTreeBuilder();
const actionHandler = new ChromeTabActionHandler();
const renderer = new TabTreeRenderer(
  document.getElementById("tab-tree-container")!,
  actionHandler
);

async function refresh(overrideActiveTabId?: number): Promise<void> {
  try {
    const windowId = await tabService.getCurrentWindowId();
    const tabs = await tabService.getTabs(windowId, overrideActiveTabId);
    const tree = treeBuilder.build(tabs);
    renderer.render(tree);
  } catch (err) {
    console.error("Vertreecal: failed to refresh", err);
  }
}

refresh();

chrome.tabs.onCreated.addListener(() => refresh());
chrome.tabs.onRemoved.addListener(() => refresh());
chrome.tabs.onUpdated.addListener(() => refresh());
chrome.tabs.onMoved.addListener(() => refresh());
chrome.tabs.onAttached.addListener(() => refresh());
chrome.tabs.onDetached.addListener(() => refresh());
chrome.tabs.onActivated.addListener((info) => refresh(info.tabId));
chrome.windows.onFocusChanged.addListener(() => refresh());
