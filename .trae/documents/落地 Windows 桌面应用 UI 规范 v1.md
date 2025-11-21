## 总体结论
- 现有工程已具备设计 Token 与工具类：`src/styles/tailwind.css` 的 `:root` 定义了主色/信息/成功/警告/错误、文本、背景、边框、圆角、字体，以及表格行高密度变量（`--table-row-height-default/compact`）。
- 工具类已覆盖：`text-success/warning/error/info`、`bg-*subtle`、`text-primary/secondary`、`bg-app/surface` 等。
- 主要差异与可优化：
  - 组件仍有直写色值，未统一使用 Token（例如 `SettingsDialog.tsx:112`）。
  - 输入框的聚焦态使用灰色而非主色焦点环（`src/components/ui/shadcn/Input.tsx:10`）。
  - Modal 宽度与规范不一致（当前 `sm=480`、`md=768`、`lg=960`；规范建议 `sm=480`、`md=640`、`lg=840`）（`src/components/ui/Modal.tsx:21`）。
  - 信息色（info）的工具类已定义，但在业务中使用较少（Toast/Message 通道未统一）。
  - 表格组件尚未实现，但密度 Token 已具备。

## 针对反馈的明确处理
1. 主色 vs 信息色（两个蓝）
- 约定：`primary` 用于品牌、高亮、主按钮、焦点环；`info` 专用于“信息型”提示（Toast/Message Bar 的信息态）。
- 行动：统一把业务中的提示/状态用 `text-info/bg-info-subtle` 对应“信息态”，按钮/焦点环用 `primary`，避免混用。

2. 圆角数值（统一与保留）
- 当前已采用 4/8/12（`:root` 中 `--radius-sm:4px; --radius-md:8px; --radius-lg:12px`），满足“4 的倍数”体系。
- 如需改回 6/8/12，可在确认后仅替换 `:root` 的半径变量，组件将随之统一。

3. 表格/列表密度
- Token 已存在：`--table-row-height-default: 40px`、`--table-row-height-compact: 32px`（`src/styles/tailwind.css:55–56`）。
- 行动：新增通用密度工具类（`row-density-default/compact`），并在新建的 Table 组件中通过 `density` 属性切换。

## 实施计划（分步骤）
### 1. Tokens 审核与补全
- 审核 `src/styles/tailwind.css:18–57` 的 Token 与命名，补齐规范中的缺失项（如 `shadow.card/dialog`、`space.*`、`font.family.cn/en`、`font.weight.*`），保持命名 `color.<category>.<role>` 映射到 `--color-*`。
- 在 `@layer utilities` 补充：`focus-ring-primary`（2px 半透明主色）、`btn-secondary/ghost/danger`、`select-*` 状态类、`tabs-underline` 变体工具类。

### 2. 组件一致化改造
- Button：抽象 `Button` 组件（变体：`primary/secondary/ghost/danger`；尺寸：`sm/md/lg`；状态：`hover/active/focus/disabled`），以 Token 组合样式，替换页面中的散点 class。
- Input：将 `focus` 改为主色焦点环：`focus:border var(--color-primary-default)` + `focus:ring rgba(0,120,212,0.25)`（参考 `src/components/ui/shadcn/Input.tsx:10`）。
- Select：统一触发区、弹层圆角与状态；使用 `radius.md`、`border.default`、`primary.focus`，与 Input 保持一致。
- Tabs：提供 `underline` 风格变体（激活下划线 2px 主色、悬停背景提升为 `gray.50`），在 `src/components/ui/shadcn/Tabs.tsx` 增加变体。
- Dialog（Modal）：将 `md/lg` 宽度改为 `640/840`，圆角使用 `radius.lg`，遮罩为 `rgba(0,0,0,0.40)`，阴影使用 `shadow.dialog`（`src/components/ui/Modal.tsx:21,34`）。
- Toast/Message Bar：新增统一组件 `MessageBar`（位置右上或顶部；类型 `success/warning/error/info`；背景使用 `*subtle`，左侧色条为 `*default`），并提供静态 `Toast` 容器或接入 `sonner`。

### 3. 替换直写色值为 Token
- 文件：
  - `src/components/business/SettingsDialog.tsx:112` 改用 `text-success/text-warning/text-error`。
  - 页面中 `#27272A/#18181b/#3f3f46` 等直写色值，替换为 `bg-surface/bg-app/border-app` 等工具类。
  - Buttons 的 `hover/active` 改为 `primary.hover/active` 工具类组合。
- 目标：将所有“hex 直写”替换为命名 Token/工具类，确保颜色一致与可主题化。

### 4. 表格组件与密度工具类
- 新增 `Table` 组件：
  - 表头：`bg-layer2`、文字 `semibold`、底线 `border-app`；排序图标 `icon.size.16`。
  - 行：默认行高 `--table-row-height-default`，紧凑行高 `--table-row-height-compact`，斑马线 `bg-gray.50`，悬停 `bg-app`（浅提升）。
  - 选中行边线：`border-primary-default`。
- 新增工具类：`row-density-default/compact`，同时提供 `row-hover` 与 `row-selected` 状态类，便于列表复用。

### 5. 无障碍与 Windows 细节
- 对比度校核：按钮与文本满足 ≥4.5:1；交互与背景 ≥3:1。
- 焦点环统一可见：`focus-ring-primary` 应用到可聚焦控件。
- 标题栏：保持最小化/最大化/关闭按钮点击区 ≥40×32；`Toolbar` 的拖拽与可点击区分已正确（`src/components/ui/Toolbar.tsx`）。

### 6. 交付变更范围
- `src/styles/tailwind.css`：补 Token 与工具类、添加阴影/间距/焦点环。
- `src/components/ui/Modal.tsx`：调整尺寸与阴影。
- `src/components/ui/shadcn/Input.tsx`：改焦点环为主色。
- `src/components/ui/Button.tsx`（新增）：统一按钮变体。
- `src/components/ui/MessageBar.tsx`（新增）：统一通知/提示。
- 若使用表格：`src/components/ui/Table.tsx`（新增）。
- 若时间允许：替换各页面直写色值与散点样式为工具类（`SettingsDialog.tsx`、`NewProjectDialog.tsx:188–199`、`CopywritingCreationInterface.tsx` 等）。

## 验证与准入
- 单页人工巡检：按钮、输入、Tabs、Dialog 的状态在 Hover/Focus/Active/Disabled 下是否符合规范。
- 快速可视化验证：运行桌面开发模式，检查标题栏与拖拽区域；使用 `MessageBar` 模拟四类状态与停留时间。
- 对比度检测：抽样颜色比值核验 ≥4.5:1。

请确认以上计划；确认后我将开始逐项改造并替换散点样式为规范化 Token 与组件。