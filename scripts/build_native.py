#!/usr/bin/env python3
import os
import subprocess
import sys
from pathlib import Path


ROOT_DIR = Path(__file__).parent.parent


def main():
    # 确保我们的工作目录在项目根目录
    os.chdir(ROOT_DIR)

    print("\n🚀 [1/2] 准备编译 Rust Backend 核心层...")
    rust_core_dir = ROOT_DIR / "rust-core"
    if not rust_core_dir.exists():
        print(f"❌ 错误: 找不到 {rust_core_dir} 目录。")
        sys.exit(1)
    # 进入 rust-core 并调用 napi build
    # 注意: output-dir 必须相对于 napi 执行的目录 (也就是 rust-core)
    napi_command = [
        "npx",
        "napi",
        "build",
        "--platform",
        "--output-dir",
        "../native-bindings",
    ]

    print("▶ 执行: " + " ".join(napi_command))

    try:
        # 使用 subprocess 流式输出给用户看
        subprocess.run(
            napi_command,
            cwd=rust_core_dir,
            check=True,
            shell=False,  # 在 linux 下无需 shell
        )
        print(
            "✅ [2/2] Rust 二进制包编译完成！且已被正确推送到 native-bindings/ 目录！"
        )
    except Exception as e:
        print(f"\n❌ [编译失败]: napi build 返回了异常代码 {e.returncode}")
        print("请检查上方输出找到 Rust 的报错。")
        sys.exit(e.returncode)

    print("\n🎉 万事俱备！现在你只需要去 VS Code 按下 [F5] 即可开启调试！\n")


if __name__ == "__main__":
    main()
