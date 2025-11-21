## 当前状态评估
- 根容器已设置 `min-w`/`min-h`，但桌面窗口未设置系统级最小尺寸，可能导致缩放到低于 1280×800。
- 快捷操作按钮容器：`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[10px]`（src/pages/SoftwareHomepage.tsx:151）；按钮本身固定 `lg:w-[184px]`（152, 158, 164, 170, 176）。
- 该组合在大屏下会出现“按钮宽度小于栅格单元宽度”的情况，导致按钮在单元格内靠左，视觉上间距不一致。
- 项目卡片网格使用 `flex-wrap` 并保持 `gap-x/y 24px`（205），与 Figma 的 24px 间距一致。

## 主要问题
- 最小宽度/高度：Electron 窗口未设置最小尺寸，CSS 最小值无法约束系统窗口（electron/main.cjs:5–21）。
- 快捷按钮间距：栅格单元格宽度与按钮固定宽度不一致，产生视觉偏差；缺少单元内居中对齐。

## 优化建议（UI 与实现）
- 最小尺寸
  - 在桌面端强制窗口最小尺寸 1280×800：创建窗口后调用 `win.setMinimumSize(1280, 800)`（electron/main.cjs:15 之后）。
  - 保持页面根容器 `min-w-[1280px] min-h-[800px]`（src/pages/SoftwareHomepage.tsx:3）。
- 快捷按钮栅格
  - 在容器上新增单元对齐：`justify-items-center` 或 `place-items-center`，保证按钮在每个栅格单元居中（src/pages/SoftwareHomepage.tsx:151）。
  - 小屏按钮 `w-full`，随列宽自适应；桌面 `lg:w-[184px]` 固定像素，仍保持居中。
  - 如需严格 1:1 行宽：可改为 `lg:flex lg:flex-nowrap lg:justify-between` + 按钮 `basis-[184px] grow-0`，确保 5 个按钮在一行均匀分布且间距精确。
- 间距与断点
  - 保留容器 `gap-[10px]`（符合 Figma `.frame` 的 10px 列间距）；若 Figma 在 `21:23` 节点不同断点有差异，按断点分别应用 `sm:gap-[10px] lg:gap-[10px]`。
- 交互规范
  - 每个按钮保持独立交互元素，内部仅图标+文本，避免交互元素嵌套交互元素（遵循交互嵌套规范）。

## 代码层面的具体改动（不立即执行）
- electron/main.cjs:15–21
  - 添加：`win.setMinimumSize(1280, 800)`。
- src/pages/SoftwareHomepage.tsx:151
  - 容器类名修改：`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[10px] justify-items-center self-stretch`。
- src/pages/SoftwareHomepage.tsx:152, 158, 164, 170, 176
  - 按钮类名保持：`h-[50px] w-full lg:w-[184px]`，以匹配小屏自适应与桌面固定像素，同时通过容器居中实现视觉一致。
- 可选方案（更严格像素控制）：
  - 将容器在 `lg` 切换为 `flex`：`lg:flex lg:flex-nowrap lg:justify-between`；按钮：`lg:basis-[184px] lg:grow-0`，完全按 5×184px + 4×gap 布局计算。

## 验证与验收标准
- 最小尺寸：窗口无法缩小到小于 1280×800；内容不出现溢出或裁切。
- 快捷按钮：在 `lg` 下 5 个按钮居中且间距一致；在 `sm`/`base` 下按钮等宽占满列，换行不出现不均匀空隙。
- 卡片网格：保持 24px 行/列间距；缩略图与信息区尺寸与 Figma 1:1。
- 无交互嵌套：按钮点击区域清晰，hover/focus 状态一致。

## 执行顺序
1) 设置 Electron 窗口最小尺寸（主进程）。
2) 更新按钮容器对齐方式（居中）。
3) 回归测试：不同视口宽度下按钮与卡片间距、换行与对齐。
4) 视觉核对：对照 Figma 节点 `21:23` 与 `23:653`，逐项比对尺寸与间距。

请确认以上方案，我将按照该计划进行实现与验证。