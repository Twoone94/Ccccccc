## 目标
- 建立统一字体规范，覆盖字体族、字号阶梯、行高、字重与响应式标题；与 Tailwind 配置及现有组件库无缝融合。

## 现状
- 未配置 `theme.extend.fontFamily`；全局 CSS 未定义字体变量；没有自定义/外部字体引入。

## 字体族（CSS 变量）
- `--font-sans`: `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, WenQuanYi Micro Hei, Helvetica, Arial, sans-serif`
- `--font-mono`: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace`
- 在 `src/styles/tailwind.css` 的 `:root` 定义上述变量；暗色主题无需变更字体，仅留作全局统一入口。

## Tailwind 映射
- 在 `tailwind.config.cjs` 增加：
  - `theme.extend.fontFamily.sans = ['var(--font-sans)']`
  - `theme.extend.fontFamily.mono = ['var(--font-mono)']`
- 采用 Tailwind 默认字号阶梯，避免重复维护；需要自定义时再增量扩展 `fontSize` 映射到令牌。

## 全局基础样式
- 在 `src/styles/tailwind.css` 的 `@layer base` 中设置：
  - `html, body` 使用 `font-sans`、`text-base`、`leading-relaxed`，文案场景统一可读性。
  - 段落 `p` 与列表项 `li` 默认 `leading-relaxed`；小字注释类（如 `text-muted-foreground`）配合 `text-sm`。
- 代码片段与等宽区域：在组件/页面中以 `font-mono` 应用（如日志、提示符、代码块）。

## 标题与响应式
- 标题类采用语义化并在 `@layer base` 中定义：
  - `h1`: `text-3xl md:text-4xl font-semibold leading-tight`
  - `h2`: `text-2xl md:text-3xl font-semibold leading-snug`
  - `h3`: `text-xl md:text-2xl font-semibold`
- 大标题可选 `clamp`（示例：`text-[clamp(1.75rem,2vw+1rem,2.5rem)]`）用于营销页；作为独立工具类提供。

## 字重与字距
- 字重统一：`regular(400) / medium(500) / semibold(600) / bold(700)`；中文场景不建议额外字距，默认保持 `tracking-normal`。

## 页面与组件应用
- 组件库（Button/Input/Tabs/Badge）默认承袭 `font-sans`；需要数字/代码风格时局部切换 `font-mono`。
- 高频页面（如“文案创作界面”）统一标题层级与正文基线，不在页面内使用临时字体族或硬编码字号。

## 验收标准
- 全站默认字体为 `font-sans`（来自令牌），代码区域使用 `font-mono`。
- 标题在各断点下字号与行高一致且可读；正文行高统一。
- 页面与组件不再硬编码字体族/像素字号，均由 Tailwind 类与令牌驱动。

## 变更文件
- `src/styles/tailwind.css`：新增字体变量与 `@layer base` 基础排版。
- `tailwind.config.cjs`：扩展 `fontFamily` 映射到 CSS 变量。

---
请确认以上字体规范方案；确认后我将按该计划修改配置与样式，并在“文案创作界面”等高频页面验证效果。