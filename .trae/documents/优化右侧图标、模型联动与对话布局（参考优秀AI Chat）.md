## 目标
- 右侧三枚图标使用高辨识度的内联SVG，语义明确、对比度与尺寸统一（28容器/18图标）。
- 上方平台选择（`select`）与下方模型选择联动：选择平台后，展示对应模型列表并应用到当前会话。
- 对话布局对齐：AI在左、用户在右，加入更好的气泡与状态表现（流式指示、复制/重试/删除）。

## 图标优化（右侧）
- 新建会话：气泡+加号（chat-plus）——强调会话语义。
- 历史记录：时钟+列表（clock-list）——体现过去记录。
- 会话设置：齿轮+对话框（gear-chat）——与全局设置区分为“本会话设置”。
- 设计规范：
  - 容器：`w-[28px] h-[28px] rounded-[6px] p-[4px]`，悬停 `hover:bg-[#27272a]`。
  - SVG：`stroke="#fafafa" stroke-width="1.8"`，聚焦态支持 `outline`。

## 模型联动
- 数据源：使用 `src/store/settings.ts` 已有的 `getAgentModelList(provider)`。
- 页面行为：
  - 选平台（上方 `select`）时更新 `provider`。
  - 下方展示“模型”选择（新的 `select`），列表来自 `getAgentModelList(provider)` 并去重 + 过滤旧模型。
  - 当前会话持有 `convSettings.modelName`（新增字段），发送时将该模型名透传到 Gemini 服务。
- 服务透传：扩展 `sendChat`/`streamChat` 的 `options` 支持 `modelName`，优先使用该值创建 `getGenerativeModel({ model: modelName })`。

## 对话布局（AI左/用户右）
- 参考优秀案例：
  - assistant-ui（开源 React 聊天 UI，支持流式、无障碍、Shadcn风格）（GitHub: assistant-ui/assistant-ui）。
  - ChatUI（阿里）（GitHub: alibaba/ChatUI）最佳实践：用户消息 `position: right`，AI消息 `left`。
- 具体表现：
  - 消息行：左右对齐、最大宽度约 72ch；用户气泡用品牌高对比背景，AI气泡低对比；保留复制/删除按钮。
  - 流式状态：AI生成时显示“打字点”或“正在生成…”替代静态文案。
  - 自动滚动：保持当前行为，确保流式时滚动到底。
  - 可选：为代码块/Markdown增加样式，后续按需加入。

## 代码改动点（不执行，说明）
- `src/pages/CopywritingCreationInterface.tsx`
  - 右侧图标区：替换为三枚内联SVG（chat-plus/clock-list/gear-chat），保留现有容器样式。
  - 在平台选择所在区域（`343–372`）下方新增“模型”选择 `select`，数据来自 `getAgentModelList(provider)`；更改发送逻辑从 `convSettings.modelName` 透传。
  - 消息渲染（`375–392`与`380–388`）：按照 `m.role` 设置左右对齐与样式；AI左、用户右。
- `src/services/ai/gemini.ts`
  - 在 `sendChat`/`streamChat` 的 `options` 增加 `modelName?: string`；若有则优先用该模型名，避免全局污染。
- `src/components/business/ConversationSettings.tsx`
  - 可在“会话设置”中同步展示当前模型名（只读或从下方选择处更新）；保持温度、上下文、流式、最大Token设置不变。

## 可视与交互一致性
- 维持容器尺寸与交互区焦点态；SVG符合当前主题色；键盘操作支持 Enter/Space。
- 行为不影响已存在的新建会话/历史弹窗钩子与持久化。

## 验证
- 切换平台后模型列表对应正确；发送请求时使用会话选中的模型。
- 消息对齐正确且流式/非流式提示清晰；复制/删除可用；滚动正常。
- 右侧图标视觉统一、语义明确。

## 后续可选
- 引入 Markdown/代码高亮；消息分组与时间戳；重试按钮绑定最后一条用户消息；历史抽屉支持搜索与删除。