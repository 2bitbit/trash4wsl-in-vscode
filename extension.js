// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process'); // Node.js 'child_process' module to run external commands
const path = require('path'); // Node.js 'path' module to handle file paths

/**
 * @param {vscode.ExtensionContext} context
 */
let lastTrashedItemInfo = null;
function activate(context) {

    console.log('Congratulations, your extension "trash4wsl-in-vscode" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('trash4wsl-in-vscode.deleteWithTrashCli', async function (uri, uris) {
        // uri: The URI of the item selected in the explorer (if single selection)
        // uris: An array of URIs when multiple items are selected.
        //       Note: For multi-select to work from context menu, ensure your package.json contribution allows it,
        //       or handle it by iterating if 'uris' is populated.
        //       The current 'explorer/context' usually passes only the 'uri' of the right-clicked item.
        //       We will design this to handle an array for robustness, falling back to single 'uri'.

        let filesToProcess = [];
        if (uris && uris.length > 0) {
            filesToProcess = uris;
        } else if (uri) {
            filesToProcess = [uri];
        }

        if (filesToProcess.length === 0) {
            vscode.window.showInformationMessage('No file or folder selected to move to trash.');
            return;
        }

        for (const targetUri of filesToProcess) {
            const filePath = targetUri.fsPath; // Get the full file system path
            const fileName = path.basename(filePath); // Get just the file/folder name for messages

            // Construct the command. Ensure filePath is quoted to handle spaces.
            const command = `trash-put "${filePath}"`;

            vscode.window.showInformationMessage(`Attempting to move "${fileName}" to trash via trash-cli...`);

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    // Log the full error to the console for debugging
                    console.error(`trash-put execution error for: ${filePath}`);
                    console.error(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    console.error(`Error object: ${error.message}`);

                    // Show a user-friendly error message
                    vscode.window.showErrorMessage(`Failed to move "${fileName}" to trash. Error: ${stderr || error.message}`);
                    return;
                }

                vscode.window.showInformationMessage(`Successfully moved "${fileName}" to trash.`);
				if (!error) {
				lastTrashedItemInfo = {
					originalPath: filePath, // filePath 是我们传给 trash-put 的原始路径
					fileName: fileName,     // 文件名，用于提示
					deletionTimestamp: Date.now() // 删除时间戳，或许以后有用
					};
				}
                // Optional: Refresh the file explorer to reflect the change
                // You might need to uncomment this if the explorer doesn't update automatically.
                // vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
            });
        }
    });

    context.subscriptions.push(disposable);



	let undoDisposable = vscode.commands.registerCommand('trash4wsl-in-vscode.undoLastTrashDelete', async function () {
		if (!lastTrashedItemInfo || !lastTrashedItemInfo.originalPath) {
			vscode.window.showInformationMessage('No recent trash operation by this extension to undo.');
			return;
		}
	
		const pathToRestore = lastTrashedItemInfo.originalPath;
		const fileNameToRestore = lastTrashedItemInfo.fileName;
	
		vscode.window.showInformationMessage(`Attempting to restore "${fileNameToRestore}" from trash...`);
	
		// 1. 执行 trash-list 获取回收站内容
		exec('trash-list', (listError, listStdout, listStderr) => {
			if (listError) {
				vscode.window.showErrorMessage(`Failed to list trash items. Error: ${listStderr || listError.message}`);
				return;
			}
	
			// 2. 解析 trash-list 的输出，找到我们要恢复的文件，并确定其索引
			// trash-list 输出格式通常是: YYYY-MM-DD HH:MM:SS /original/path/to/file
			const lines = listStdout.trim().split('\n');
			let itemIndex = -1;
			let foundItemLine = null;
	
			// 我们要找到包含 pathToRestore 的最新条目 (通常 trash-list 是按时间排序的，但不绝对)
			// 为了简单，我们先找完全匹配原始路径的最新条目（通常回收站里同名文件会有日期后缀或机制处理）
			// 更可靠的是找到和我们记录的 deletionTimestamp 最接近的那个
			for (let i = lines.length - 1; i >= 0; i--) { // 从后往前找，假设最新的在后面
				if (lines[i].endsWith(pathToRestore)) {
					// 找到了！trash-restore 通常使用从0开始的索引
					// 但是，trash-restore 的交互模式下显示的索引是从1开始，
					// 而非交互式时，它可能需要一个基于 trash-list 输出的特定标识。
					// 我们先假设 trash-list 的行号（或某种唯一标识）可以用来恢复。
					// 查阅 trash-cli 文档，`trash-restore` 可以接受一个数字索引。
					// `trash-list` 输出的每一行可以看作一个潜在的可恢复项。
					// 我们需要将这个文本列表的行号（从0开始）传递给 `trash-restore`
					itemIndex = i; // 如果 trash-restore 的索引与行号对应
					foundItemLine = lines[i]; // 保存找到的行，以便确认
					break;
				}
			}
	
			// 注意: trash-restore 的索引可能需要从 `trash-list --long` 或其他特定命令获取
			// 简单地使用行号可能不总是准确或受支持。
			// 最安全的非交互式恢复是如果 trash-restore 支持直接通过原始路径恢复。
			// 如果不支持，解析索引是必要的。`trash-restore` 的帮助文档会说明它接受什么参数。
			// 假设 `trash-restore` 接受从 `trash-list` 输出的0-based索引：
	
			if (itemIndex === -1) {
				vscode.window.showErrorMessage(`Could not find "${fileNameToRestore}" (Path: ${pathToRestore}) in the trash list to restore.`);
				return;
			}
	
			// 3. 执行 trash-restore <index>
			// 这里的 <index> 是根据 trash-list 的输出来确定的
			const restoreCommand = `trash-restore ${itemIndex}`; // 假设 itemIndex 是正确的索引
			exec(restoreCommand, (restoreError, restoreStdout, restoreStderr) => {
				if (restoreError) {
					vscode.window.showErrorMessage(`Failed to restore "${fileNameToRestore}". Error: ${restoreStderr || restoreError.message}`);
					// 如果恢复失败，我们可能不应该清除 lastTrashedItemInfo，以便用户可以再次尝试或调试
					return;
				}
				vscode.window.showInformationMessage(`Successfully restored "${fileNameToRestore}".`);
				lastTrashedItemInfo = null; // 恢复成功后清除，避免重复撤销同一个
				// （可选）刷新文件浏览器
				// vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
			});
		});
	});
	
	context.subscriptions.push(undoDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}