## 目标与范围
- 建立一套系统化的UI规范，覆盖字体、颜色、间距、圆角、阴影、交互状态与核心组件（按钮、输入、选择、标签、标签页、模态、Toast、Tooltip 等）。
- 以“设计令牌”为核心，统一命名、语义化颜色与尺寸，并实现明暗主题切换。
- 与现有技术栈（Tailwind + 自建 shadcn 风格组件 + Radix Tabs）无缝融合，渐进式落地，降低改造成本。

## 现状与差距
- 已使用 Tailwind（`tailwind.config.cjs`）与全局样式（`src/styles/tailwind.css`），存在部分 CSS 变量（如 `--radius-md`）。
- 组件分散在 `src/components/ui/shadcn/*`，Radix 仅使用 Tabs；缺乏统一的令牌命名、主题切换与跨组件一致性。
- 当前为静态主题变量，无明暗模式切换逻辑；页面中存在零散的颜色类与不一致的交互细节。

## 设计原则
- 一致性优先：跨页面、跨组件的视觉与交互一致。
- 令牌驱动：所有视觉属性以语义化令牌表达并复用。
- 可主题化：支持浅色/深色与品牌自定义扩展。
- 可访问性：对比度、焦点可见性、键盘可用性达标。
- 渐进式落地：优先覆盖高频组件与页面，控制风险。

## 样式基础（设计令牌）
- 字体（Font Family）：`--font-sans`（系统默认或品牌字）、`--font-mono`（代码/数值）。
- 字体层级（Font Size/Line Height/Weight）：尺寸阶梯 `xs/sm/base/lg/xl/2xl/...`；行高与字重按层级配套（Tailwind 扩展映射）。
- 颜色（Color System）：
  - 中性灰阶：`neutral-50~900` 用于背景、边框、文字。
  - 语义色：`primary/secondary/success/warning/error/info` 定义 `bg/text/border` 三角色。
  - 品牌色：`brand` 系列，用作强调与主按钮。
- 间距（Spacing）：采用 4/8 基准网格，`spacing-1=4px`，优先使用 Tailwind 默认阶梯。
- 圆角（Radius）：`xs=4px, sm=6px, md=8px, lg=12px, xl=16px, full=9999px`（变量与 Tailwind `borderRadius` 同步）。
- 阴影（Shadow/Elevation）：`sm/md/lg/xl` 四档，用于卡片、弹层、顶层模态（高阶带遮罩）。
- 边框（Border）：宽度 `0/1/2` 与语义色 `border-app/border-muted/border-danger`。
- 动效（Motion）：时长 `fast=150ms / normal=200ms / slow=300ms`，缓动曲线统一。

## 主题系统
- 明暗主题：CSS 变量在 `:root` 与 `.dark` 下分别定义；Tailwind `darkMode: 'class'`。
- 主题切换：在应用根节点（`html` 或 `body`）切换 `dark` 类并持久化偏好（`localStorage`），优先遵循系统 `prefers-color-scheme`。
- 颜色实现：Tailwind `colors` 扩展引用 CSS 变量（例如 `rgb(var(--color-primary))`），组件仅使用令牌类。

## 组件规范
- Button：类型 `primary/secondary/ghost/danger`；尺寸 `sm/md/lg`；状态 `hover/focus/active/disabled/loading`；图标对齐与间距规范；禁用与加载视觉清晰。
- Input/Textarea：占位与标签规范；错误/禁用态；清晰的焦点环；字符计数与帮助文本。
- Select/Dropdown：可键盘导航；滚动与分组；空态与加载态。
- Tabs（Radix）：语义化尺寸与颜色令牌；活动态下边框/下划线统一。
- Badge/Tag：语义色系列与密度（紧凑/默认）。
- Modal/Dialog：尺寸与层级、遮罩透明度与动效规范；可关闭区域与聚焦陷阱。
- Toast/Alert：语义色方案；自动关闭与可达性提示。
- Tooltip：延时与位置；触屏兼容策略。

## 交互与状态
- 焦点环：统一 `outline` 与 `ring`，确保暗/浅色均清晰；禁用态不可聚焦。
- 错误与校验：字段错误文案规范；错误色对比度合规。
- 动效一致：统一时长与缓动；减少不必要动画并尊重“减少动效”系统设置。

## 无障碍与国际化
- 对比度：文本与关键UI至少 4.5:1；非文本至少 3:1。
- 键盘导航：Tab 顺序合理、可见焦点、Escape 关闭模态。
- ARIA：对弹层、Tabs、Toast 提供正确角色与属性。
- 文案与本地化：避免硬编码尺寸用语，支持多语言。

## 文档与展示
- 规范文档：在代码库内维护“设计令牌与组件规范”文档（与代码同仓，MDX/Storybook 二选一）。
- 演示页：提供组件示例与状态矩阵，作为开发与测试对齐依据。

## 实施步骤（结合当前技术栈）
1) 令牌落地
- 调整 `tailwind.config.cjs`：统一 `colors.brand/semantic`、`borderRadius`、`boxShadow`，映射到 CSS 变量。
- 完善 `src/styles/tailwind.css`：补齐 `:root/.dark` 的颜色、字体、间距、半径与动效变量；保留现有辅助类但改为基于令牌实现。
2) 主题切换
- 新增主题切换逻辑：在应用入口设置 `dark` 类与偏好存储；侦测 `prefers-color-scheme`，首次加载应用此偏好。
3) 组件对齐
- 重构 `src/components/ui/shadcn/*`：Button/Input/Badge/Tabs 先行统一到令牌与 Tailwind 语义类；抽象尺寸与变体；移除散落的硬编码颜色。
4) 页面治理
- 高频页面优先（首页、项目页等）：将零散 Tailwind 类替换为约定语义类与组件变体；统一焦点与错误提示。
5) 校验与演示
- 新增演示页面或 Storybook：覆盖组件的变体/状态矩阵，保证一致性与回归可见。

## 验收标准
- 所有颜色、字体、圆角、阴影均来源于令牌；组件不使用硬编码颜色。
- 明暗主题切换生效，首次加载遵循系统偏好，手动切换可持久化。
- Button/Input/Tabs/Badge 的尺寸与状态表现一致；焦点环与对比度达标。
- 关键页面已替换为规范组件与语义类，视觉与交互统一。

## 风险与兼容
- 渐进式替换防止回归；令牌命名稳定后再批量替换页面。
- 保留旧类短期兼容，提供迁移指南（组件与类映射）。

---
请确认上述方案是否符合预期；若有品牌色偏好或特定组件优先级（如先做 Button/Input），我将按此顺序在代码中开始落地实现。