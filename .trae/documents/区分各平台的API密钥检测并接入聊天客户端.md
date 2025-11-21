## 目标
- 让“检测”逻辑按平台（Gemini / OpenAI / DeepSeek / Kimi）分别执行，返回明确状态，并与当前设置弹窗显示同步
- 将检测逻辑抽到统一的 service，后续在文案创作聊天中复用平台配置，支持真实连接与流式输出

## 拟改动文件
- `src/services/ai/detect.ts`：新增统一检测方法
- `src/components/business/SettingsDialog.tsx`：改为调用 detect service；优化状态与禁用逻辑
- `src/services/ai/client.ts`：新增统一聊天客户端构造（后续在文案创作页用）
- （可选）`src/store/settings.ts`：补充必要字段默认值与校验

## 平台检测规则
- **Gemini**（已验证可用）
  - Endpoint：`GET {base}/v1/models?key={KEY}`（无 Header）
  - 成功：`res.ok === true`
- **OpenAI**
  - Endpoint：`GET {base}/v1/models`
  - Header：`Authorization: Bearer {KEY}`
  - 成功：`res.ok === true`
- **DeepSeek**
  - Endpoint：`GET https://api.deepseek.com/v1/models` 或自定义 `base/v1/models`
  - Header：`Authorization: Bearer {KEY}`
  - 成功：`res.ok === true`
- **Kimi（MoonshotAI）**
  - Endpoint：`GET https://api.moonshot.cn/v1/models` 或自定义 `base/v1/models`
  - Header：`Authorization: Bearer {KEY}`
  - 成功：`res.ok === true`
- **地址优先级**：`settings.ai.base[provider]` → `baseAlt[provider]`（若配置主地址失败，可点击“备用地址”检测，后续可自动降级）

## 检测实现细节
- `detectProvider({ provider, base, key, useBff })`
  - 超时：8s，`AbortController`
  - 返回：`{ ok: boolean, status: '连接正常'|'连接失败'|'请求超时'|'未配置密钥'|'未配置地址', httpStatus?: number }`
  - CORS & 内网：若 `useBff === true`，改用 `GET /api/proxy/detect?provider=...`（后端转发）
- SettingsDialog 中：
  - 读取当前 provider 的 `key/keysList`、`base` 形成待测凭据（首个有效 key）
  - 点击“检测”触发 service；标题右侧显示状态；在“测试中…”时禁用按钮
  - 若 `ok === false` 且 `baseAlt` 存在，给出“尝试备用地址”二次按钮（可选）

## UI 与交互
- 标题右侧显示状态（已调整位置），颜色随状态变化
- 检测按钮：测试中加 loading（文案或小 spinner），禁用防抖（2s）
- 错误提示：保留红字状态，不弹窗

## 文案创作聊天接入（下一步）
- 在 `src/services/ai/client.ts` 实现：
  - `createClient(settings)`：返回 `{ send(messages, opts) }` 支持平台分支
  - Gemini：`POST {base}/v1beta/models/{model}:streamGenerateContent?key=KEY`（或 v1 的 chat）
  - OpenAI：`POST {base}/v1/chat/completions`，`Bearer KEY`
  - DeepSeek/Kimi：对各自 chat/completions 端点做同构封装
  - 统一返回流式迭代器（SSE/Chunk），在文案页的 `streamChat` 处替换为该 client

## 验证与测试
- 单元/手测
  - 每平台“检测”在设置弹窗中返回正确状态（用有效/无效 key 测试）
  - CORS 情况下验证 BFF 代理路径（若已有后端）
- 手动验收标准
  - 标题显示状态与按钮禁用逻辑正确
  - 切换平台后检测逻辑切换正确（Gemini/OpenAI/DeepSeek/Kimi）

## 安全与异常
- 不打印/持久化完整密钥；日志仅状态与 httpStatus
- 超时与网络异常统一文案，不暴露内部堆栈

## 交付顺序
1. 新增 `detect.ts` 并在 SettingsDialog 调用
2. 完成 UI 交互（loading/禁用/状态展示）
3. 可选：备用地址二次检测
4. 后续：统一聊天客户端替换文案页 `streamChat`

确认后我将按此计划逐步落地实现（先完成检测 service 与弹窗接入，再推进聊天客户端）。