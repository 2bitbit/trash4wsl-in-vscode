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
  static async Uris2Paths(allUris: vscode.Uri[]): Promise<string[]> {
    return allUris.map((f) => f.fsPath); 
  }

  /**
   * 获取插件的显示名称
   * @returns 插件的显示名称
   */
  static async getExtensionName(): Promise<string> {
    return packageObject.displayName;
  }
}
 