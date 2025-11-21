## 审查结论
- 弹窗：
  - `src/components/ui/dialog.tsx` 中 Overlay 使用 `bg-black/80`（第18行），未绑定语义变量；Content 使用任意圆角 `sm:rounded-[8px]`（第34行），边框为 `border-app`，与 shadcn 语义色 `border` 不一致。
  - Header/Footer 间距类与边框色混用（第47、52行），Title/Description 的品牌类规范性较好，但尺寸体系与其他页面不完全一致。
  - 动效类较多（zoom/fade/slide），未统一到一套时长与曲线。
- 项目界面（SoftwareHomepage）：
  - Hero 叠加层与角标大量硬编码：`bg-[#00000066]`（第152行）、`bg-[#00000080]`（第242行）；背景渐变使用 `#000000b2/#00000033`（第230行）。
  - 顶栏最小化图标条为硬编码 `#a1a1aa`（第192行）；大量 `rounded-[12px]/[8px]` 与 `gap-[10px]` 等任意值类。
  - 搜索框/视图切换按钮状态色未统一到语义层（`text-secondary` 与 `bg-surface` 组合可进一步规范）。
- 文案创作页（CopywritingCreationInterface）：
  - 操作区与历史菜单使用硬编码色：`hover:bg-[#2a2a2e]`（第1138行）、`hover:bg-[#1e1f22]`（第1307行）、删除按钮 `bg-[#2a2a2e] hover:bg-[#3a3a3f]`（第1312行）。
  - 大量 `rounded-[6px]`、`text-[11px]`、`w-[28px]` 等任意值类，脱离主题刻度与最小触达尺寸规范。

## 规范建议（针对以上问题）
- 色彩语义统一：仅使用 `src/styles/tailwind.css` 的 HSL 语义变量（`--background/--foreground/--primary/...`），页面和组件层全部通过 Tailwind 映射类（如 `bg-popover/bg-background/border-border/text-muted-foreground` 或项目现有 `bg-surface/bg-app/border-app` 的语义别名）而非直接 `#xxxxxx`。
- 圆角与间距：统一到 `--radius` 与 Tailwind 标准刻度；移除 `rounded-[6px]/[8px]` 与 `gap/[px-*]` 等任意值类，替换为 `rounded-sm/md/lg`、`gap-2/3/4` 等。
- 弹窗动效：统一为 `duration-200 ease-out`，入场 `fade+scale`、离场对称；Overlay 采用 `bg-background/60` 或 `bg-black/50`+`backdrop-blur-sm` 的语义化组合，z-index 与其它浮层（菜单/Toast）设立阶梯（如 Overlay:50、Dialog:60、Toast:70）。
- 交互与可访问性：所有可点元素统一 `focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background`；按钮最小触达 `h-10 px-4`。

## 改造范围（仅弹窗与项目界面）
- 弹窗（`src/components/ui/dialog.tsx`）：
  - Overlay：改为语义背景 `bg-background/60`（或 `bg-popover/60`），保留 `backdrop-blur-sm`。
  - Content：背景/边框统一为 `bg-popover border-border`，圆角改 `rounded-md`（走 `--radius`），尺寸 `max-w-lg` 与 `sm:max-w-xl` 统一。
  - Header/Footer：统一间距（如 `pb-4/pt-4`）、边框色 `border-border`，Title/Description 使用品牌字号但走统一层级。
- 项目界面（`src/pages/SoftwareHomepage.tsx`）：
  - Hero：将线性渐变与叠加层从硬编码改为语义色（如 `bg-black/70` 改为 `bg-background/70`），角标背景替换为语义遮罩类。
  - 顶栏图标与装饰色：用 `text-secondary`/`border-border`，移除内联 `#a1a1aa`。
  - 任意值类：统一 `rounded-md`、`gap-2/3`、`min-h` 与 `min-w` 用断点限制而非硬编码。
- 文案创作页（重点浮层/菜单）：
  - 历史菜单与确认弹出层：背景/边框统一到 `bg-popover border-border shadow-popover`，悬停色用 `hover:bg-muted`；删除按钮禁用硬编码色。

## 执行步骤
1. 弹窗基线调整：统一 Overlay/Content/Header/Footer 的语义色、圆角与动效（不变更交互逻辑）。
2. 项目界面 Hero 与角标的硬编码色替换为语义遮罩；顶栏图标与分割线统一到语义色。
3. 清理任意值类：优先替换 `rounded-[6/8px]`、`gap-[10px]`、`bg-[#..]` 等；将尺寸统一到刻度与最小触达规范。
4. 可访问性统一：为主要按钮与交互元素补齐 `focus-visible` 样式；验证键盘操作与对比度。
5. 验证与回归：逐页核查视觉一致性与暗黑模式表现，修复偏差。

## 交付与验证
- 提交统一后的 Dialog 与页面样式改动；截图对比（亮/暗两套）。
- 列出替换映射表（硬编码→语义类）。
- 可访问性自检清单（焦点、对比度、键盘）。

确认后我将按此计划对弹窗与项目界面进行改造，并提交具体改动以供审阅。