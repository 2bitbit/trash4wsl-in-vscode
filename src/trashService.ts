import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { MESSAGES } from "./constants.js";

/**
  垃圾桶服务类，功能：
  - 检查 trash-cli 安装状态
  - 执行trash-put操作
 */
export class TrashService {
  // 检查trash-cli是否安装
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
    const escapedPaths = filePaths.map(path => `"${path}"`);
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
