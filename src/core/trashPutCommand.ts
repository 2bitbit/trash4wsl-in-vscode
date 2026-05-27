import * as vscode from "vscode";
import { normalizePaths, Uris2Paths } from "./fsUtils.js";
import * as trashService from "./trashService.js";

const CLIPBOARD_DELAY_MS = 100;
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 统一的删除到回收站入口函数。
 * 无论是通过右键上下文菜单还是快捷键触发，VS Code 在侧边栏有焦点时都会传入参数：
 * @param activeUri 当前激活/聚焦的项的 URI
 * @param uris 当前选中的所有项 of URI 数组
 */
export async function trashPut(
  activeUri?: vscode.Uri,
  uris?: vscode.Uri[],
) {
  console.log("执行 trashPut 命令, activeUri:", activeUri?.fsPath, "uris count:", uris?.length);

  let targetUris: vscode.Uri[] = [];

  // 1. 如果是通过右键菜单触发，VS Code 会在 arguments 中直接传入选中的 uris 数组
  if (uris && uris.length > 0) {
    targetUris = uris;
  } else {
    // 2. 如果是通过键盘快捷键（Delete）触发，VS Code 不会在参数中传入选中列表。
    //    此时我们必须使用剪贴板 Hack 来安全获取侧边栏的当前选中项目。
    try {
      const originalClipboard = await vscode.env.clipboard.readText();
      await vscode.commands.executeCommand("copyFilePath");
      await delay(CLIPBOARD_DELAY_MS); // 等待异步剪贴板写入完成
      const selectedPaths = await vscode.env.clipboard.readText();
      await vscode.env.clipboard.writeText(originalClipboard); // 立即恢复用户原剪贴板内容

      if (selectedPaths && selectedPaths.trim()) {
        const paths = selectedPaths.split(/\r?\n/);
        const normalized = normalizePaths(paths);
        targetUris = normalized.map((p) => vscode.Uri.file(p));
      }
    } catch (err) {
      console.error("通过剪贴板获取侧边栏选中文件失败:", err);
    }
  }

  // 3. 兜底策略：如果以上机制均未获取到，则尝试使用 activeUri 或当前活动编辑器对应的文件
  if (targetUris.length === 0) {
    if (activeUri) {
      targetUris = [activeUri];
    } else if (vscode.window.activeTextEditor) {
      targetUris = [vscode.window.activeTextEditor.document.uri];
    }
  }

  if (targetUris.length === 0) {
    console.log("未检测到待删除的有效目标");
    return;
  }

  // 转换成绝对路径并进行包含去重过滤
  let paths = Uris2Paths(targetUris);
  paths = normalizePaths(paths);

  if (paths.length === 0) {
    return;
  }

  await execTrashPut(paths);
}

async function execTrashPut(paths: string[]) {
  console.log(`即将删除这些文件：${paths.join(", ")}`);

  const stdErrors = await trashService.trashPut(paths); // 如果删除失败，收集错误信息汇报。而不是立刻终止删除操作。
  if (stdErrors.length > 0) {
    console.log("删除文件时发生错误:", stdErrors);
    vscode.window.showErrorMessage(
      `删除文件时发生错误: ${stdErrors.join(", ")}`,
    );
  } else {
    console.log("所有文件删除成功");
  }
}
