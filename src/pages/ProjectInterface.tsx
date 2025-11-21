{/* 表格区域 */}
      <div
        ref={tableRef}
        className="overflow-auto scroll-smooth relative bg-[#0f0f0f] no-scrollbar overscroll-contain"
        style={tableHeight ? { height: tableHeight } : undefined}
        onScroll={computeScroll}
        onWheel={(e) => {
          const target = e.target as HTMLElement;
          if (target && target.closest('[data-vsel]')) return;
          smartWheel(tableRef.current, e);
          computeScroll();
        }}
      >
        <div className="min-w-[1200px]">
          {/* 表头 Sticky Header */}
          <div className="flex items-center justify-between px-4 py-2 sticky top-0 z-10 bg-[#1a1a1a] border-b border-zinc-700/50">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.08em] text-gray-500">
              <span className="px-2 py-1 rounded bg-[#262626] text-gray-200">编号</span>
              <span className="px-2 py-1 rounded bg-[#262626] text-gray-200">剧本</span>
              <span className="px-2 py-1 rounded bg-[#262626] text-gray-200">Prompt</span>
              {layoutState.showPose && <span className="px-2 py-1 rounded bg-[#262626] text-gray-200">Pose</span>}
              {layoutState.showI2V && <span className="px-2 py-1 rounded bg-[#262626] text-gray-200">I2V</span>}
              {layoutState.showVideo && <span className="px-2 py-1 rounded bg-[#262626] text-gray-200">视觉生成</span>}
            </div>
            
            {/* 布局配置下拉菜单 */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> 布局
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#262626] text-gray-200 border border-zinc-700/50 min-w-[180px]">
                  <DropdownMenuCheckboxItem
                    checked={layoutState.showPose}
                    onCheckedChange={(v) => setLayoutState((prev) => ({ ...prev, showPose: !!v }))}
                  >
                    参考 Pose
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={layoutState.showI2V}
                    onCheckedChange={(v) => setLayoutState((prev) => ({ ...prev, showI2V: !!v }))}
                  >
                    I2V Prompt
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={layoutState.showVideo}
                    onCheckedChange={(v) => setLayoutState((prev) => ({ ...prev, showVideo: !!v }))}
                  >
                    视频生成面板
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 列表渲染区域 (使用 StoryRow 组件) */}
          <div className="flex flex-col">
            {projectData.items.map((item) => (
              <StoryRow
                key={item.id}
                index={item.id}
                item={item}
                layoutState={layoutState}
                onMergeUp={() => handleMergeUp(item.id)}
                onSplitDown={(idx) => handleSplitDown(item.id, idx)}
                onScriptChange={(value) => handleScriptChange(item.id, value)}
              />
            ))}
          </div>
        </div>
      </div>