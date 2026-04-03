# trash4wsl-in-vscode

<pre align="center"> <a href="https://github.com/2bitbit/trash4wsl-in-vscode/blob/main/README.md">简体中文</a>  |  English</pre>

In VSCode WSL (or other remote connections), no more worries about permanent file deletion without regret. Now enjoy a charming, lightning-fast native recycle bin (Powered by Rust & NAPI-RS - no dependencies required).

<img src="../trash4wsl-demo.gif" alt="demo" width="500" height="auto">

## Features (v2.0 Native Edition)
- **Zero Dependencies**: Completely rewrote the backend in Rust via NAPI-RS. Say goodbye to the Python `trash-cli` dependency! It works out-of-the-box natively.
- **Granular Multi-root Workspace Support**: Workspace-aware listing and purging, preventing accidental deletion of files outside your active projects.
- **Safe Execution Environment**: Direct fs manipulations, fully immune to shell command injections.
- **Classic VSCode UI Integration**: Search, filter, and restore files instantly using the lightweight QuickPick floating menu.
- **Shortcut Support**: Use the standard `delete` key in the explorer to safely move items to the trash, or `ctrl+shift+delete` to open the interactive panel.

## How to Use
1. Search for `trash4wsl-in-vscode` in VSCode Marketplace and install this extension to your workspace. (No extra dependencies needed!)
2. Select files, right-click and choose `Trash` or use the shortcut `delete` to safely move selected files to the recycle bin.
3. Use `ctrl+shift+p` and type "Browse Trash" or use the shortcut `ctrl+shift+delete` to open the interactive trash panel for restorations.

>Tip: The default linux trash directory conforms to the FreeDesktop specification: `~/.local/share/Trash/files`.

## Enjoy!
If this extension is helpful to you, please consider giving it a star on GitHub! Your support means a lot. ⭐
<p align="center">Co-built with <strong>AI</strong></p>
