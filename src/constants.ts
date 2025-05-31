import * as vscode from "vscode";
const EXTENSION_ID = "2bitbit.trash4wsl-in-vscode";
const EXTENSION_NAME = vscode.extensions.getExtension(EXTENSION_ID)?.packageJSON.displayName;

const MESSAGES = {
  // trash-cli 检查相关
  TRASH_CLI_AVAILABLE: "trash-cli 已安装并可用",
  TRASH_CLI_UNAVAILABLE: `trash-cli未安装，${EXTENSION_NAME} 将不会生效。\n请先安装 trash-cli (例如：sudo apt install trash-cli)。`,
};

export { MESSAGES, EXTENSION_NAME, EXTENSION_ID };
