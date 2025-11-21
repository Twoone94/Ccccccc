## 总体方向
- 采用 shadcn 的设计思想（令牌驱动 + 组件变体 + Radix 基础）并与现有技术栈（Tailwind + 自建组件 + Radix Tabs）融合。
- 在不强依赖外部库的前提下先落地轻量方案；如需更强变体管理，再增量引入 `class-variance-authority` 或 `tailwind-variants`。

## 设计令牌（Design Tokens）
- 字体：`--font-sans`/`--font-mono`；尺寸阶梯 `xs/sm/base/lg/xl/2xl/...`，行高与字重规范化（Tailwind `font-` 与 `leading-` 映射）。
- 颜色：
  - 中性灰阶 `neutral-50~900`（背景/边框/文字）。
  - 语义色 `primary/secondary/success/warning/error/info`，每个包含 `bg/text/border` 角色。
  - 品牌色 `brand` 系列用于主行动与强调。
- 间距：4/8 基准网格（优先 Tailwind 默认阶梯）；组件内部 `gap/padding` 用语义尺寸 `sm/md/lg` 映射。
- 圆角：`xs=4 sm=6 md=8 lg=12 xl=16 full`，同步到 Tailwind `borderRadius`。
- 阴影：`sm/md/lg/xl` 四档；高层弹层增加遮罩变量。
- 动效：`fast=150ms / normal=200ms / slow=300ms` +统一缓动曲线。

## 主题系统
- 明暗主题：CSS 变量分别在 `:root` 与 `.dark` 定义；Tailwind `darkMode: 'class'`。
- 切换策略：根节点切换 `dark` 类并持久化偏好；首次加载遵循 `prefers-color-scheme`。
- Tailwind 映射：`tailwind.config.cjs` 的 `colors/borderRadius/boxShadow` 基于 CSS 变量扩展；组件只使用语义类。

## 响应式设计规范
- 断点：`sm=640px` `md=768px` `lg=1024px` `xl=1280px` `2xl=1536px`（沿用 Tailwind 默认）。
- 容器：统一 `container` 水平居中，内边距 `px-4 md:px-6 lg:px-8`；页面宽度 `max-w-screen-lg/xl` 依据页面类型设定。
- 排版：
  - 栏布局：桌面 `lg:` 侧边栏 + 内容，移动折叠为 `Drawer`；
  - 栅格：`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`，统一卡片最小宽度与行高；
  - 堆叠组件：提供 `Stack`（垂直间距）、`Inline`（水平换行）实用封装。
- 字体与标题：
  - 支持流式字体（`clamp`）用于大标题；
  - 正文在 `sm` 缩至 `text-sm`，`md+` 为 `text-base`；标题在小屏降低层级与行高。
- 表单：
  - 输入控件默认 `w-full`，栅格中 `sm:` 两列、`md:` 三列；
  - 标签与占位响应式折行，错误提示可在移动端移至下方。
- 表格与数据密度：
  - 小屏横向滚动（`overflow-x-auto` + `min-w-*`），表头粘滞；
  - 列隐藏策略：在 `sm` 隐藏非关键列，`md+` 展示完整信息。
- 弹层与抽屉：
  - Modal 在 `sm` 采用近全屏（`max-w-full h-[90vh]`）；
  - Sidebar 在移动端切换为 `Drawer`（遮罩与手势关闭）。
- 导航：
  - 桌面侧栏 + 顶栏，移动顶栏 + 汉堡按钮；
  - 面包屑在小屏可能折叠为回退按钮。
- 可访问性与性能：
  - 焦点环在浅/深色均清晰；
  - 小屏减少动画，尊重系统“减少动效”；
  - 图片与插画使用 `responsive`/`lazy`。

## 组件规范（对齐 shadcn）
- Button：变体 `primary/secondary/ghost/danger`，尺寸 `sm/md/lg`；状态 `hover/focus/active/disabled/loading`；图标与文本间距固定；在 `sm` 紧凑密度。
- Input/Textarea：标签/占位规则；错误/禁用态；统一焦点环；在小屏控件 `w-full`；
- Select/Dropdown：键盘可达，选项分组；`sm` 触屏交互区域加大。
- Tabs（Radix）：语义色与尺寸统一；小屏切换为可滚动或下拉选择。
- Badge/Tag：语义色系列，`sm` 密度；
- Modal/Dialog/Toast/Tooltip：尺寸、遮罩、动效与 ARIA 一致，移动端策略明确。

## 文档与演示
- 建立规范文档与演示页（MDX 或 Storybook），包括：令牌一览、组件变体矩阵、响应式示例、无障碍用例。

## 实施步骤
1) 令牌与主题：完善 `src/styles/tailwind.css` 的 `:root/.dark` 变量；在 `tailwind.config.cjs` 映射到 Tailwind 主题扩展。
2) 主题切换：在应用入口实现 `dark` 切换与偏好持久化（遵循系统偏好）。
3) 组件对齐：重构 Button/Input/Tabs/Badge 到令牌与语义类；需要更强变体时增量引入 `cva` 或 `tailwind-variants`。
4) 响应式治理：统一容器与栅格；重构高频页面（如文案创建页、项目页）到规范布局与组件；
5) 校验与演示：通过演示页/Storybook 验证各断点表现、交互状态与无障碍。

## 验收标准
- 颜色/字体/圆角/阴影仅来源于令牌；组件不含硬编码颜色；
- 明暗主题可切换并持久化；首次加载遵循系统偏好；
- Button/Input/Tabs/Badge 在各断点表现一致，焦点环与对比度达标；
- 高频页面完成响应式改造（容器、栅格、折叠策略统一）。

---
请确认是否按以上方案推进，并告知品牌主色偏好（如 `#3b82f6` 或自定义色值）以及你更倾向“轻量模式”（不新增依赖）还是“标准模式”（引入 `cva/tailwind-variants`）。确认后我将开始在代码中逐步落地。