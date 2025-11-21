## 问题研判
- 目前顶栏的“生图设置”“项目设置”仅是按钮文案，未绑定任何事件或状态，点击不会打开弹窗：`src/pages/ProjectInterface.tsx:554-566`。
- 代码库中不存在“SettingsModal/Preferences”相关实现；仅有通用弹层 `Modal`：`src/components/ui/Modal.tsx:4-33`。
- 页面里已有一个“预览”弹层示例，证明 `Modal` 能正常工作：`src/pages/ProjectInterface.tsx:457-461`。
- 设置数据是通过 `localStorage` 持久化的，不影响弹层 UI，但会让设置内容保持之前的值：`src/store/settings.ts:48-79, 81-119`；部分页面直接读写设置且未用弹层：`src/pages/CopywritingCreationInterface.tsx:329-337`。

## 主要发现
- 顶栏设置入口未接线：没有 `onClick`、没有 `open` 状态、没有任何弹层挂载（`ProjectInterface.tsx`）。
- 没有遗留的“设置弹窗”代码；UI相同更可能是复用了同一个 `Modal` 外框而非“删除不干净”。

## 解决方案
1. 在 `src/pages/ProjectInterface.tsx` 增加两个弹层打开状态：`const [imageSettingsOpen, setImageSettingsOpen] = useState(false)`、`const [projectSettingsOpen, setProjectSettingsOpen] = useState(false)`。
2. 为“生图设置”“项目设置”按钮分别绑定 `onClick`，切换对应状态：`setImageSettingsOpen(true)`、`setProjectSettingsOpen(true)`（`src/pages/ProjectInterface.tsx:554-566`）。
3. 在页面底部挂载两个 `Modal`，使用不同的 `title` 和内容，以区分 UI：
   - 生图设置：模型平台、模型名、温度、最大 Tokens 等（读取/保存走 `loadSettings`/`saveSettings`）。
   - 项目设置：项目名、AI 版本等（读取/保存走 `loadProject`/`saveProject`，已存在同页逻辑）。
4. 复用通用 `Modal` 外框，不新增文件，直接在 `ProjectInterface.tsx` 内实现设置表单，确保样式与预览弹层不同（通过不同的内部布局与控件）。
5. 表单提交时：
   - 生图设置：计算新 `Settings`，调用 `saveSettings(s)` 并关闭弹层。
   - 项目设置：更新本页 `projectData` 并调用 `saveProject(pid, data)`。
6. 交互细节：ESC/遮罩关闭沿用 `Modal`；按钮禁用/Loading 视需求补充。

## 验证步骤
- 运行开发环境，进入项目页，点击两类设置按钮应分别弹出不同内容的弹窗。
- 修改生图设置后刷新页面，确认内容从 `localStorage` 正确回填（`loadSettings`）。
- 修改项目设置后，确认本页统计与标题同步更新，并已持久化（`saveProject`）。
- 复测：关闭弹层、ESC、遮罩点击都正常；多次打开样式保持区分，不再与“预览”弹层混淆。

## 变更影响面
- 仅变更 `src/pages/ProjectInterface.tsx`，不新建/改动通用组件；风险低、回滚容易。