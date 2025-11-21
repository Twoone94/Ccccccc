## 目标
- 执行 `npx shadcn add dashboard-01` 引入区块。
- 将首页改造为遵循该区块的布局与组件规范。
- 采用你提供的浅/暗色主题变量，统一组件配色与对比度。

## 实施步骤
### 1) 引入区块
- 运行 `npx shadcn@latest add dashboard-01`，将区块及依赖组件生成到 `src/components`/`src/pages` 下（按 CLI 默认路径）。
- 确认别名与现有 `components.json` 一致（`@/components`、`@/lib/utils`）。

### 2) 主题变量更新
- 在 `src/styles/tailwind.css` 的 `@layer base` 中：
  - 将 `:root` 与 `.dark` 的 CSS 变量更新为你提供的配色（`--radius`、`--background`、`--foreground`、`--primary`、`--secondary`、`--accent`、`--muted`、`--destructive`、`--border`、`--input`、`--ring`、`--chart-*`）。
  - 保留其它项目自定义变量（如 `--color-*`），但首页与新组件优先使用标准变量驱动颜色，避免手动 `text-*` 覆盖。
- 暗色模式继续以 `body.dark` 触发（`tailwind.config.cjs` 已 `darkMode: ['class']`）。

### 3) 首页整合
- 新建 `src/pages/Dashboard.tsx`，直接使用 `dashboard-01` 的结构（统计卡片、图表、表格等）。
- 将现有“快速操作”和“作品列表”迁移到相应区块：
  - 快速操作：使用 `shadcn Button` 的 `default/secondary/outline` 变体，统一交互与字号。
  - 作品列表：采用区块中的 Table 或 Card 样式，保留当前数据源与交互逻辑。
- 清理首页中硬编码颜色类（如 `text-primary`、`bg-surface`）以让颜色随变量切换。

### 4) 路由接入
- 在 `src/App.tsx` 将 `/` 指向新的 `Dashboard` 页面；为旧首页保留 `/home` 以对比与回退。
- 保持现有导航逻辑与 `react-router-dom` 结构不变，必要处使用 `Button asChild` 包裹 `Link`。

### 5) 验证
- 启动本地预览，检查浅/暗色下：背景/前景、按钮前景、卡片边框、输入框、图表对比度是否符合预期。
- 统一圆角：依据 `--radius: 0.65rem` 将残留 `rounded-[8px]` 等改为 `rounded-md/lg`。

## 交付
- 新的首页（Dashboard）页面与路由。
- 更新主题变量并保持其它模块兼容。
- 首页核心区域按 `dashboard-01` 规范与新配色重构完成。