# MAUITemplate

一个从 `V2ex.Maui2` 提炼出来的 **MAUI + HybridWebView + Ionic** 起始模板。

这个模板保留了最核心、最通用的基础设施：

- `MAUI` 原生宿主壳与生命周期恢复逻辑
- `HybridWebView` 的稳定双向 bridge（JS ↔ C#）
- `Ionic React` 前端骨架与 hash 路由
- `MAUI` 与 `Ionic` 主题同步机制
- `App / Core / Web` 三层分离，方便后续换业务不换底盘

## 目录结构

- `src/MAUITemplate.App`：原生 MAUI 宿主、HybridWebView、bridge、主题同步、状态栏控制
- `src/MAUITemplate.Core`：共享契约、feature 元数据、配置与 diagnostics 模型
- `src/MAUITemplate.Web`：Ionic React 前端源码

## 当前前端架构

- `features`：按功能切片组织代码，例如 `features/home`、`features/settings`、`features/diagnostics`
- `zustand`：集中管理应用初始化状态、bridge 状态、系统信息、`featureDefinitions`
- `zod`：统一校验 native bridge 返回的数据结构，避免 JS/C# 契约漂移

当前已经内置几个模板级 feature slice：

- `features/home`：产品化首页入口
- `features/settings`：主题、支持链接、系统信息、bridge 能力
- `features/diagnostics`：运行态诊断信息

## 使用方式

### 1. 构建前端资源

在 `src/MAUITemplate.Web` 中安装依赖并构建。构建产物会自动复制到 `MAUITemplate.App/Resources/Raw/wwwroot`。

### 2. 运行 MAUI App

在 `src/MAUITemplate.App` 中运行或调试目标平台。

## 模板里的关键约定

### bridge 约定

- `appInit`：前端通知原生准备接收初始化信息
- `initData`：原生返回平台信息等启动载荷
- `appReady`：前端完成首屏渲染，原生可隐藏 splash
- `theme`：前端主题变化后通知原生同步状态栏/导航栏
- `pushNavigate`：原生向前端派发待处理导航

### 主题约定

- Ionic 颜色 token 在 `src/MAUITemplate.Web/src/theme/variables.css`
- MAUI 原生颜色 token 在 `src/MAUITemplate.App/Resources/Styles/Colors.xaml`
- 两边尽量维护同名/同值 token，避免主题漂移

## 建议你以后怎么用

- 把业务 API、模型、仓储接口优先放到 `Core`
- 把设备能力、通知、相机、文件、分享等放到 `App/Services`
- 把具体页面与状态管理放到 `Web`
- 在 `src/MAUITemplate.Web/src/features/<feature-name>` 下为每个功能建立独立目录
- 新增 bridge 返回结构时，先补 `zod` schema，再在 store 和页面里消费
- 新业务只扩展 `AppBridge`，不要改动桥的协议风格

更详细的说明见 `docs/architecture.md`。

## 当前状态

这个仓库现在已经是一个可继续迭代的模板仓库；以后新项目直接从这里复制/派生即可。
