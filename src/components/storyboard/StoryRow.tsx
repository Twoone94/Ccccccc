import React from 'react'
import { Languages, Sparkles, Edit3, Copy, X, Lock, Unlock } from 'lucide-react'
import { ProjectItem } from '@/store/project'
import { splitChineseSentences } from '@/utils/text'
import { Switch } from '@/components/ui/switch'

export type LayoutState = {
  showPose: boolean
  showI2V: boolean
  showVideo: boolean
}

interface StoryRowProps {
  item: ProjectItem
  index: number
  layoutState: LayoutState
  onMergeUp: () => void
  onSplitDown: (lineIndex: number) => void
  onScriptChange: (value: string) => void
}

export function StoryRow({ item, index, layoutState, onMergeUp, onSplitDown, onScriptChange }: StoryRowProps) {
  const scriptText = item.script ?? item.description ?? ''
  const scriptLines = item.scriptLines && item.scriptLines.length > 0 ? item.scriptLines : splitChineseSentences(scriptText)
  const poseSwitchId = `pose-toggle-${item.id}`
  const i2vSwitchId = `i2v-toggle-${item.id}`

  return (
    <div className="group flex items-stretch gap-3 px-3 py-3 bg-[#1a1a1a] border-b border-zinc-700/50 min-h-[220px] text-gray-200">
      <div className="w-12 flex items-center justify-center text-sm text-gray-400">{index}</div>

      <div className="w-[300px] bg-[#262626] border border-zinc-700/50 rounded-lg p-3 flex flex-col gap-3 h-full">
        <button
          type="button"
          className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity self-start"
          onClick={onMergeUp}
        >
          向上合并
        </button>

        <div className="flex-1 flex flex-col gap-3">
          <textarea
            value={scriptText}
            onChange={(e) => onScriptChange(e.target.value)}
            className="w-full min-h-[88px] bg-transparent text-sm text-gray-200 placeholder:text-gray-500 border border-zinc-700/50 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500/70"
            placeholder="输入剧本文案..."
          />
          <div className="flex flex-wrap gap-2">
            {(item.characters ?? []).map((ch) => (
              <span key={ch} className="rounded-full bg-green-900/50 text-green-400 text-xs px-2 py-0.5">{ch}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {scriptLines.map((line, idx) => (
              <div key={`${line}-${idx}`} className="bg-[#1f1f1f] border border-zinc-700/50 rounded-md p-2">
                <div className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">{line}</div>
                <div className="flex justify-end gap-3 text-[11px] text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={onMergeUp}>向上合并</button>
                  <button type="button" onClick={() => onSplitDown(idx)}>向下拆分</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[11px] text-gray-500">剧本行数: {scriptLines.length}</span>
          <button
            type="button"
            className="text-xs text-blue-500"
            onClick={() => onSplitDown(Math.max(0, scriptLines.length - 1))}
          >
            向下拆分
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#262626] border border-zinc-700/50 rounded-lg p-3 flex flex-col gap-3 h-full min-w-[260px]">
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-[#1f1f1f]" aria-label="翻译"><Languages className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-[#1f1f1f]" aria-label="润色"><Sparkles className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-[#1f1f1f]" aria-label="编辑"><Edit3 className="w-4 h-4" /></button>
            <button className="p-1 rounded hover:bg-[#1f1f1f]" aria-label="复制"><Copy className="w-4 h-4" /></button>
          </div>
          <span className="text-[11px] text-gray-500">AI 提示</span>
        </div>
        <pre className="flex-1 bg-[#1f1f1f] border border-zinc-700/50 rounded-md p-2 text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">
          {item.imagePrompt || item.videoPrompt || '这里显示翻译或优化后的提示语...'}
        </pre>
      </div>

      {layoutState.showPose && (
        <div className="w-[160px] bg-[#262626] border border-zinc-700/50 rounded-lg p-3 flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between text-sm text-gray-200">
            <span>Pose</span>
            <button type="button" className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="relative w-full aspect-square bg-[#1f1f1f] border border-zinc-700/50 rounded-md overflow-hidden flex items-center justify-center text-gray-500 text-xs">
            {item.currentImage ? <img src={item.currentImage} alt="Pose" className="w-full h-full object-cover" /> : '上传姿态参考'}
          </div>
          <label className="flex items-center justify-between text-xs text-gray-300" htmlFor={poseSwitchId}>启用
            <Switch id={poseSwitchId} className="scale-90" /></label>
        </div>
      )}

      {layoutState.showI2V && (
        <div className="w-[200px] bg-[#262626] border border-zinc-700/50 rounded-lg p-3 flex flex-col gap-3 h-full">
          <div className="flex items-center justify-between text-sm text-gray-200">
            <span>I2V 提示</span>
            <button type="button" className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <textarea
            value={item.videoPrompt ?? ''}
            readOnly
            className="flex-1 bg-[#1f1f1f] border border-zinc-700/50 rounded-md p-2 text-xs text-gray-200 resize-none"
            placeholder="描述当前中间状态"
          />
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>参考强度</span>
            <Switch id={i2vSwitchId} className="scale-90" />
          </div>
        </div>
      )}

      {layoutState.showVideo && (
        <div className="w-[400px] bg-[#262626] border border-zinc-700/50 rounded-lg p-3 flex flex-col gap-3 h-full">
          <div className="grid grid-cols-3 gap-3 h-full">
            {[{ label: '视频结果', locked: false }, { label: '当前分镜', locked: true }, { label: '方案 C', locked: false }].map((slot) => (
              <div key={slot.label} className="bg-[#1f1f1f] border border-zinc-700/50 rounded-md p-2 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>{slot.label}</span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <button className="hover:text-white" aria-label="清除"><X className="w-3 h-3" /></button>
                    <button className="hover:text-white" aria-label="锁定">{slot.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}</button>
                  </div>
                </div>
                <div className="relative w-full pt-[66%] bg-[#141414] rounded-sm border border-dashed border-zinc-700/60 overflow-hidden">
                  <span className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-500">等待生成</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StoryRow
