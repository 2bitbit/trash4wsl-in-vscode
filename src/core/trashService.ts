/**
 * @file 穿透链接，将TS的调用映射到Rust的底层
 */

import { join } from "path";
import type { TrashBackend, TrashItemNode } from "./trashBackend.js";

// Load correct native module based on architecture

/* 我们的代码是被 esbuild 压扁（打包）过的！ 当你在终端运行编译，或者准备按 F5 时，
 esbuild 会把所有散落在 src 各个深层目录下的 .ts 代码，
 全部抽取、压缩、打平，塞进一个统一的文件中：dist/extension.js。 */
const platformArch = process.arch;
let backendPath = "";
switch (platformArch) {
  case "x64":
    backendPath = join(
      __dirname,
      "../native-bindings/trash4wsl-backend.linux-x64-gnu.node",
    );
    break;
  case "arm64":
    backendPath = join(
      __dirname,
      "../native-bindings/trash4wsl-backend.linux-arm64-gnu.node",
    );
    break;
  default:
    throw new Error(`Unsupported architecture: ${platformArch}`);
}

const trashBackend: TrashBackend = require(backendPath);

// rust的trash库list的格式：
// [
//     TrashItem {
//         id: "/home/finnwsl/.local/share/Trash/info/a.ipynb.trashinfo",
//         name: "a.ipynb",
//         original_parent: "/home/finnwsl/playgrounds/ml",
//         time_deleted: 1773374309,
//     },
//     ...
// ]
export interface TrashItem {
  path: string;
  deletionDate: string;
  _id: string; // Internal native ID tracking
}

/**
 * 批量删除文件
 * @param filePaths 要删除的文件路径数组
 * @returns 失败文件列表
 */
export async function trashPut(filePaths: string[]): Promise<string[]> {
  console.log(`执行 Native trash-put: `, filePaths);
  try {
    trashBackend.moveToTrash(filePaths);
    return [];
  } catch (e) {
    console.error("执行 Native trash-put 异常", e);
    return ["Native Execution Failed"];
  }
}

/**
 * 获取工作区回收站中的文件列表
 * @param path 工作区路径：用来获取回收站清单 或者 文件路径：用来恢复文件（见trashRestore方法）
 * @returns 回收站项目列表
 */
export async function listRestorableTrashItems(
  path: string,
): Promise<TrashItem[]> {
  console.log(`获取工作区：${path} 的回收站中的文件列表`);
  try {
    const filtered = trashBackend.listWorkspaceTrash(path);

    const parsed: TrashItem[] = filtered.map((i) => {
      // Build formatted String YYYY-MM-DD HH:mm:ss
      const d = new Date(i.timeDeleted * 1000);
      const dateStr = d
        .toLocaleString("zh-CN", { hour12: false })
        .replace(/\//g, "-");

      return {
        path: `${i.originalParent}/${i.name}`,
        deletionDate: dateStr,
        _id: i.id, // Track the native ID for restoring
      };
    });

    // 按删除时间排序（最新的在前面）
    parsed.sort((a, b) => b.deletionDate.localeCompare(a.deletionDate));
    return parsed;
  } catch (e) {
    console.error("Native trash list Error", e);
    return [];
  }
}

/**
 * 恢复指定索引的文件
 * @returns 是否成功
 */
export async function trashRestore(item: TrashItem): Promise<boolean> {
  console.log(`将执行 Native 命令恢复文件: ${item.path}`);
  try {
    trashBackend.restoreTrashItems([item._id]);
    return true;
  } catch (e) {
    console.error("Native trashRestore Error", e);
    return false;
  }
}

/**
 * 清空工作区相关的回收站内容
 * @param workspacePath 工作区路径
 * @returns 是否成功
 */
export async function emptyWorkspaceTrash(
  workspacePath: string,
): Promise<boolean> {
  console.log(`执行 Native 命令清空特定工作区回收站: ${workspacePath}`);
  try {
    const items = await listRestorableTrashItems(workspacePath);
    const ids = items.map((i) => i._id);
    if (ids.length > 0) {
      trashBackend.purgeTrashItems(ids);
    }
    return true;
  } catch (e) {
    console.error("Native emptyWorkspaceTrash Error", e);
    return false;
  }
}
