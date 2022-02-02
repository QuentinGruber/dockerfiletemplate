import * as vscode from "vscode";
import { findInstallObjFromName, Template } from "../extension";

export class DockerFileTemplate {
  tree: any = {};
  templates: Template[];
  constructor(context: vscode.ExtensionContext, templates: Template[]) {
    this.templates = templates;
    this.setupDFTView(context);
  }

  async setupDFTView(context: vscode.ExtensionContext) {
    this.templates.forEach((template: Template) => {
      this.tree[template.name] = {};
      template.installs.forEach((templateFile) => {
        this.tree[template.name][`${templateFile.name}`] = false;
      });
    });
    const view = vscode.window.createTreeView("dockerfiletemplate", {
      treeDataProvider: this.aNodeWithIdTreeDataProvider(),
      showCollapseAll: true,
    });
    view.message = "Docker file templates availables :";
    context.subscriptions.push(view);
  }

  aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<{ key: string }> {
    return {
      getChildren: (element: { key: string }): { key: string }[] => {
        // @ts-ignore
        return this.getChildren(element ? element.key : undefined).map((key) =>
          this.getNode(key)
        );
      },
      getTreeItem: (element: { key: string }): vscode.TreeItem => {
        const treeItem = this.getTreeItem(element.key);
        treeItem.id = element.key;
        return treeItem;
      },
      getParent: ({ key }: { key: string }): { key: string } => {
        const parentKey = key;
        return new Key(parentKey);
      },
    };
  }

  getChildren(key: string): string[] {
    if (!key) {
      return Object.keys(this.tree);
    }
    const treeElement = this.getTreeElement(key);
    if (treeElement) {
      return Object.keys(treeElement);
    }
    return [];
  }

  getTreeItem(key: string): vscode.TreeItem {
    const treeElement = this.getTreeElement(key);
    // An example of how to use codicons in a MarkdownString in a tree item tooltip.
    const tooltip = new vscode.MarkdownString(
      `Right-click to see available actions.`,
      true
    );
    let contextValue;
    // @ts-ignore
    if (
      !this.templates.find((e) => {
        return e.name === key;
      })
    ) {
      const obj = findInstallObjFromName(key, this.templates);
      if (obj?.ignoreFilePath) {
        contextValue = "templateWignore";
      } else {
        contextValue = "template";
      }
    }
    return {
      label: /**vscode.TreeItemLabel**/ <any>{ label: key },
      contextValue,
      tooltip,
      collapsibleState:
        treeElement && Object.keys(treeElement).length
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
    };
  }

  getTreeElement(element: any): any {
    return this.tree[element];
  }

  getNode(key: string): { key: string } {
    if (!nodes[key]) {
      nodes[key] = new Key(key);
    }
    return nodes[key];
  }
}
const nodes: any = {};
class Key {
  constructor(readonly key: string) {}
}
