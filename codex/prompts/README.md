# 网文工作台 Prompt 体系

本目录用于沉淀“从成熟网文反推创作方法论”的 AI prompt 资产。

核心目标不是总结剧情，而是提炼创作者可复用的技法：

- 作者如何制造追读感
- 作者如何设计剧情单元、场景、副本、案件、权力场、关系场
- 作者如何塑造人物，使人物服务爽点、悬念、情绪或关系张力
- 作者如何埋线索、制造误导、回收伏笔
- 作者如何控制章节节奏、释放信息、制造钩子
- 最终沉淀为可复用的技法卡

## 文件说明

- `00_global_system_prompt.md`：全局 system prompt。
- `01_shared_gate.md`：所有模块必须内置的“六问门禁”。
- `02_shared_json_contract.md`：统一 JSON 外层结构、证据结构、入库判断和置信度标准。
- `10_plot_unit_prompt.md`：剧情单元分析。
- `20_character_prompt.md`：人物塑造分析。
- `30_scene_container_prompt.md`：场景/副本/案件/权力场分析。
- `40_clue_foreshadow_prompt.md`：线索/伏笔分析。
- `50_rhythm_prompt.md`：节奏控制分析。
- `60_technique_card_prompt.md`：创作技法抽象。
- `70_quality_audit_prompt.md`：质量审核。
- `90_pipeline_notes.md`：推荐流水线和程序接入建议。
- `95_codex_gemini_comparison.md`：Codex 与 Gemini prompt 对比、取长补短记录。

## 使用方式

每个模块 prompt 建议由三段拼接：

1. `00_global_system_prompt.md`
2. `01_shared_gate.md` + `02_shared_json_contract.md`
3. 具体模块 prompt

质量审核模块可单独使用，但仍建议携带共享门禁和 JSON 契约。
