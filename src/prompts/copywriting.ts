export type ToolType = '生成分镜' | '生成角色' | '生成剧本'

export function buildPrompt(t: ToolType, sourceText: string, mainCopyText: string): string {
  const st = sourceText?.trim() || ''
  const mc = mainCopyText?.trim() || ''
  const base = `请基于提供的原文与当前主文案进行中文输出，保持品牌语调与清晰结构。`
  if (t === '生成分镜') {
    return `任务：生成视频分镜大纲（场景编号、画面描述、镜头类型、时长建议）。\n请忽略已有分镜稿，重新生成新的分镜大纲。\n原文：${st}`
  }
  if (t === '生成角色') {
    return `${base}\n任务：推理并生成角色设定（人物名称、性格、动机、台词风格）。\n原文：${st}\n主文案：${mc}`
  }
  return `${base}\n任务：生成完整剧本（分场景对白与旁白，标注镜头提示）。\n原文：${st}\n主文案：${mc}`
}