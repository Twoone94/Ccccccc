## 目标与范围
- 在 `文案创作` 页右侧 `Agent Chat` 集成 Gemini 对话，支持上下文记忆、流式输出、工具化提示词。
- 默认走后端 BFF 代理，前端不暴露 API Key；提供仅供演示的前端直连模式作为备选。

## 架构选择
- 前端：`React + Vite` 现有框架，新增会话状态与消息渲染、流式消费。
- 后端（推荐）：新增轻量 BFF（Node/Express/Fastify 或 Serverless），封装 Gemini SDK，输出 `/api/agent/chat`（JSON）与 `/api/agent/chat/stream`（SSE/HTTP chunk）。
- 安全：API Key 仅存储在后端环境变量；前端通过 `fetch` 调后端。

## SDK 与依赖
- 后端使用 `@google/generative-ai`（Google AI SDK），开启 `responses.stream` 实现分块。
- 若需函数调用（工具调用），使用 SDK 的 tool/function calling 能力，规范工具入参/出参。

## 配置与环境
- 后端：`GEMINI_API_KEY`、`GEMINI_MODEL`（默认 `gemini-2.0-pro` 或企业可用版本）。
- 前端：`VITE_API_BASE` 指向后端地址；保留模型下拉映射。
- 端口统一：将 Electron `main.cjs` 的开发 URL 端口与 `vite.config.ts` 配置一致（例如 `5173`）。

## 服务层设计（前端）
- 新增 `src/services/ai/gemini.ts`：
  - `sendChat(messages, options)`：走 `/api/agent/chat`，返回一次性完整回复。
  - `streamChat(messages, options)`：走 `/api/agent/chat/stream`，返回可迭代/Readable 流，逐 token 更新 UI。
  - 统一 `Message` 结构：`{ role: 'user'|'assistant'|'system', content: string, meta?: {...} }`。
  - 错误处理：超时、HTTP 非 2xx、SDK 异常，暴露标准化错误码与重试建议。

## BFF 设计（后端）
- `POST /api/agent/chat`：接受 `messages`、`tools`、`systemPrompt`、`temperature` 等；调用 Gemini，返回 `assistant` 消息。
- `POST /api/agent/chat/stream`：同参，返回 SSE/Chunked 输出；首/尾事件携带 `traceId`、`usage`。
- 中间件：鉴权（如需要）、速率限制、内容安全审查（可启用 Gemini Safety Settings）。
- 观测：记录 `traceId`、耗时、Token 用量、错误栈；对齐隐私与合规要求。

## 会话与上下文
- 页面级状态：在 `src/pages/CopywritingCreationInterface.tsx` 引入 `messages: useState<Message[]>`。
- 系统提示词：新增配置面板（可放在工具栏），注入 `system` 开场与持续约束（品牌语调、禁词、格式）。
- 上下文融合：将左侧 `sourceText` 与中部 `mainCopyText` 以 `meta` 注入上下文，使模型围绕当前稿件进行编辑与建议。

## UI 集成点
- 消息渲染：新增简洁气泡组件（用户、助手、系统三类），支持 Markdown/富文本。
- 输入框：`handleSend` 改为追加 `user` 消息 → 调用 `streamChat` → 逐 token 更新最后一条 `assistant` 消息内容。
- 工具按钮映射：
  - `生成分镜`、`生成角色`、`生成剧本` → 触发预置提示模版（例如 `src/prompts/copywriting.ts`）拼接上下文后调用 `streamChat`。
- 模型下拉：将静态文案改为来源于配置，允许 Gemini 系列与（未来）OpenAI 切换。

## 提示词与工具化
- 预置模版：品牌语调、目标受众、渠道（短视频/电商详情页/社媒）、长度限制、风格示例。
- 工具调用：定义 `rewrite`, `outline`, `persona`, `storyboard` 四类工具入参（基于当前 `sourceText`/`mainCopyText`），后端通过 Tool Calling 解析与执行（首期可直接在 LLM 内完成）。

## 错误处理与兜底
- UI：显式错误提示、重试按钮、降级到非流式请求；保留最后一次成功回复内容。
- 后端：指数退避重试（有限次数）、Quota 触发时返回业务错误码与指导文案。

## 流式输出实现
- SSE：后端分块发送 `data:` 事件；前端 `EventSource`/`fetch + ReadableStream` 消费。
- 累积渲染：将增量 token 追加到最后一条 `assistant` 消息，保持滚动定位。

## 测试与验证
- 前端：
  - 单元：`services/ai/gemini` 的错误路径、消息归并。
  - 组件：消息渲染与滚动、流式累积。
- 后端：
  - 单元：参数校验、SDK 调用、SSE 断点续传。
  - 集成：端到端对话、工具模版触发。
- 手测：在 `CopywritingCreationInterface` 发送消息、触发三个工具按钮、检查流式与上下文覆盖。

## 部署与运维
- 后端部署到 Vercel/Cloudflare 或现有服务器，注入 `GEMINI_API_KEY`。
- 监控：请求量、耗时、Token 用量、错误率；容量阈值预警。

## 迭代里程碑
- M0：修正端口一致性，搭好 BFF 雏形与前端服务层。
- M1：完成基础 Chat（非流式），可发送/接收，持久化到 `localStorage`。
- M2：打通 SSE 流式、完善错误兜底与提示词面板。
- M3：工具按钮模版化，接入上下文（原文/主文案）。
- M4：观测、限流与安全策略，准备上线评审。

## 风险与合规
- 前端不存储 Key；对话内容涉及隐私时需用户同意与脱敏。
- 供应商策略更新与模型变更需可配置；内容安全过滤启用。
