import { exec } from "child_process";
import { MESSAGES } from "./constants.js";

/**
 * 垃圾桶服务类，功能：
 * - 检查 trash-cli 安装状态
 * - 执行trash-put操作
 * - 获取回收站列表
 * - 恢复文件
 */
export class TrashService {
  /**
   * 获取当前工作区路径
   */
  private static getWorkspacePath(): string | undefined {
    // 优先获取当前活动编辑器的工作区，作为trash的目录。
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(
        activeEditor.document.uri
      );
      if (workspaceFolder) {
        return workspaceFolder.uri.fsPath;
      }
    }
    // 如果没有活动编辑器，回退到第一个工作区
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    return workspaceFolder?.uri.fsPath;
  }

  /**
   * 检查trash-cli是否安装
   * @returns 是否安装的Promise
   */
  static async checkTrashCliInstallation(): Promise<boolean> {
    return new Promise((resolve) => {
      exec(`trash-put --help`, (error, stdout, stderr) => {
        if (error) {
          console.error(
            MESSAGES.TRASH_CLI_UNAVAILABLE,
            stderr || error.message
          );
          resolve(false);
        } else {
          console.log(MESSAGES.TRASH_CLI_AVAILABLE);
          resolve(true);
        }
      });
    });
  }

  /**
   * 批量删除文件
   * @param  filePaths 要删除的文件路径数组
   * @returns 失败文件列表
   */
  static async trashItems(filePaths: string[]): Promise<string[]> {
    console.log(`即将删除这些文件：${filePaths.join(", ")}`);
    
    // 对文件路径进行转义，防止包含空格的路径出现问题
    const escapedPaths = filePaths.map((path) => `"${path}"`);
    const command = `trash-put ${escapedPaths.join(" ")}`;
    
    return new Promise((resolve) => {
      const stdErrors: string[] = [];
      exec(command, (error, stdout, stderr) => {
        if (stderr) {
          if (!stderr.includes("cannot trash non existent")) {
            //只有发生错误且不是因为文件不存在（父目录已被删除导致），就记录
            console.error(`删除文件失败，错误详情: ${stderr}`);
            stdErrors.push(stderr);
          }
        }
        resolve(stdErrors);
      });
    });
  }
}
