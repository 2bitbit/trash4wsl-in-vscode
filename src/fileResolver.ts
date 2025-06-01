import * as vscode from "vscode";
import { EXTENSION_ID } from "./constants.js";

const packageObject: any =
  vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON;

/**
 * 文件解析器类：负责各种的文件相关信息的获取
 */
export class FileResolver {
  /**
   * 根据输入参数或当前选择确定要处理的文件列表
   * @param allUris 所有要处理的文件/文件夹的 URI 数组
   * @returns 要处理的文件/文件夹的路径的数组
   */
  static Uris2Paths(allUris: vscode.Uri[]): string[] {
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
      });
  }

  /**
   * 获取插件的显示名称
   * @returns 插件的显示名称
   */
  static getExtensionName(): string {
    return packageObject.displayName;
  }
}
