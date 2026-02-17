/**
 * Chrome tabs API implementation of ITabService.
 * Single Responsibility: encapsulates all chrome.tabs interactions.
 */

import type { ITabService, TabInfo } from "./types";

export class ChromeTabService implements ITabService {
  async getCurrentWindowId(): Promise<number> {
    const window = await chrome.windows.getCurrent();
    return window.id!;
  }

  async getTabs(
    windowId?: number,
    overrideActiveTabId?: number
  ): Promise<TabInfo[]> {
    const id = windowId ?? (await this.getCurrentWindowId());
    const [tabs, activeTabs] = await Promise.all([
      chrome.tabs.query({ windowId: id }),
      overrideActiveTabId !== undefined
        ? Promise.resolve([])
        : chrome.tabs.query({ active: true, windowId: id }),
    ]);
    const activeTabId = overrideActiveTabId ?? activeTabs[0]?.id;
    return tabs.map((t) => ({
      id: t.id!,
      title: t.title ?? "(no title)",
      url: t.url ?? "",
      favIconUrl: t.favIconUrl,
      openerTabId: t.openerTabId,
      windowId: t.windowId,
      index: t.index,
      active: t.id === activeTabId,
    }));
  }

  async focusTab(tabId: number): Promise<void> {
    await chrome.tabs.update(tabId, { active: true });
    const tab = await chrome.tabs.get(tabId);
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }
  }

  async closeTab(tabId: number): Promise<void> {
    await chrome.tabs.remove(tabId);
  }
}
