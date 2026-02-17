/**
 * Delegates tab actions to ChromeTabService.
 * Single Responsibility: bridges UI events to tab operations.
 */

import type { ITabActionHandler } from "../core/types";
import { ChromeTabService } from "../core/ChromeTabService";

export class ChromeTabActionHandler implements ITabActionHandler {
  private tabService = new ChromeTabService();

  async onTabFocus(tabId: number): Promise<void> {
    await this.tabService.focusTab(tabId);
  }

  async onTabClose(tabId: number): Promise<void> {
    await this.tabService.closeTab(tabId);
  }
}
