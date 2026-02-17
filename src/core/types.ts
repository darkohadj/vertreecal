/**
 * Shared type definitions and interfaces for Vertreecal.
 * Following Interface Segregation Principle - small, focused contracts.
 */

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  openerTabId?: number;
  windowId?: number;
  index?: number;
  active?: boolean;
}

export interface TabTreeNode {
  tab: TabInfo;
  children: TabTreeNode[];
  depth: number;
}

/**
 * Abstraction for tab operations. Enables testing and alternative implementations.
 */
export interface ITabService {
  getCurrentWindowId(): Promise<number>;
  getTabs(
    windowId?: number,
    overrideActiveTabId?: number
  ): Promise<TabInfo[]>;
  focusTab(tabId: number): Promise<void>;
  closeTab(tabId: number): Promise<void>;
}

/**
 * Handles user actions on tabs. Enables different behaviors (e.g. focus vs preview).
 */
export interface ITabActionHandler {
  onTabFocus(tabId: number): Promise<void>;
  onTabClose(tabId: number): Promise<void>;
}
