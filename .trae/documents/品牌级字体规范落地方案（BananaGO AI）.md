## 定位与目标
- 为 BananaGO AI 建立品牌级字体规范：统一字体族、字号阶梯、行高、字重、字距、数字样式与响应式规则，覆盖页面与组件场景。
- 兼容中文环境与桌面/网页（Electron + Web），默认使用系统级中文友好字体栈；可选引入品牌字体（如 Inter/Noto Sans）作为增强方案。

## 品牌字体栈
- 品牌正文字体（Brand Sans）：`system-ui, -apple-system, Segoe UI, Roboto, Noto Sans SC, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica, Arial, sans-serif`
- 品牌等宽字体（Brand Mono）：`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Courier New, monospace`
- 数字与对齐：默认启用等宽数字特性（`font-feature-settings: 'tnum' 1` 或 Tailwind `tabular-nums` 工具类）在数据密集型区域（表格、统计、输入数值）。

## 品牌字号阶梯（px，对应 Tailwind 类映射）
- Display（营销/主标语）：`display-lg: 32/40`，`display-md: 28/36`，`display-sm: 24/32`（行高建议 1.25–1.3）
- 标题：`h1: 24/32`，`h2: 20/28`，`h3: 18/26`
- 标题-次要：`title-lg: 18/26`，`title-md: 16/24`，`title-sm: 15/22`
- 正文：`body-md: 14/22`（默认），`body-sm: 13/20`，`body-xs: 12/18`
- 微文案/标签：`label-xs: 11/16`（仅用于徽章/Tag/状态点，不用于长文）
- 等宽/代码：字号跟随正文阶梯，`mono-md` 对应 `14/22`
- 字重：`regular(400)/medium(500)/semibold(600)/bold(700)`；中文优先 `medium/semibold` 作强调，避免过粗造成笔画黏连。
- 字距：标题 `tracking-tight`（-0.5px 左右，中文保持 `normal`），正文 `tracking-normal`。

## 应用场景规范
- 页面级：
  - 顶部标题栏（Toolbar 文案提示）：`body-xs 12/18`；轻干扰、可读即可。
  - 页面主标题：工具类页面 `h2 20/28`，内容类页面 `h1 24/32`；营销横幅可用 `display-md 28/36`。
  - 区块标题/卡片标题：`title-md 16/24` 或 `h3 18/26` 视信息量选择。
- 组件级：
  - Button 文案：`body-sm 13/20`（主要/次要/幽灵一致），小尺寸按钮可用 `body-xs 12/18`。
  - Input/Select 文本：`body-sm 13/20`；占位与帮助文案 `body-xs 12/18`。
  - Badge/Tag：`label-xs 11/16`；对比度与圆角受令牌控制。
  - Modal 标题：`title-md 16/24` 或 `h3 18/26`；内容正文 `body-md 14/22`。
  - Tabs 标签：`body-xs 12/18`；选中态可 `font-medium` 强化。
  - Toast/Tooltip：`body-xs 12/18`；保持轻量与清晰。
  - 表格/统计：`body-xs 12/18`；数字统一 `tabular-nums`；总计/关键数值 `font-semibold`。

## 响应式规则（Tailwind 断点）
- 断点沿用：`sm(640)/md(768)/lg(1024)/xl(1280)/2xl(1536)`。
- 缩放策略：
  - Display/营销：`sm:display-sm` → `md:display-md` → `lg:display-lg`
  - 页面标题：小屏 `h2`，桌面 `h1`（内容页）；工具页保持 `h2` 不扩。
  - 正文：默认不缩放，保证可读性；仅在超窄区域可降为 `body-sm`。

## 基础实现（不立即修改，仅说明）
- 全局令牌：在 `:root` 定义 `--font-brand-sans`、`--font-brand-mono`；`@layer base` 应用到 `html/body` 与标题元素。
- Tailwind 映射：在 `tailwind.config.cjs` 扩展 `fontFamily.brandSans/brandMono` 与 `fontSize` 自定义刻度（含行高）。
- 实用类：新增 `brand-h1/h2/h3/title-md/body-md/body-sm/body-xs/label-xs/mono-md` 等语义类，底层用 `@apply text-*/leading-* font-* tracking-*`。
- 数字类：提供 `nums-tabular`（`font-feature-settings: 'tnum' 1` 或 `tabular-nums`）。

## 页面/组件落地计划
1) 替换首页（SoftwareHomepage）：
- Hero 标题：从 `text-3xl` 迁移到 `display-md`（28/36）；副标题改为 `body-md`（14/22）。
- 侧边导航与快速操作：统一 `body-sm` 文案；提示语 `body-xs`。
2) 文案创作页（CopywritingCreationInterface）：
- 页面区块标题“原文”“文案创作”：统一为 `title-md 16/24`（工具页风格）；小屏 `body-sm`。
- 工具栏与标签：统一 `body-xs`。
3) 项目页（ProjectInterface）：
- 顶部项目名：`title-md 16/24`；统计数值 `body-xs + nums-tabular`。
4) 会话设置（ConversationSettings）：
- 标签/按钮/选择项文案统一 `body-xs/body-sm`；标题为 `title-md`。
5) 组件库治理：
- Button/Input/Badge/Tabs/Modal/Toast 等统一引用品牌语义类；移除像素级 `text-[px]` 与内联 `font-family`。

## 可选增强（品牌字体引入）
- 若需更强品牌识别度，可引入 `Inter`（拉丁）+ `Noto Sans SC`（中文）并通过 `@font-face` 与本地资源打包；使用策略：标题优先 `Inter`，正文优先 `Noto Sans SC`（自动回退）。
- 审核包体与加载性能：仅引入常用字重 `400/500/600`；懒加载在营销页或大标题场景。

## 验收标准
- 所有页面/组件按品牌语义类使用，不出现像素级字号与内联 `font-family`。
- 页面类型（内容/工具/营销）在标题规模与字重表现一致。
- 数据区域数字为等宽显示；可读性与对比度达标。
- 响应式缩放策略在各断点下视觉层级稳定。

## 交付物
- 设计令牌与 Tailwind 配置变更方案。
- 语义类清单与使用示例（页面/组件矩阵）。
- 迁移映射表：从现有 `text-[12/13/14/16/18/30px]` → 品牌语义类。

---
请确认以上品牌级字体规范方案是否符合预期。确认后我将按此方案：先创建品牌语义类与 Tailwind 字号映射，再分批替换首页、文案创作页、项目页与会话设置的文案与标题尺寸。