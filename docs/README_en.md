# trash4wsl-in-vscode

<pre align="center"> <a href="https://github.com/2bitbit/trash4wsl-in-vscode/blob/main/README.md">简体中文</a>  |  English</pre>

In VSCode WSL (or other remote connections), no more worries about permanent file deletion without regret. Now enjoy a charming, lightning-fast native recycle bin (Powered by Rust & NAPI-RS - no dependencies required).

<img src="../trash4wsl-demo.gif" alt="demo" width="500" height="auto">

## ✨ Features (v2.0 Native Edition)
- 📂 **Granular Multi-root Workspace Support**: Workspace-aware listing and purging, preventing accidental deletion of files outside your active projects.
- 🚀 **Zero Dependencies & Native Speed**: Completely rewrote the backend in Rust via NAPI-RS. Say goodbye to the Python `trash-cli` dependency! It works out-of-the-box natively, boosting response speed up to the physical limits of the OS.
- 🎨 **Classic VSCode UI Integration**: Elegant icon-based interactive trash panel, natively supporting real-time filter searching, individual item restorations, and full destructive purging.
- 🛡️ **Safe Execution Environment**: Direct native C-ABI manipulations, fully immune to all shell command injections.
- 🐧 **Cross-Platform Linux Compatibility**: Shipped alongside binaries for both `x64` and `arm64` (`aarch64`). Supports WSL 1 & 2 out of the box, as well as major remote distros adopting the FreeDesktop XDG standard (Technically supports *any* Linux Server using VSCode Remote SSH).
- ⚡ **User-Friendly Shortcuts**: Use the standard `delete` key in the explorer to safely move items to the trash, or `ctrl+shift+delete` to open the interactive panel.

## How to Use
1. Search for `trash4wsl-in-vscode` in VSCode Marketplace and install this extension to your workspace. (No extra dependencies needed!)
2. Select files, right-click and choose `Trash` or use the shortcut `delete` to safely move selected files to the recycle bin.
3. Use `ctrl+shift+p` and type "Browse Trash" or use the shortcut `ctrl+shift+delete` to open the interactive trash panel for restorations.

>Tip: The default linux trash directory conforms to the FreeDesktop specification: `~/.local/share/Trash/files`.

## Enjoy!
If this extension is helpful to you, please consider giving it a star on GitHub! Your support means a lot. ⭐
<p align="center">Co-built with <strong>AI</strong></p>
