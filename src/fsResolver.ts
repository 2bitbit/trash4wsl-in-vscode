//负责各种的文件相关信息；所有输出路径都必须在本文件中 **转义**。
export { Uris2Paths, getExtensionName, getFocusedWorkspacePath };

import * as vscode from "vscode";
import { EXTENSION_ID } from "./constants.js";

/** 获取当前工作区路径，并转义。 */
function getFocusedWorkspacePath(): string | undefined {
  // 优先获取当前活动编辑器的工作区，作为trash的目录。
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(
      activeEditor.document.uri
    );
    if (workspaceFolder) {
      return escapePath(workspaceFolder.uri.fsPath);
    }
  }
  // 如果没有活动编辑器，回退到第一个工作区
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  return workspaceFolder ? escapePath(workspaceFolder.uri.fsPath) : undefined;
}

/**
 * 根据输入参数或当前选择确定要处理的文件列表
 * @param allUris 所有要处理的文件/文件夹的 URI 数组
 * @returns 要处理的文件/文件夹的路径，转义后的数组
 */
function Uris2Paths(allUris: vscode.Uri[]): string[] {
  return allUris // 让父目录永远排在子目录/文件前面。这样删除的时候，父目录会先被删除，子目录/文件后被删除。便于恢复。
    .map((f) => f.fsPath)
    .sort((a, b) => {
      if (a.startsWith(b + "/")) {
        return 1;
      }
      if (b.startsWith(a + "/")) {
        return -1;
      }
      // 其他情况按字母顺序排序
      return a.localeCompare(b);
    })
    .map(escapePath);
}

/**
 * 获取插件的显示名称
 * @returns 插件的显示名称
 */
function getExtensionName(): string {
  return packageObject.displayName;
}

/** 获取package.json中的信息。 */
const packageObject: any =
  vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON;

/**
 * 对单个字符串路径进行处理，使之变成转义路径。
 */
function escapePath(path: string): string {
  return `"${path}"`;
}
