# Change Log

## [2.0.0] - 最新
### Added
- 🚀 **全新升级为原生基于 Rust (NAPI-rs) 引擎底层架构**。零依赖、完全免安装，开箱即用。彻底抛弃了对环境中原生 `trash-cli` python 包的强依赖。
- **优势**：跨环境免依赖（内置二进制）、绝对安全无 Shell 调用、极致性能、能基于文件原路径（Original Parent Path）安全隔离多工作区操作。

### Removed
- 重构了底层逻辑，彻底删除了原本借助 Node.js `exec` 派生子进程和解析终端字符带来的命令注入安全隐患和字符截断 Bug。

## [1.1.4] - 历史
- Initial release