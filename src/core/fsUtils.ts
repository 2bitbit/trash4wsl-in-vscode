// 负责各种的文件相关信息；
// 所有输出路径都必须视情况在对应情境中考虑 **转义**。


import * as vscode from "vscode";

/** 获取当前工作区路径：以数组形式返回。 */
export function getWorkspacePaths(): string[] {
  const workspacePaths: string[] = [];
  if (vscode.workspace.workspaceFolders) {
    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
      workspacePaths.push(workspaceFolder.uri.fsPath);
    }
  }
  return normalizePaths(workspacePaths);
}

/**
 * 根据输入参数或当前选择确定要处理的文件列表并进行去重与路径包含过滤
 * @param uris 所有要处理的文件/文件夹的 URI 数组
 * @returns 过滤与去重后、要处理的文件/文件夹的绝对路径数组
 */
export function Uris2Paths(uris: vscode.Uri[]): string[] {
  // 1. 获取所有 fsPath 并去重
  const uniquePaths = Array.from(new Set(uris.map((f) => f.fsPath)));

  // 2. 过滤掉已被父目录包含的冗余子路径
  // 例如，如果同时存在 "/a" 和 "/a/b"，因后者属于前者的子孙路径，移动父目录时子路径会被一并带走。
  // 过滤掉子路径能彻底避免 Rust 端 delete_all 因找不到已被移走的子路径而抛出 Entity not found 错误。
  return uniquePaths.filter((path) => {
    return !uniquePaths.some((other) => {
      if (path === other) {
        return false;
      }
      const parentWithSlash1 = other.endsWith("/") ? other : other + "/";
      const parentWithSlash2 = other.endsWith("\\") ? other : other + "\\";
      return path.startsWith(parentWithSlash1) || path.startsWith(parentWithSlash2);
    });
  });
}

/** 判断给定的path是文件还是目录 - 已废弃：存在启发式精度问题，新版本中应直接使用来自后端的物理 item.isDir 属性 */
export function isFile(path: string): boolean {
  const hasExtension = /\.[^/\.]+$/.test(path);
  const endsWithSlash = path.endsWith("/") || path.endsWith("\\");
  return hasExtension && !endsWithSlash;
}

/**去掉首尾空格与换行符以及移除空字符串 */
export function normalizePaths(paths: string[]): string[] {
  return paths.map((path) => path.trim()).filter((path) => path !== "");
}