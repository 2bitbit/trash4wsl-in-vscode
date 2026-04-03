import * as vscode from "vscode";
import {
  trashPutViaContextMenu,
  trashPutViaShortcut,
} from "./core/trashPutCommand.js";
import { TrashPalette } from "./ui/TrashPalette.js";
import { packageJSON, setIS_DEBUG, EXTENSION_ID } from "./core/constants.js";

async function activate(context: vscode.ExtensionContext) {
  console.log("trash4wsl-in-vscode 扩展已激活");

  if (context.extensionMode === vscode.ExtensionMode.Development) {
    console.log(`🐞 侦测到正在对${EXTENSION_ID}进行debug `);
    setIS_DEBUG(true);
  } else {
    setIS_DEBUG(false);
  }

  /* 注册命令：在此编写函数实现，command必须与package.json中的commandId一致*/

  // 删除命令-右键菜单
  const trashPutViaContextMenuCommand = vscode.commands.registerCommand(
    "trash4wsl-in-vscode.trashPutViaContextMenu",
    trashPutViaContextMenu
  );
  // 删除命令-快捷键
  const trashPutViaShortcutCommand = vscode.commands.registerCommand(
    "trash4wsl-in-vscode.trashPutViaShortcut",
    trashPutViaShortcut
  );

  // 浏览回收站历史命令
  const browseTrashCommand = vscode.commands.registerCommand(
    "trash4wsl-in-vscode.browseTrash",
    () => {
      const trashPalette = new TrashPalette();
      trashPalette.show();
    }
  );

  context.subscriptions.push(trashPutViaContextMenuCommand);
  context.subscriptions.push(trashPutViaShortcutCommand);
  context.subscriptions.push(browseTrashCommand);
  console.log("trash4wsl-in-vscode 扩展激活完成");
}

function deactivate() {
  console.log("trash4wsl-in-vscode 卸载扩展完成");
}

export { activate, deactivate };
