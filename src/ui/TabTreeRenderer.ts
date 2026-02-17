/**
 * Renders tab tree to DOM and handles user interactions.
 * Uses reconciliation to minimize DOM updates and avoid flash on tab changes.
 * Depends on ITabActionHandler (Dependency Inversion).
 */

import type { TabTreeNode, ITabActionHandler } from "../core/types";

export class TabTreeRenderer {
  private lastTree: TabTreeNode[] | null = null;

  constructor(
    private container: HTMLElement,
    private actionHandler: ITabActionHandler
  ) {}

  render(tree: TabTreeNode[]): void {
    if (tree.length === 0) {
      this.lastTree = null;
      this.container.innerHTML = "";
      this.container.appendChild(this.createEmptyState());
      return;
    }

    const list = this.getOrCreateList();
    this.reconcile(list, this.lastTree ?? [], tree);
    this.lastTree = tree;
  }

  private getOrCreateList(): HTMLUListElement {
    let list = this.container.querySelector("ul.tab-tree");
    if (!list) {
      this.container.innerHTML = "";
      list = document.createElement("ul");
      list.className = "tab-tree";
      list.setAttribute("role", "tree");
      this.container.appendChild(list);
    }
    return list as HTMLUListElement;
  }

  private collectAllLis(container: Element): HTMLLIElement[] {
    const lis: HTMLLIElement[] = [];
    const visit = (el: Element) => {
      if (el instanceof HTMLLIElement && el.dataset.tabId) {
        lis.push(el);
      }
      for (const child of el.children) visit(child);
    };
    visit(container);
    return lis;
  }

  private reconcile(
    listEl: HTMLUListElement,
    oldNodes: TabTreeNode[],
    newNodes: TabTreeNode[]
  ): void {
    const oldLis = Array.from(listEl.children).filter(
      (el): el is HTMLLIElement =>
        el instanceof HTMLLIElement && !!el.dataset.tabId
    );
    const allLis = this.collectAllLis(this.container);
    const oldByTabId = new Map(allLis.map((li) => [li.dataset.tabId!, li]));

    for (let i = 0; i < newNodes.length; i++) {
      const newNode = newNodes[i];
      const tabId = String(newNode.tab.id);
      const existingLi = oldByTabId.get(tabId);

      let li: HTMLLIElement;
      if (existingLi) {
        li = existingLi;
        this.updateNodeContent(li, newNode);
        const targetPos = listEl.children[i];
        if (targetPos !== li) {
          listEl.insertBefore(li, targetPos ?? null);
        }
      } else {
        li = this.createNode(newNode);
        const insertBefore = listEl.children[i];
        listEl.insertBefore(li, insertBefore ?? null);
      }

      const childList = li.querySelector(":scope > ul.tab-tree-children");
      const newChildren = newNode.children;
      if (newChildren.length > 0) {
        const oldChildren = this.getStoredChildren(oldNodes, newNode.tab.id);
        let childUl: HTMLUListElement;
        if (childList) {
          childUl = childList as HTMLUListElement;
          this.reconcile(childUl, oldChildren, newChildren);
        } else {
          childUl = document.createElement("ul");
          childUl.className = "tab-tree tab-tree-children";
          childUl.setAttribute("role", "group");
          for (const child of newChildren) {
            childUl.appendChild(this.createNode(child));
          }
          li.appendChild(childUl);
        }
      } else if (childList) {
        childList.remove();
      }
    }

    for (const li of oldLis) {
      const tabId = li.dataset.tabId!;
      const stillInTree = newNodes.some(
        (n) => String(n.tab.id) === tabId || this.findInTree(n, tabId)
      );
      if (!stillInTree) {
        li.remove();
      }
    }
  }

  private getStoredChildren(
    nodes: TabTreeNode[],
    parentId: number
  ): TabTreeNode[] {
    for (const n of nodes) {
      if (n.tab.id === parentId) return n.children;
      const found = this.getStoredChildren(n.children, parentId);
      if (found.length > 0) return found;
    }
    return [];
  }

  private findInTree(node: TabTreeNode, tabId: string): boolean {
    if (String(node.tab.id) === tabId) return true;
    return node.children.some((c) => this.findInTree(c, tabId));
  }

  private updateNodeContent(li: HTMLLIElement, node: TabTreeNode): void {
    const row = li.querySelector(".tab-tree-row");
    if (!row) return;

    const activeClass = "tab-tree-row--active";
    if (node.tab.active) {
      row.classList.add(activeClass);
    } else {
      row.classList.remove(activeClass);
    }

    const label = row.querySelector(".tab-label");
    const newTitle = node.tab.title || "New Tab";
    if (label && label.textContent !== newTitle) {
      label.textContent = newTitle;
      label.setAttribute("title", node.tab.url);
    }

    const favicon = row.querySelector(".tab-favicon") as HTMLImageElement;
    const newFavicon = node.tab.favIconUrl || "";
    if (favicon && favicon.src !== newFavicon) {
      favicon.src = newFavicon;
      favicon.style.display = newFavicon ? "" : "none";
    }

    li.style.setProperty("--depth", String(node.depth));
  }

  private createNode(node: TabTreeNode): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "tab-tree-node";
    li.setAttribute("role", "treeitem");
    li.dataset.tabId = String(node.tab.id);
    li.style.setProperty("--depth", String(node.depth));

    const row = document.createElement("div");
    row.className =
      "tab-tree-row" + (node.tab.active ? " tab-tree-row--active" : "");

    const favicon = document.createElement("img");
    favicon.className = "tab-favicon";
    favicon.src = node.tab.favIconUrl || "";
    favicon.alt = "";
    favicon.onerror = () => {
      favicon.style.display = "none";
    };

    const label = document.createElement("span");
    label.className = "tab-label";
    label.textContent = node.tab.title || "New Tab";
    label.title = node.tab.url;

    const closeBtn = document.createElement("button");
    closeBtn.className = "tab-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close tab");
    closeBtn.textContent = "×";
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.actionHandler.onTabClose(node.tab.id);
    };

    row.appendChild(favicon);
    row.appendChild(label);
    row.appendChild(closeBtn);

    row.onclick = (e) => {
      if (e.button === 0) {
        // Left click - focus tab
        this.actionHandler.onTabFocus(node.tab.id);
      }
    };

    row.onauxclick = (e) => {
      if (e.button === 1) {
        // Middle click - close tab
        e.preventDefault();
        e.stopPropagation();
        this.actionHandler.onTabClose(node.tab.id);
      }
    };

    li.appendChild(row);

    if (node.children.length > 0) {
      const childList = document.createElement("ul");
      childList.className = "tab-tree tab-tree-children";
      childList.setAttribute("role", "group");
      for (const child of node.children) {
        childList.appendChild(this.createNode(child));
      }
      li.appendChild(childList);
    }

    return li;
  }

  private createEmptyState(): HTMLParagraphElement {
    const p = document.createElement("p");
    p.className = "tab-tree-empty";
    p.textContent = "No tabs in this window";
    return p;
  }
}
