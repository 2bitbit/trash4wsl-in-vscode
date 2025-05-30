# trash4wsl-in-vscode
Allows you to safely move files and folders to the trash in WSL directly from the VS Code File Explorer sidebar, with just a click.

The implementation is based on the trash-cli.

<img src="./demo.png" alt="trash4wsl-in-vscode demo" width="300"/>

## Features & Usage
1. Install trash-cli in your WSL distribution.
2. Install this extension in VSCode manually via VSIX file.
3. You can delete files and folders in WSL by right-clicking on them and selecting "Delete (by trash-cli)" from the context menu.

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
