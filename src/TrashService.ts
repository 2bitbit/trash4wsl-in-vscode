import { exec, spawn } from "child_process";

// 回收站项目接口，用于存储trash-restore的每一行输出。
// interface: 必须包含这些属性，否则会报错。
export interface TrashItem {
  path: string;
  deletionDate: string;
}

/**
 * 垃圾桶服务静态类（不实例化）。负责底层服务，不涉及 UI 功能。
 */
export class TrashService {
  /**
   * 检查trash-cli是否安装
   * @returns 是否安装的Promise
   */
  static async checkTrashCliInstallation(): Promise<boolean> {
    console.log("开始检查trash-cli是否安装");
    return new Promise((resolve) => {
      exec(`trash-put --help`, (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(
            "对trash-cli的安装检查完成：trash-put --help 命令失败。原因：",
            error?.message || "",
            stderr || ""
          );
          resolve(false);
        } else {
          console.log("对trash-cli的安装检查完成：trash-put --help 命令可用，认为trash-cli已安装");
          console.log("-------------------------------------------------------------------------------------------------------------------");
          resolve(true);
        }
      });
    });
  }

  /**
   * 批量删除文件：如果删除失败，收集错误信息汇报。而不是立刻终止删除操作。
   * @param  filePaths 要删除的文件路径数组
   * @returns 失败文件列表
   */
  static async trashPut(filePaths: string[]): Promise<string[]> {
    const command = `trash-put "${filePaths.join('" "')}"`;
    console.log(`开始执行命令：${command}`);
    return new Promise((resolve) => {
      const stdErrors: string[] = [];
      exec(command, (error, stdout, stderr) => {
        if (stderr) {
          if (stderr.includes("cannot trash non existent")) {
            // 父目录已被删除导致的文件不存在，不记录
          } else {
            stdErrors.push(stderr);
          }
        }
        resolve(stdErrors);
      });
      console.log("文件删除完成");
    });
  }

  /**
   * 获取工作区回收站中的文件列表
   * @param path 工作区路径：用来获取回收站清单 或者 文件路径：用来恢复文件（见trashRestore方法）
   * @returns 回收站项目列表
   */
  static async listRestorableTrashItems(path: string): Promise<TrashItem[]> {
    console.log(`开始获取工作区：${path} 的回收站中的文件列表`);
    return new Promise((resolve) => {
      let output = "";
      let errorOutput = "";

      console.log(`将执行命令: trash-restore "${path}" 来获取可恢复的文件列表`);
      const restore = spawn("trash-restore", [path]);

      restore.on("error", (error) => {
        console.error("trash-restore spawn错误:", error);
        resolve([]);
      });
      restore.stderr.on("data", (data) => {
        const stderr = data.toString();
        errorOutput += stderr;
      });
      restore.stdout.on("data", (data) => {
        const chunk = data.toString();
        output += chunk;
      });

      restore.on("close", (code) => {
        console.log("trash-restore 命令退出码:", code);
        console.log(`trash-restore 完整输出:\n${output}`);
        if (errorOutput.trim()) {
          console.log(errorOutput.trim() === "" ? "无stderr" : `trash-restore stderr: ${errorOutput}`);
        }

        if (code !== 0 && output.trim() === "") {
          console.error("trash-restore 命令执行失败，无输出");
          resolve([]);
          return;
        }

        // 解析输出
        const items: TrashItem[] =
          TrashService.#parseTrashRestoreOutput(output);

        resolve(items);
      });

      // 立即关闭stdin，因为我们不需要交互
      restore.stdin.end();
      console.log("获取工作区回收站中的文件列表完成");
    });
  }

  /**
   * 恢复指定索引的文件
   * @returns 是否成功
   */
  static async trashRestore(item: TrashItem): Promise<boolean> {
    console.log(`将执行命令: trash-restore "${item.path}" 来恢复文件`);

    return new Promise((resolve) => {
      const restore = spawn("trash-restore", [item.path]); // spawn不经过shell处理，所以path不必加""转义，就能实现同样的效果。
      let hasResponded = false;

      restore.on("error", (error) => {
        console.error("恢复进程错误:", error);
        resolve(false);
      });
      restore.stdout.on("data", async (data) => {
        const output = data.toString();
        console.log("trash-restore 输出:", output);
        // 检测是否出现选择提示
        const regex = /What file to restore \[\d+\.+\d+\]: /;
        if (regex.test(output) && !hasResponded) {
          hasResponded = true;

          const currentItems = await TrashService.listRestorableTrashItems(
            item.path
          );
          let index = 0;
          for (let i = 0; i < currentItems.length; i++) {
            if (
              currentItems[i].path === item.path &&
              currentItems[i].deletionDate === item.deletionDate
            ) {
              index = i;
              break;
            }
          }
          // 自动输入索引并按回车
          console.log(`自动输入索引: ${index}`);
          restore.stdin.write(`${index}\n`);
          restore.stdin.end();
        }
      });

      restore.stderr.on("data", (data) => {
        console.error("恢复文件失败:", data.toString());
      });

      restore.on("close", (code) => {
        console.log(`恢复进程退出，代码: ${code}`);
        resolve(code === 0);
        return;
      });
    });
  }

  /**
   * 清空工作区相关的回收站内容
   * @param workspacePath 工作区路径
   * @returns 是否成功
   */
  static async emptyWorkspaceTrash(workspacePath: string): Promise<boolean> {
    console.log(`将执行命令: trash-rm "${workspacePath}/**" 来清空回收站`);
    return new Promise((resolve) => {
      const command = spawn("trash-rm", [`"${workspacePath}/**"`], {
        shell: true, // 需要shell来处理通配符，因为这时spawn要经过shell处理，所以path要加""转义
      });

      command.on("error", (error) => {
        console.error("trash-rm 进程错误:", error);
        resolve(false);
      });
      command.stderr.on("data", (data) => {
        console.error("trash-rm 失败:", data.toString());
      });
      command.on("close", (code) => {
        console.log(`trash-rm 进程退出，代码: ${code}`);
        resolve(code === 0);
      });
    });
  }

  /**
   * 解析 trash-restore 的输出
   * @param output 输出
   * @returns 解析结果
   */
  static #parseTrashRestoreOutput(output: string): TrashItem[] {
    // 私有方法不要用private，不显眼！
    const items: TrashItem[] = [];
    console.log("开始解析 trash-restore 的输出");

    const lines = output.split("\n").map((line) => line.trim());
    for (const line of lines) {
      const match = line.match(
        /^\d+ (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (.+)$/
      );
      if (match) {
        const [, deletionDate, path] = match;
        items.push({
          path: `${path}`,
          deletionDate: deletionDate,
        });
      } else {
        if (!line.includes("What file to restore")) {
          console.log("无法解析行:", line);
        }
      }
    }
    console.log("解析到的项目数:", items.length);

    // 按删除时间排序（最新的在前面）
    items.sort((a, b) => b.deletionDate.localeCompare(a.deletionDate)); //a更近时b-a<0,返回-1,对应a排在前面。更近的排在前面。
    console.log("对 trash-restore 的输出解析完成，返回结果");
    return items;
  }
}
