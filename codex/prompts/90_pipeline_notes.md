# 推荐流水线

## 基本流水线

1. 本地预检：
   - 切章节、剧情单元、段落、候选人物、候选场景、候选线索。
   - 所有本地候选标记为不可信，只作为 AI 审核材料。

2. 模块分析：
   - 剧情单元：`10_plot_unit_prompt.md`
   - 人物塑造：`20_character_prompt.md`
   - 场景/副本/案件/权力场：`30_scene_container_prompt.md`
   - 线索/伏笔：`40_clue_foreshadow_prompt.md`
   - 节奏控制：`50_rhythm_prompt.md`

3. 质量审核：
   - 使用 `70_quality_audit_prompt.md` 审核每个模块输出。
   - `reject` 或 `drop_to_invalid` 的结果不进入知识库。
   - `revise` 的结果进入重写队列。

4. 技法抽象：
   - 使用 `60_technique_card_prompt.md` 将高价值分析转成技法卡。

5. 入库：
   - 只入库 `storage_decision.should_store=true` 且审核通过的 item。

## 建议阈值

- 自动入库：
  - `confidence >= 0.75`
  - `value_score >= 0.75`
  - 审核 `score >= 80`

- 人工复核：
  - `confidence >= 0.65`
  - `value_score >= 0.60`
  - 审核 `score >= 65`

- 丢弃：
  - `confidence < 0.55`
  - 或 `value_score < 0.40`
  - 或审核 verdict 为 `reject`

## 程序解析建议

- 所有模块统一读取 `valid`、`module`、`source_span`、`items`、`invalid_reason`。
- 所有 item 统一读取：
  - `id`
  - `type`
  - `name`
  - `surface_summary`
  - `author_operation`
  - `reader_effect`
  - `evidence`
  - `reuse_method`
  - `failure_modes`
  - `storage_decision`
  - `confidence`
- 模块专属字段只用于详情页和二次抽象，不作为基础入库门槛。

## 后端硬校验建议

- 证据校验：每个 `evidence.quote` 必须能被原文 `includes` 命中。
- 专有名词泄漏校验：`reuse_method`、`migration_method`、`execution_formula`、`example_rewrite_prompt`、`abstracted_example` 不应出现原文候选人名、地名、势力名、道具名等专有名词。
- 动作级校验：复用方法中应出现明确的信息、资源、认知或关系操作；只有“制造、渲染、烘托、加强”等空泛动词时，降级或退回重写。

## Prompt 拼接建议

分析模块：

```text
[00_global_system_prompt]
[01_shared_gate]
[02_shared_json_contract]
[具体模块 prompt]
[本次输入 JSON]
```

质量审核：

```text
[00_global_system_prompt]
[01_shared_gate]
[02_shared_json_contract]
[70_quality_audit_prompt]
[原文与待审核 JSON]
```
