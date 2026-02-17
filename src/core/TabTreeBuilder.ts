/**
 * Builds a tree structure from flat tab list using openerTabId.
 * Single Responsibility: tree construction logic only.
 * Open/Closed: extendable via different grouping strategies.
 */

import type { TabInfo, TabTreeNode } from "./types";

interface TabMapNode {
  tab: TabInfo;
  children: TabMapNode[];
}

export class TabTreeBuilder {
  build(tabs: TabInfo[]): TabTreeNode[] {
    const tabMap = new Map<number, TabMapNode>(
      tabs.map((t) => [t.id, { tab: t, children: [] }])
    );
    const roots: TabMapNode[] = [];

    for (const tab of tabs) {
      const node = tabMap.get(tab.id);
      if (!node) continue;

      const parentId = tab.openerTabId;
      if (parentId !== undefined && tabMap.has(parentId)) {
        const parent = tabMap.get(parentId)!;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const addDepth = (nodes: TabMapNode[], depth: number): TabTreeNode[] =>
      nodes
        .sort((a, b) => (a.tab.index ?? 0) - (b.tab.index ?? 0))
        .map((n) => ({
          tab: n.tab,
          children: addDepth(n.children, depth + 1),
          depth,
        }));

    return addDepth(roots, 0);
  }
}
