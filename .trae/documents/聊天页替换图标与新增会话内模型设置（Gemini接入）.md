## 现状与问题
- 设置图标位置：`src/pages/CopywritingCreationInterface.tsx:241–258` 使用 `icoSettings`，需要与首页设置图标一致。
- 需移除的控件：会话下拉与两个按钮位于 `src/pages/CopywritingCreationInterface.tsx:353–372`（`当前会话`、`保存会话`、`清空`）。
- Gemini 接入：温度与最大 Token 已支持（`src/services/ai/gemini.ts:31–41`、`52–61`），历史通过 `toHistory` 注入（`src/services/ai/gemini.ts:14–21`、`85`）。当前页面强制使用流式输出（`CopywritingCreationInterface.tsx:80–87`、`106–113`）。

## 目标
- 顶栏设置图标与首页一致，样式统一。
- 移除会话下拉与“保存会话”“清空”按钮，改为三枚图标：新建会话、历史记录、会话内设置。
- 新增“会话内模型设置”弹窗，仅作用于当前对话：模型温度、上下文数、流式输出开关、最大 Token 数。
- 将上述设置与 Gemini 请求参数打通，并做到每个会话独立持久化。

## UI 调整
- 替换设置图标：统一使用首页同款资源；保持尺寸 `w-[18px] h-[18px]`，保留容器交互区域 `w-[28px] h-[28px]`（改动点：`CopywritingCreationInterface.tsx:257`）。
- 移除控件：删除 `当前会话` 下拉与“保存会话”“清空”（改动点：`CopywritingCreationInterface.tsx:353–372`）。
- 新增图标组（同样使用 `w-[28px] h-[28px]` 容器）：
  - 新建会话：点击后创建空会话并切换。
  - 历史记录：打开抽屉或弹窗显示 `loadChatSessions()` 列表（数据源：`src/store/chat.ts:26–41`）。
  - 会话设置：打开“会话内模型设置”弹窗。
- 交互区域建议放置在原有控件所在位置的右上角，沿用原子类样式，避免视觉破坏。

## 会话内模型设置弹窗
- 位置与触发：从图标打开；不与全局 `SettingsDialog` 联动。
- 控件：
  - 模型温度 `0–2`（步长 `0.1`）。
  - 上下文数（仅对本会话历史长度裁剪，默认 10）。
  - 流式输出开关（切换 `streamChat` 与 `sendChat`）。
  - 最大 Token 数（默认取全局 `s.ai.agentMaxTokens`，可覆盖）。
- 持久化：
  - 为每个会话保存独立设置：`localStorage` 键 `copywritingAgentChat:session:<id>:settings`。
  - 非会话态（未选择会话）时使用页面级临时设置对象。

## Gemini 参数对接
- 非流式：`src/services/ai/gemini.ts:23–49` 已支持 `temperature` 与 `maxOutputTokens`，在调用处传入会话内设置。
- 流式：`src/services/ai/gemini.ts:51–98` 同样传入配置。
- 上下文数裁剪：
  - 非流式：将 `generateContent` 的 `messages` 改为 `messages.slice(trimStart)`，`trimStart = Math.max(0, messages.length - contextCount)`（改动点：`gemini.ts:40`）。
  - 流式：将 `startChat({ history })` 内的 `messages.slice(0, -1)` 改为 `messages.slice(Math.max(0, messages.length - 1 - contextCount), -1)`（改动点：`gemini.ts:85`）。
- 流式输出开关：在页面 `handleSend` / `sendTool` 两处，依据开关选择 `streamChat` 或 `sendChat`（改动点：`CopywritingCreationInterface.tsx:80–87`、`106–113`）。

## 存储与会话行为
- 新建会话：沿用 `saveNewSession('', messages)`（`src/store/chat.ts:42–53`），并初始化对应的 `settings` 键。
- 历史列表：使用现有 `loadChatSessions()`（`src/store/chat.ts:26–34`）渲染，支持删除（`deleteSession`）。
- 设置读取优先级：会话设置 > 全局默认；不修改 `loadSettings()` 的值。

## 资源与一致性
- 图标统一：复用首页设置图标资源路径，若首页使用 `.figma/image/editor-add-tab.svg`，统一改为 `public/image/editor-add-tab.svg` 并走现有 `copy-assets.cjs` 同步流程。
- 交互与尺寸：所有新图标容器保持 `w/h 28`、圆角 `6`、悬停态一致。

## 回归与验证
- 功能：
  - 新建会话正常切换与持久化。
  - 历史列表正确展示与删除。
  - 设置弹窗参数影响本会话请求；切换会话参数独立。
  - 流式/非流式切换可用、最大 Token 生效、上下文裁剪正确。
- UI：图标样式与首页一致；移除的控件不再显示。

## 可选补充（Gemini 高级项）
- 补充 `topP`、`topK`、`candidateCount`、`stopSequences` 等到“高级设置”，默认隐藏；后续按需开启。