## 目标
- 使用 shadcn MCP 提供的 v4 `Select` 组件替换现有下拉框，实现一致的交互、焦点态与主题语义。
- 提供 `size` 变体、统一 `focus-visible` ring、规避任意值类，保证在亮/暗主题下表现一致。

## 现状
- 现有组件：`src/components/ui/select.tsx` 已基于 Radix，但样式与交互细节与 v4 规范存在偏差（无 `size` 变体、无 `data-slot`、触发器宽度与文本裁剪样式不完全统一）。
- 使用点：
  - 文案页：`src/pages/CopywritingCreationInterface.tsx:1031-1065`（平台与模型切换）。
  - 其他页可能也有引用（以项目全局搜索为准）。

## 方案
- 引入 MCP 的 v4 `Select` 源码（已获取），落地到 `src/components/ui/select.tsx`：
  - 保留导出：`Select/SelectTrigger/SelectContent/SelectItem/SelectGroup/SelectLabel/SelectSeparator/SelectValue`。
  - 新增：`SelectTrigger` 支持 `size`（`sm|default`），统一 `focus-visible`、禁用态；增加 `data-slot` 标记以便后续样式审计。
  - `SelectContent` 增加 `align` 透传，维持 `position="popper"` 默认弹出逻辑；Viewport 设置与滚动按钮按 v4 保持。
  - 类名与语义色：统一到 `border-input/bg-popover/text-popover-foreground/focus-visible:ring-[3px]/ring-ring` 等。
- 使用规范：
  - 触发器宽度统一在调用处控制，例如 `className="w-[180px]"` 或 `w-full`；文本溢出使用内置裁剪（`line-clamp-1`）。
  - 列表项采用语义化焦点高亮（`focus:bg-accent`）。
  - 分组/分隔符使用 `SelectGroup/SelectLabel/SelectSeparator`。

## 落地改造清单
1. 组件替换：用 MCP v4 代码覆盖 `src/components/ui/select.tsx`，适配项目的 `cn` 与 `lucide-react` 图标。
2. 页面适配：
   - 文案页 `CopywritingCreationInterface.tsx` 的两个 `Select` 调用处：移除自定义 `text-[11px]` 等任意值类，改为用组件默认字号；保留 `w-[92px]/w-[120px]` 等宽度约束或改为语义宽度。
   - 若有其他页面使用，统一触发器样式与宽度。
3. 交互与可访问性：确保 `focus-visible` 在键盘导航下显式可见；禁用态一致。
4. 验证：亮/暗主题、长选项、禁用、分组、滚动、键盘导航（上下/回车）均检查；尝试在多处同时使用验证 Popper 对齐。

## 兼容性
- API 基本保持一致（Radix Root/Trigger/Content/Item 等）；新增 `size` 为可选，不影响现有调用。
- 类名变化只影响视觉与交互，不改变功能；如有自定义覆盖样式，需同步更新。

## 验收标准
- 视觉：触发器、高亮、分组、禁用态、滚动按钮符合 shadcn v4 示例表现。
- 交互：键盘可达、焦点 ring 一致、长文案裁剪良好。
- 主题：亮/暗模式下对比度与阴影正确。

确认后我将：
- 用 MCP 代码更新 `src/components/ui/select.tsx` 并在两处页面完成适配；
- 运行本地预览进行验证，提交具体改动供你审阅。