# trash4wsl-in-vscode <img src="./trash4wsl-icon.png" alt="demo" width="50" height="auto" align="center">

<pre align="center"> <a href="https://github.com/2bitbit/trash4wsl-in-vscode/blob/main/docs/README.md">简体中文</a>  |  English</pre>

In VSCode WSL (or other remote connections), you no longer have to worry about irreversible losses caused by accidental file deletion. Now there is a charming and ultra-fast secure **native recycle bin** (high-performance rewrite based on underlying Rust Native API, dependency-free).

<img src="./trash4wsl-demo.gif" alt="demo" width="500" height="auto">

## ✨ Features
- 📂 **Support for Multi-Root Workspace Isolation**: Precisely identify and clean data from different workspaces to avoid accidental deletions.
- 🚀 **Pure Native High-Speed Implementation**: The underlying engine is reconstructed using `NAPI-RS` + Rust `trash` for cross-boundary performance. With **zero external dependencies**, it seamlessly connects to the system bottom layer, maximizing response speed.
- 🎨 **Exquisite System-Level View Panel**: A recycle bin management window with a simple and comfortable interaction, natively supporting real-time file search, single-item restoration, and complete danger-level emptying.
- 🛡️ **Strict Security Injection Protection**: By passing parameters via full native C-ABI, it is immune to all system-level Shell and command-line injection risks.
- 🐧 **Cross-Distribution Adaptation Architecture**: Built-in multi-core support for Linux `x64` and `arm64` (`aarch64`), compatible with various WSL1/WSL2 distributions and any Remote SSH Linux host following the FreeDesktop XDG standard.
- ⚡ **Out-of-the-box Zero Friction**: No more struggling with missing Python dependencies; enjoy rapid deployment.

## How to Use
1. Search for `trash4WSL-in-vscode` directly in the VSCode Marketplace and install the plugin.
2. In the left-hand explorer, select the files you want to clean (multi-select supported), right-click and select `Trash It`, or simply press the `delete` hotkey to remove them.
3. Press `ctrl+shift+p` to execute the command or use the shortcut `ctrl+shift+delete` to open the magnificent "Workspace Recycle Bin" detail panel in the main editing area for "regret" operations.

> Friendly Reminder: Its underlying standard strictly adheres to the FreeDesktop Trash specification, so data deleted within the plugin will coexist seamlessly with the system desktop's default recycle bin ecosystem (usually stored at: `~/.local/share/Trash/`).

--- 

If this plugin protected your important code, please generously give it a star ⭐ on GitHub; it is a great source of motivation for me.
<p align="center"><strong>Enjoy! Wishing you a good morning, good afternoon, and good night</strong></p>
<p align="center">Co-build with <strong>AI</strong></p>
