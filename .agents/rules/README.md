# 项目架构规范与设计原则 (.agents/rules)

为了保证项目的健壮性、可读性以及跨语言数据契约的一致性，特制定以下开发规范与技术决策规范。后续无论是人类开发者还是 AI 代理，均应严格遵守以下准则。

---

## 1. VS Code 插件命令与快捷键设计规范

- **智能混合路由与剪贴板回退（Hybrid Routing & Clipboard Fallback）**：
  - **原则**：因为 VS Code 自身架构限制，当通过键盘快捷键（如 `Delete` 键）触发命令时，VS Code **不会**在参数中向命令处理函数传入当前侧边栏的多选 `uris` 数组；只有通过右键上下文菜单触发时，才会传入 `uris` 数组。
  - **规范做法**：
    1. **右键菜单路径**：直接读取原生传入的 `uris` 数组。这种方式最快、最安全，不产生任何剪贴板读写和时序延时。
    2. **快捷键路径**：若 `uris` 数组为 `undefined` 或为空，则说明是通过快捷键触发的。此时程序必须安全回退到**“读取并暂存剪贴板 -> 执行 copyFilePath 命令复制选中项 -> 延时等待写入 -> 读取解析选中项 -> 立即恢复剪贴板”**的 Hack 逻辑以取回侧边栏选中的多路径列表。
    3. **兜底路径**：如果依然为空，则依次尝试获取单个 `activeUri` 或是当前活动编辑器（`activeTextEditor`）中的文档路径。
  - **实现模板**：
    ```typescript
    export async function myCommand(activeUri?: vscode.Uri, uris?: vscode.Uri[]) {
      let targetUris: vscode.Uri[] = [];
      
      if (uris && uris.length > 0) {
        // 右键菜单直接使用原生 uris
        targetUris = uris;
      } else {
        // 快捷键触发回退到剪贴板 Hack
        const originalClipboard = await vscode.env.clipboard.readText();
        await vscode.commands.executeCommand("copyFilePath");
        await delay(100);
        const selectedPaths = await vscode.env.clipboard.readText();
        await vscode.env.clipboard.writeText(originalClipboard);
        if (selectedPaths.trim()) {
          targetUris = selectedPaths.split(/\r?\n/).map(p => vscode.Uri.file(p));
        }
      }
      
      // 执行兜底与后续的包含路径去重过滤...
    }
    ```

- **统一快捷键与右键菜单指令**：
  - 在 `package.json` 中，将右键菜单与快捷键的 `command` 统一指向该混合路由命令，简化注册并在底层保证多选删除在两个入口下均能完美兼容。

---

## 2. 嵌套路径的安全删除规范

- **原理**：当执行批量删除（特别是在 Rust 端的 `delete_all`）时，如果入参路径数组中同时包含父目录（如 `/a`）和子目录或文件（如 `/a/b.txt`），先删除父目录会导致子目录在物理磁盘上瞬间消失。后面对子目录的删除操作会因“路径不存在”而抛出底层 IO 异常，导致整个批处理操作崩溃中断。
- **安全过滤规范**：在任何需要执行批量删除的接口前，必须对路径列表执行**子路径去重过滤**。如果某个路径是另一个待删路径的子集，则在前端剔除该子路径。
- **实现算法**：
  ```typescript
  export function filterNestedPaths(paths: string[]): string[] {
    const uniquePaths = Array.from(new Set(paths));
    return uniquePaths.filter(path => {
      return !uniquePaths.some(other => {
        if (path === other) return false;
        const parentWithSlash1 = other.endsWith("/") ? other : other + "/";
        const parentWithSlash2 = other.endsWith("\\") ? other : other + "\\";
        return path.startsWith(parentWithSlash1) || path.startsWith(parentWithSlash2);
      });
    });
  }
  ```

---

## 3. 回收站物理类型的判定规范

- **废弃启发式正则判断**：
  - **缺陷**：严禁在前端使用文件名正则（如“是否有点号后缀”）来启发式猜测回收站的项目是文件还是文件夹。这会导致 `LICENSE`、`Makefile` 等无后缀文件以及 `v1.0` 等带点号文件夹被完全判定错误。
- **规范做法**：
  - **跨语言传输**：由 Rust 核心层通过真实的操作系统回收站物理状态进行检查，在数据结构中透出 `is_dir` 物理类型布尔值。
  - **Rust 后端判定算法**：
    在 Linux (FreeDesktop) 环境中，每一个删除的文件对应 `~/.local/share/Trash/info/[Name].trashinfo`（元数据）与 `~/.local/share/Trash/files/[Name]`（真实被删物理内容）。
    因此可以通过 `info` 的绝对路径，逆向推导其在 `files/` 目录中的真实路径，利用 Rust 的 `std::path::Path::is_dir()` 进行高精度检查：
    ```rust
    fn is_trash_item_dir(id_str: &str) -> bool {
        let info_path = Path::new(id_str);
        if let Some(parent) = info_path.parent().and_then(|p| p.parent()) {
            if let Some(stem) = info_path.file_stem() {
                let files_path = parent.join("files").join(stem);
                return files_path.is_dir();
            }
        }
        false
    }
    ```

---

## 4. 跨语言编译与发布规范

- **N-API 桥接契约**：
  - 对 Rust 端导出的任何结构体或函数变动，必须同步更新 [`src/core/trashBackend.d.ts`](file:///wsl.localhost/Ubuntu/home/finnwsl/repos/trash4wsl-in-vscode/src/core/trashBackend.d.ts) 中的 TypeScript 类型契约定义，并保证前端映射字段（如 `timeDeleted` -> `time_deleted` 等驼峰转换）完全正确。
- **多架构分发**：
  - 核心层基于 Linux 系统进行编译（WSL / SSH），分发包必须包含 `linux-x64-gnu` 和 `linux-arm64-gnu` 两套原生 `.node` 模块，并通过 CI（GitHub Actions）的交叉编译工具链（如 `gcc-aarch64-linux-gnu`）进行构建打包。
