# trash4wsl-in-vscode <img src="./trash4wsl-icon.png" alt="demo" width="50" height="auto" align="center">

<pre align="center"> 简体中文  |  <a href="https://github.com/2bitbit/trash4wsl-in-vscode/blob/main/docs/README_en.md">English</a></pre>

在VSCode WSL(或其他 remote 连接)中，再也不用担心误删文件造成的不可逆损失。现在有了一个迷人且极速安全的**原生回收站**（基于底层 Rust Native API 高性能重写，免依赖）。

<img src="./trash4wsl-demo.gif" alt="demo" width="500" height="auto">

## ✨ 功能特色
- 📂 **支持多根工作区隔离**：精准识别和清理不同工作区的数据，避免误删。
- 🚀 **纯原生极速实现**：底层引擎通过 `NAPI-RS` + Rust `trash` 重构跨界，**零外部依赖**无缝衔接系统底层，极限提升响应速度。
- 🎨 **精美的系统级视图面板**：拥有简洁舒适交互的回收站管理视窗，原生支持文件实时搜索、单次隔离恢复、全部危险级清空。
- 🛡️ **严格的安全注入保护**：通过全原生 C-ABI 参数传值，免疫所有的系统级 Shell 及命令行注入风险。
- 🐧 **跨发行版适配架构**：内置分装了对 Linux `x64` 和 `arm64` (`aarch64`) 的多核支持，通杀各项 WSL1/WSL2 发行版，以及任何遵循 FreeDesktop XDG 标准的 Remote SSH Linux 主机。
- ⚡ **开箱即用无阻力**：不用再由于环境缺少 Python 依赖抓耳挠腮，享受极速部署。

## 如何使用
1. 直接在 VSCode Marketplace 搜索 `trash4WSL-in-vscode` 并安装插件。
2. 在左侧资源管理器中选中你想清理的文件（支持多选），右键选择 `丢入回收站 (Trash)`，或者直接施放快捷键 `delete` 即可删除。
3. `ctrl+shift+p` 执行命令或使用快捷键 `ctrl+shift+delete`，将在主编辑区打开宏伟的「工作区回收站」详情面板，进行相关后悔药操作。

>温馨提示：其底层标准严格遵守 FreeDesktop Trash 规范体系，所以你在插件内删除的数据、都会无缝与系统桌面默认回收站生态共存（存放路径通常为：`~/.local/share/Trash/`）。

--- 

若这个插件保护了您的重要代码，请在 GitHub 上大方地赐予一颗星星哦 ⭐，这对我是莫大的动力激励。
<p align="center"><strong>Enjoy! 祝愿你早安午安晚安</strong></p>
<p align="center">Co-build with <strong>AI</strong></p>
