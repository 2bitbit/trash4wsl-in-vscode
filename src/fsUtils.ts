// 负责各种的文件相关信息；
// 所有输出路径都必须视情况在对应情境中考虑 **转义**。

export { Uris2Paths, getWorkspacePaths, isFile, normalizePaths };

import * as vscode from "vscode";

/** 获取当前工作区路径：以数组形式返回。 */
function getWorkspacePaths(): string[] {
  const workspacePaths: string[] = [];
  if (vscode.workspace.workspaceFolders) {
    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
      workspacePaths.push(workspaceFolder.uri.fsPath);
    }
  }
  return normalizePaths(workspacePaths);
}

/**
 * 根据输入参数或当前选择确定要处理的文件列表
 * @param uris 所有要处理的文件/文件夹的 URI 数组
 * @returns 要处理的文件/文件夹的路径，转义后的数组
 */
function Uris2Paths(uris: vscode.Uri[]): string[] {
  return uris // 让父目录永远排在子目录/文件前面。这样删除的时候，父目录会先被删除，子目录/文件后被删除。便于恢复。
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
    });
}

/** 判断给定的path是文件还是目录*/
function isFile(path: string): boolean {
  // 不能使用 fsUtils.isFile(path) 因为这些文件已经被删除到回收站了
  const hasExtension = /\.[^/\.]+$/.test(path);
  const endsWithSlash = path.endsWith("/") || path.endsWith("\\");
  return hasExtension && !endsWithSlash;
}

/**去掉首尾空格与换行符以及移除空字符串 */
function normalizePaths(paths: string[]): string[] {
  return paths.map((path) => path.trim()).filter((path) => path !== "");
}