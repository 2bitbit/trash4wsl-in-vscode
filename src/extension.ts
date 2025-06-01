import * as vscode from "vscode";
import { EXTENSION_NAME, MESSAGES } from "./constants.js";
import { TrashService } from "./trashService.js";
import { DeleteCommand } from "./deleteCommand.js";
import { BrowseTrashCommand } from "./browseTrash.js";

async function activate(context: vscode.ExtensionContext) {
  console.log(`${EXTENSION_NAME}: activated`);

  // 检查trash-cli是否安装
  if (await TrashService.checkTrashCliInstallation()) {
    // trash-cli 已安装
    // do nothing here
  } else {
    // 如果trash-cli未安装
    vscode.window.showInformationMessage(MESSAGES.TRASH_CLI_UNAVAILABLE);
    return;
  }

  // 注册命令：在此编写函数实现，command必须与package.json中的commandId一致
  
  // 删除命令
  const deleteCommand = vscode.commands.registerCommand(
    "trash4wsl-in-vscode.deleteWithTrashCli",
    (uri: vscode.Uri, uris?: vscode.Uri[]) => DeleteCommand.execute(uri, uris)
  );
  
  // 浏览回收站历史命令
  const browseTrashCommand = vscode.commands.registerCommand(
    "trash4wsl-in-vscode.browseTrash",
    () => BrowseTrashCommand.execute()
  );
  
  context.subscriptions.push(deleteCommand);
  context.subscriptions.push(browseTrashCommand);
}

function deactivate() {
  console.log(`${EXTENSION_NAME}: deactivated`);
}

export { activate, deactivate };
