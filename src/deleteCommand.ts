import { Uris2Paths } from "./fsResolver.js";
import { TrashService } from "./trashService.js";
import * as vscode from "vscode";
/**
 * 删除命令处理器类：负责协调各个服务完成删除操作
 */
export class DeleteCommand {
  /**
   * 处理删除命令的主函数
   * @param uri 单个文件/文件夹的 URI
   * @param  uris 多个文件/文件夹的 URI 数组
   */
  static async execute(uri: vscode.Uri, uris?: vscode.Uri[]) {
    // 处理参数：如果有多个文件选中，使用uris；否则使用单个uri
    const allUris = uris && uris.length > 0 ? uris : [uri];
    const allPaths = Uris2Paths(allUris);
    const stdErrors = await TrashService.trashItems(allPaths);
    if (stdErrors.length > 0) {
      vscode.window.showErrorMessage(`出错了: ${stdErrors.join(", ")}`);
    } else {
      console.log("所有文件删除成功");
    }
  }
}
