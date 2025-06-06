import * as vscode from "vscode";
import { normalizePaths, Uris2Paths } from "./fsUtils.js";
import { TrashService } from "./TrashService.js";
export { trashPutViaContextMenu, trashPutViaShortcut };

/** 在explorer的右键上下文菜单点击，执行trash-put */
async function trashPutViaContextMenu(_: vscode.Uri, uris: vscode.Uri[]) {
  // 处理参数：uris已经包含了所有的文件/文件夹，第一个参数是右键单击的那个文件/文件夹uri，不必理会。
  let paths = Uris2Paths(uris);
  paths = normalizePaths(paths);
  await execTrashPut(paths);
}

/**在explorer选中，通过快捷键执行trash-put */
async function trashPutViaShortcut() {
  const originalClipboard = await vscode.env.clipboard.readText();
  vscode.commands.executeCommand("copyFilePath");
  const selectedPaths = await vscode.env.clipboard.readText();
  await vscode.env.clipboard.writeText(originalClipboard);

  let paths = selectedPaths.split("\n");
  paths = normalizePaths(paths);
  await execTrashPut(paths);
}

async function execTrashPut(paths: string[]) {
  console.log(`即将删除这些文件：${paths.join(", ")}`);

  const stdErrors = await TrashService.trashPut(paths); // 如果删除失败，收集错误信息汇报。而不是立刻终止删除操作。
  if (stdErrors.length > 0) {
    console.log("删除文件时发生错误:", stdErrors);
    vscode.window.showErrorMessage(
      `删除文件时发生错误: ${stdErrors.join(", ")}`
    );
  } else {
    console.log("所有文件删除成功");
  }
}
