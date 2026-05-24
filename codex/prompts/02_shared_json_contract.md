# 共享 JSON 契约

所有分析模块应优先使用统一外层结构，便于程序稳定解析、聚合、审核、入库。

## 统一外层结构

```json
{
  "valid": true,
  "module": "plot_unit",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [],
  "invalid_reason": null
}
```

## valid=false 结构

```json
{
  "valid": false,
  "module": "plot_unit",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [],
  "invalid_reason": "文本证据不足，无法可靠拆解创作操作"
}
```

## 统一 item 基础字段

```json
{
  "id": "string",
  "type": "string",
  "name": "string",
  "surface_summary": "string",
  "author_operation": "string",
  "reader_effect": "string",
  "evidence": [
    {
      "quote": "string",
      "supports": "string",
      "location_hint": "string"
    }
  ],
  "reuse_method": "string",
  "failure_modes": [],
  "storage_decision": {
    "should_store": true,
    "value_score": 0.0,
    "reason": "string",
    "risk_flags": []
  },
  "confidence": 0.0
}
```

## evidence 字段

每条证据必须说明它支持什么判断。

```json
{
  "quote": "原文短证据",
  "supports": "这条证据支持的创作判断",
  "location_hint": "章节/段落/行号/偏移，未知则为空字符串"
}
```

要求：

- `quote` 必须来自输入原文，是精确子串，不得改写、概括、补字、删字、修标点或纠错。
- 后端可以使用 `original_text.includes(quote)` 校验；无法匹配的证据应直接判定为无效。
- `quote` 尽量短。
- 如果没有可引用证据，不要输出该 item。

## 复用字段专有名词约束

以下字段必须进行抽象化，不得保留原文专有名词：

- `reuse_method`
- `failure_modes`
- `migration_method`
- `execution_formula`
- `example_rewrite_prompt`
- `abstracted_example`

允许 `evidence.quote` 保留原文专有名词，因为它必须精确引用原文。

## confidence 标准

- `0.90-1.00`：文本中有明确、多处、直接证据，技法判断非常稳定。
- `0.75-0.89`：有明确证据，判断可靠，但可能缺少完整上下文。
- `0.55-0.74`：有一定证据，但存在推断成分。
- `0.30-0.54`：证据较弱，只能作为候选观察。
- 低于 `0.30`：不要输出，除非任务明确要求保留低置信候选。

## value_score 标准

- `0.90-1.00`：高度可复用，能形成明确技法卡，有强证据。
- `0.75-0.89`：值得入库，技法清楚，证据可靠。
- `0.60-0.74`：可作为候选入库，但需人工或二次审核。
- `0.40-0.59`：价值偏低，只保留为临时观察。
- 低于 `0.40`：不入库。

## risk_flags 推荐枚举

- `weak_evidence`：证据较弱。
- `needs_context`：需要上下文确认。
- `possible_summary_only`：可能只是剧情摘要。
- `low_reuse_value`：复用价值低。
- `candidate_noise`：可能来自本地候选噪声。
- `possible_over_inference`：可能过度推断。
- `schema_risk`：字段结构或类型存在风险。
- `proper_noun_leakage`：复用字段泄漏原文专有名词。
- `evidence_not_exact_substring`：证据不是原文精确子串。
- `empty_action_verbs`：复用方法只有空泛动词，缺少信息、资源、关系或认知操作。
