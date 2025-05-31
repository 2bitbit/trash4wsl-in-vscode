# trash4wsl-in-vscode

<pre align="center">简体中文  |  <a href="https://github.com/2bitbit/trash4wsl-in-vscode/blob/main/docs/README_en.md">English</a></pre>

Allows you to safely move files and folders to the trash in WSL directly from the VS Code File Explorer sidebar, with just a click.

The implementation is based on the trash-cli.

<img src="./demo.png" alt="trash4wsl-in-vscode demo" width="300"/>

## Features & Usage

> Warning: This extension is not yet published to the VSCode Marketplace, so you need to download the VSIX file manually.

Download [trash4wsl-in-vscode.vsix](https://github.com/2bitbit/trash4wsl-in-vscode/releases/latest/download/trash4wsl-in-vscode.vsix)

1. Install trash-cli in your WSL distribution.
2. Install this extension in VSCode manually via VSIX file.
3. You can delete selected files and folders in WSL by right-clicking on them and selecting "Delete (by trash-cli)" from the context menu.（You can also use the `delete` key to delete single file or directory.）

Your files and folders will be moved to the default trash directory used by trash-cli (typically `~/.local/share/Trash/files`).

## tips

- `trash-list` to see what you have deleted.
- `trash-restore` to restore them.
- `trash-empty` to empty the trash-cli.(Just be careful, dude)

## Requirements

- trash-cli
- VSCode
- WSL
- Your smile

<p align="center"><strong>Enjoy!</strong></p>
<p align="center">Co-build with <strong>Gemini-2.5 pro</strong></p>
