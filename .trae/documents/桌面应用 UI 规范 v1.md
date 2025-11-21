## 目标

* 生成一份结构清晰、可直接落地的「桌面应用 UI 规范 v1（简体中文）」全文。

* 全文包含品牌与风格、Design Tokens（含命名与数值）、组件规范、布局模板、交互规范、Windows 平台规范、文案规范、交付建议。

* 融合已确认的增量：明确主色 vs 信息色角色；圆角统一 4/8/12；表格密度提供两档（40/32）。

## 交付内容

* 「UI 规范 v1」完整文本（可直接作为设计与开发依据）。

* 精炼版「设计 Tokens 列表」：颜色、字体、字号、字重、间距、圆角、阴影、边框、图标、表格密度。

* 代码落地示例：CSS 变量命名示例与主题对象键名（如 `--color-primary-default`、`font.size.body`、`space.md`）。

## 文档结构

* <br />

  1. 品牌与风格：关键词 + 视觉调性 + 场景描述（主界面/设置/弹窗）。

* <br />

  1. Design Tokens：

  * 命名规范：`color.<category>.<role>`、`font.size.*`、`radius.*`、`space.*` 等。

  * 颜色系统：主色/辅色/灰阶/功能色/文本/背景/边框（具体数值与用途）。

  * 字体与字重：中英文字体推荐、字号/行高/字重矩阵（H1/H2/H3/Body/Caption/按钮）。

  * 圆角/边框/阴影：统一 4/8/12，边框 1px，卡片/弹窗阴影级别与原则。

  * 间距与栅格：4/8 体系层级表、组件内外间距、页面边距、12 栅格参考。

  * 图标与插画：线性圆角、描边 1.5px；16/20/24px 使用场景；插画风格与场景。

* <br />

  1. 组件规范（逐项给出用途/尺寸/类型/状态/文案）：

  * 按钮（primary/secondary/ghost/danger；Default/Hover/Active/Disabled/Focus）

  * 输入框（default/password/search；Focus/Disabled/Error）

  * 下拉框（单/多选/搜索；列表项尺寸与状态）

  * 单选/复选（尺寸 16/20；各状态）

  * 表格（行高 40、表头 44、斑马/悬停/空态；密度档位 Default=40、Compact=32）

  * 标签页（underline 风格、状态）

  * 弹窗（尺寸 sm/md/lg、遮罩与阴影、何时模态）

  * 通知/提示（位置与停留时间；成功/警告/错误/信息的样式）

* <br />

  1. 布局与页面模板：通用结构；列表/详情/设置页的典型布局与数值；窗口响应规则（min-width 960 / min-height 600，折叠优先级）。

* <br />

  1. 交互规范：快捷键与 Tab 顺序；Hover/Focus/Active/Error 的反馈；动画时长与缓动；无障碍对比度与冗余表达。

* <br />

  1. Windows 规范：标题栏与系统按钮区域；窗口默认/最小尺寸与高 DPI；系统对话框 vs 自定义弹窗的使用原则。

* <br />

  1. 文案与命名：按钮/菜单动词开头；错误提示可操作与不恐吓；多语言预留。

* <br />

  1. 交付建议：Tokens 输出形式、CSS 变量示例、组件库按 type/state 引用 Tokens 的约定。

## 关键数值与约定（将并入全文）

* 主色：`color.primary.default: #0078D4`（主按钮/选中/焦点/激活标签）；信息色：`color.info.default: #3B82F6`（消息条的信息型）。

* 圆角：`radius.sm: 4`、`radius.md: 8`、`radius.lg: 12`。

* 表格密度：`table.density.default.rowHeight: 40`，`table.density.compact.rowHeight: 32`，表头 `44`。

* 间距层级：`space.xs:4`、`sm:8`、`md:12`、`lg:16`、`xl:24`、`2xl:32`。

* 字体与字号：`h1 24/32/600`、`h2 20/28/600`、`h3 18/26/500`、`body 14/22/400`、`caption 12/18/400`、按钮 `14/22/500`。

## 输出方式与落地

* 直接在下一步输出完整规范正文与附带的 Tokens 列表与 CSS 变量示例。

* 可选增量（如需）：附带 JSON 主题对象示例，便于开发导入。（默认不生成代码文件，只在文档中展示示例）

## 说明

* 若无进一步变更指示，将按上述约定整合并输出完整版文档；后续可迭代 v1.1 增补更多组件（面包屑、分页、Tag、Badge、Stepper 等）。

---

## 圆角规范落地与代码迁移计划（rounded-[6px] → rounded-sm）

### 背景与目标
- 统一小型控件圆角到 Design Tokens `radius.sm = 4px`，替换代码中的 `rounded-[6px]` 及其方向变体，提升风格一致性。
- 不影响使用 `rounded-[8px]`、`rounded-md` 等更大圆角的卡片/容器；仅针对 6px 的历史写法做标准化。

### 变更范围
- 页面与组件中所有 `rounded-[6px]`、`rounded-bl-[6px]`、`rounded-br-[6px]`、`rounded-tl-[6px]`、`rounded-tr-[6px]`、`rounded-r-[6px]`。
- 已完成文件：
  - `src/pages/CopywritingCreationInterface.tsx`
  - `src/components/business/SettingsDialog.tsx`
  - `src/components/business/SettingsDialogFigma.tsx`
  - `src/components/ui/Modal.tsx`
  - `src/pages/SoftwareHomepage.tsx`
  - `src/components/business/NewProjectDialog.tsx`
  - `src/components/business/ConversationSettings.tsx`

### 映射策略（类名对照）
- `rounded-[6px]` → `rounded-sm`
- `rounded-bl-[6px]` → `rounded-bl-sm`
- `rounded-br-[6px]` → `rounded-br-sm`
- `rounded-tl-[6px]` → `rounded-tl-sm`
- `rounded-tr-[6px]` → `rounded-tr-sm`
- `rounded-r-[6px]` → `rounded-r-sm`

### 操作步骤（供 IDE 执行）
- 搜索：`rounded-\[6px\]|rounded-(bl|br|tl|tr|r)-\[6px\]`。
- 仅替换 6px 圆角；保留 `rounded-[8px]` 等更大圆角的卡片/容器类名。
- 优先在局部按文件核对并替换，避免误改字符串模板或注释。

### 验证与质量保障
- 运行 `npm run lint`：确保 Tailwind 类名与 TS/JS 语法无误。
- 运行 `npm run typecheck`：保证类型与声明完整。
- 手动走查交互：窗口控制按钮、设置页 Tab、输入框与操作按钮 hover/focus 状态的圆角是否一致。
- 本地预览：`http://localhost:5175/`（桌面开发命令已启动）。

### 关键改动引用（便于定位）
- `src/pages/CopywritingCreationInterface.tsx`：消息列表气泡与工具栏按钮统一到 `rounded-sm`（例如 869、1011、1094、1119 等处）。
- `src/components/business/SettingsDialog.tsx`：侧边导航与输入容器统一到 `rounded-sm`（例如 88–96、121、143、153、170）。
- `src/components/business/SettingsDialogFigma.tsx`：侧边按钮与表单控件统一到 `rounded-sm`（例如 47、58、71、80、89、94、100、104、118）。
- 其他：`src/components/ui/Modal.tsx`、`src/pages/SoftwareHomepage.tsx`、`src/components/business/NewProjectDialog.tsx`、`src/components/business/ConversationSettings.tsx` 的局部按钮/输入统一到 `rounded-sm`。

### 风险与回滚
- 风险：局部方向圆角（如 `rounded-r-*`）可能影响左右拼接边界的视觉；已按方向映射处理。
- 回滚：若出现视觉不匹配，可将个别控件从 `rounded-sm` 回调为更大圆角（如 `rounded-md`）并在规范中登记例外。

### 后续建议
- 二期统一 `rounded-[8px]` → `rounded-md`，清理自定义尺寸写法，全面转向 Design Tokens 对应的语义类名。
