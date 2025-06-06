import * as vscode from "vscode";
import { TrashService } from "./TrashService.js";
import * as fsUtils from "./fsUtils.js";
import { IS_DEBUG } from "./constants.js";

interface TrashItem2Display {
  label: string;
  description: string;
  path: string;
  deletionDate: string;
}
/**
 * 浏览回收站的Palette
 */
export class TrashPalette {
  /**
   * 命令入口点
   */
  async show(): Promise<void> {
    const workspacePaths = fsUtils.getWorkspacePaths();
    if (workspacePaths.length > 1) {
      await this.#showTrashDirPicker(workspacePaths);
    } else if (workspacePaths.length === 1) {
      await this.#showTrashItemPicker(workspacePaths[0]);
    } else {
      vscode.window.showErrorMessage("未捕获到任何工作区根目录", {
        modal: true,
      });
    }
  }

  /**  在palette中看是不是多根工作区，如果是，则多出一级选项选择trash目录，否则返回第一个工作区。*/
  async #showTrashDirPicker(workspacePaths: string[]): Promise<void> {
    const res = await vscode.window.showQuickPick(workspacePaths);
    if (res) {
      await this.#showTrashItemPicker(res);
    }
  }



  /**
   * 显示回收站 Item 选择器界面
   */
  async #showTrashItemPicker(path: string): Promise<void> {
    const initTrashQuickPick = (): vscode.QuickPick<TrashItem2Display> => {  // 不要用function，箭头函数没有自己的 this 绑定
      // 创建选择器并配置
      const quickPick = vscode.window.createQuickPick<TrashItem2Display>();
      quickPick.canSelectMany = false;
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.placeholder = "输入关键词实时搜索回收站内容...";
      quickPick.canSelectMany = false;
      if (IS_DEBUG) {
        quickPick.ignoreFocusOut = true;
      }

      // 配置按钮
      const refreshButton: vscode.QuickInputButton = {
        iconPath: new vscode.ThemeIcon('refresh'), // 使用 VS Code 内置的刷新图标
        tooltip: '刷新任务列表'
      };
      const emptyTrashButton: vscode.QuickInputButton = {
        iconPath: new vscode.ThemeIcon('trash'), // 使用 VS Code 内置的刷新图标
        tooltip: '清空回收站'
      };
      quickPick.buttons = [vscode.QuickInputButtons.Back, refreshButton, emptyTrashButton]; // 添加刷新和内置的返回按钮

      // 配置按钮回调函数
      quickPick.onDidTriggerButton(async (button) => {
        if (button === refreshButton) { refreshQuickPick(path); }
        else if (button === emptyTrashButton) {
          await this.#handleEmptyTrash(path);
          refreshQuickPick(path);
        }
        else if (button === vscode.QuickInputButtons.Back) { this.show(); } // HACK: 简单处理一下，这里的返回上级直接调用show()回到初始界面
      });

      // 根据用户输入实时动态更新选项列表 (onDidChangeValue)
      let debounceTimer: NodeJS.Timeout; // 在外部声明一个计时器变量
      quickPick.onDidChangeValue(async (value) => {
        clearTimeout(debounceTimer); // 清除之前的计时器
        debounceTimer = setTimeout(async () => {
          quickPick.busy = true; // 控制忙碌状态
          const newItems2Display = await this.#fetchTrashItems2Display(path);
          quickPick.items = newItems2Display;
          quickPick.busy = false;
        }, 300); // 简单的防抖处理
      });

      // 用户确认选择时的处理
      // 处理选择事件
      quickPick.onDidAccept(async () => {
        const selected = quickPick.selectedItems[0];
        if (!selected) {
          return;
        }
        // 恢复文件
        const selectedIndex = quickPick.items.indexOf(selected);
        if (selectedIndex >= 0 && selectedIndex < quickPick.items.length) {
          await this.#restoreItem(quickPick.items[selectedIndex]);
          refreshQuickPick(path);
        }
      });
      // QuickPick 隐藏时的处理（确保资源释放）
      quickPick.onDidHide(() => {
        quickPick.dispose();
        console.log('TrashPalette disposed.');
      });
      return quickPick;
    };

    // 辅助函数
    const refreshQuickPick = async (path: string) => {
      console.log("refreshQuickPick 函数开始刷新QuickPick");
      quickPick.busy = true;// QuickPick 的 busy 状态控制了加载动画 (滚动的小条)
      quickPick.items = await this.#fetchTrashItems2Display(path);
      console.log("refreshQuickPick 函数已获取回收站内容");
      quickPick.title = `🗑️ 工作区回收站 (${quickPick.items.length}个项目)`;
      quickPick.busy = false;
    };

    const quickPick = initTrashQuickPick();
    refreshQuickPick(path);

    quickPick.show();
  };



  /**
   * 恢复指定项目
   */
  async #restoreItem(item: TrashItem2Display): Promise<void> {
    console.log("准备执行 TrashPalette.restoreItem, 要恢复的对象:", item);
    const success = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `正在恢复 ${item.path}...`,
        cancellable: false
      },
      async () => { return TrashService.trashRestore(item); }
    );

    console.log("TrashPalette.restoreItem 执行完毕, 恢复结果:", success);
    if (!success) {
      vscode.window.showErrorMessage(`❌ ${item.path} 恢复失败，将自动刷新列表`, { modal: true }
      );
    }
  }

  /**
   * 处理清空回收站
   */
  async #handleEmptyTrash(path: string): Promise<void> {
    const result = await vscode.window.showWarningMessage(
      "确定要清空工作区相关的回收站内容吗？此操作不可恢复。",
      { modal: true },
      "确定清空"
    );

    if (result !== "确定清空") {
      return;
    }
    else {

      const success = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "正在清空工作区回收站...",
          cancellable: false,
        },
        async () => {
          return TrashService.emptyWorkspaceTrash(path);
        }
      );

      if (success) {
        vscode.window.showInformationMessage("✅ 工作区回收站已清空");
      } else {
        vscode.window.showErrorMessage("❌ 清空回收站失败", { modal: true });
      }
    }
  }

  /**
   * 获取工作区回收站内容
   */
  async #fetchTrashItems2Display(path: string): Promise<TrashItem2Display[]> {
    return (await TrashService.listRestorableTrashItems(path)).map(item => ({
      label: `${this.#getIcon(item.path)} ${item.path}`,
      description: `删除日期: ${item.deletionDate}`,
      path: item.path,
      deletionDate: item.deletionDate
    }));
  }

  /**
   * 根据文件名判断并返回对应图标
   */
  #getIcon(path: string): string {
    return fsUtils.isFile(path) ? "$(file)" : "$(folder)";
  }
}
