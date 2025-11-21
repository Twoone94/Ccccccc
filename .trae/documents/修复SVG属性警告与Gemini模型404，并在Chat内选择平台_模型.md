## 问题与目标
- 修复 React SVG 属性警告：将 `stroke-width` / `stroke-linecap` 改为 `strokeWidth` / `strokeLinecap`。
- 修复 Gemini 404：`gemini-2.0-pro` 在 `v1beta` 不支持，增加安全模型列表与回退逻辑，确保流式/非流式都可用。
- Chat 内支持选择平台与模型：移除右栏顶部平台下拉后，把“平台+模型”选择整合到输入栏右侧标签的下拉菜单中；选择后即用于对话。

## 代码改动点
- `src/pages/CopywritingCreationInterface.tsx`
  - 将右侧三枚内联 SVG 的属性统一使用驼峰：`strokeWidth`、`strokeLinecap`。
  - 为输入栏右侧的“平台+模型”按钮增加下拉菜单：第一行显示平台列表（OpenAI/Gemini/DeepSeek/Kimi），切换时更新 `provider` 与模型列表；下方显示对应平台的模型列表，点击更新 `activeModel`。
  - 删除对 `gemini-1.5-pro` 的过滤，完整展示可用模型。
- `src/services/ai/gemini.ts`
  - `sendChat` / `streamChat` 的 `options` 保留 `modelName`；改为对候选模型进行尝试：`[options.modelName, ...getAgentModelList, ENV_MODEL, 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash']` 去重后挨个尝试；捕获 404/不支持时换下一模型。
- `src/store/settings.ts`
  - `providerConfig` 的默认 Gemini 模型列表调整为安全组合：如 `['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash']`。
  - 保留已有 `getAgentModelList` / `getAgentKeyList`；不再对 `gemini-1.5-pro` 做过滤。

## 行为说明
- 顶栏“全局设置”里配置完 Key 与 Base 后，Chat 内选择平台与模型即可生效；发送时透传 `provider` / `modelName`（Gemini 已支持），后续若需要也可为其他平台扩展相同接口。
- 流式/非流式：回退逻辑同样适用；若某模型不支持流式，则自动回退到支持的模型。

## 验证
- 预览无 SVG 属性警告。
- 在 Chat 内选择 Gemini + 模型（如 `gemini-1.5-flash`）可正常对话；更换平台时模型列表同步更新。
- 控制台无 404；错误时回退到下一候选模型并继续输出。

## 可选增强
- 读取 Google `ListModels`（若 SDK 支持）自动刷新模型列表；在菜单中显示支持的方法能力标签（stream/generate）。
- 为 OpenAI/DeepSeek/Kimi 扩充相同的 `modelName` 透传与候选回退。