## 目标
- 在 Gemini 模型列表中增加 `gemini-2.0-pro` 与确保包含 `gemini-2.0-flash`。
- 将“检测”逻辑改为：用当前选择的模型实际调用来验证密钥可用性。

## 代码改动
### 增加模型选项
- 修改 `src/services/ai/config.ts:19` 的 `providerConfig.gemini.defaultModels`：加入 `gemini-2.0-pro`（当前已包含 `gemini-2.0-flash`）。
- 修改默认设置的模型列表，使初始下拉即可看到新模型：
  - `src/store/settings.ts:78` 将 `modelsList.gemini` 从 `['gemini-1.5-pro']` 扩充为 `['gemini-1.5-pro','gemini-2.0-pro','gemini-2.0-flash']`。
  - `src/store/settings.ts:112` 的加载回退同样扩充为 `['gemini-1.5-pro','gemini-2.0-pro','gemini-2.0-flash']`。
- 保持默认 `agentModel` 不变（`src/store/settings.ts:59` 仍为 `gemini-1.5-pro`）。

### 检测逻辑按当前模型
- UI 中“检测”按钮现状：`src/components/business/SettingsDialog.tsx:112` 调用 `runDetect` → `src/services/ai/detect.ts` 仅访问 `/v1/models` 列表。
- 调整为：
  - 当 `provider === 'gemini'` 时，使用已有的 SDK 检测函数 `src/services/ai/gemini.ts:100` 的 `testGeminiKey(key, modelName)`，传入当前选中模型 `s.ai.agentModel`。
  - `runDetect` 中优先取第一个有效密钥（已实现），然后：
    - `const ok = await testGeminiKey(firstKey, s.ai.agentModel)`
    - 成功 → 状态设为 `连接正常`；失败 → `连接失败`。
  - 其他提供方（openai/deepseek/kimi）暂沿用现有 `detectProvider` 列表检测，若后续需要也可改为最小化生成请求（如 `POST /v1/chat/completions`）。
- 保留 `base` 逻辑不变；Gemini SDK 不使用自定义 `base`，若需走直连 HTTP，则另行扩展。

## 验证与回归
- 在设置弹窗中：
  - 模型下拉应显示 `gemini-1.5-pro`、`gemini-2.0-pro`、`gemini-2.0-flash`。
  - 选择不同模型后点击“检测”，状态应正确反映密钥能否调用该模型。
- 若开启 `useBff`：保持前端本地 SDK 检测，不依赖后端；如需后端代理检测，可追加 `/api/agent/detect`（可选后续）。

## 不变与安全
- 不改变默认平台与默认模型，仅增加可选项。
- 不输出或记录密钥内容，遵循现有安全约束。

## 下一步
- 我将按以上文件与位置进行修改，并在本地预览验证“模型列表更新”和“检测逻辑按当前模型”是否生效。请确认。