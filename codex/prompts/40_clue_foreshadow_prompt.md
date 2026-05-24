# 线索/伏笔分析 Prompt

## 任务定位

你要分析文本中的线索、伏笔、误导和回收设计。

重点不是找关键词，而是判断作者是否在安排读者的信息状态。

你需要区分：

- 线索：当前可被读者注意，但意义尚未完全展开的信息
- 伏笔：为后续回收服务的提前布置
- 误导：让读者形成错误预期的信息安排
- 回收：后文重新解释前文信息，使其产生意义增值

## 输入说明

输入可能包含：

- `novel_text`
- `local_clue_candidates`
- `context_before`
- `context_after`
- `source_span`

如果没有后文，不能轻易判断“伏笔”，最多判断为 `suspected`。
如果没有明确回收，不要声称已经回收。

## 何时返回 invalid 或空

- 只有普通信息，没有延迟意义。
- 只是直白因果或顺序叙事，不存在信息隐藏、伪装或误导。
- 机械降神式填坑，前文缺少可验证布置，只在后文生硬解释。
- 文本没有让读者产生重新理解前文的认知变化。
- 没有证据显示作者在管理读者预期。
- 只是设定说明，不构成线索或伏笔。
- 无法判断其后续作用。
- 没有可迁移的线索设计方法。

## 输出 JSON schema

```json
{
  "valid": true,
  "module": "clue_foreshadow",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [
    {
      "id": "clue_001",
      "type": "clue|foreshadowing|misdirection|payoff|suspected",
      "name": "string",
      "surface_summary": "线索或伏笔的表层信息，不超过80字",
      "author_operation": "作者如何埋设、遮蔽、强调、误导或回收",
      "reader_effect": "作者希望读者此刻知道、怀疑、误判或等待什么",
      "reader_state": "读者在此刻的信息状态",
      "later_value": "如果有后文证据，说明后续如何增值；没有则为空字符串",
      "magic_operations": {
        "camouflage_planting": "作者如何伪装或埋藏线索，例如情绪盲区、信息过载、角色缺陷伪装、日常物件伪装",
        "misdirection": "作者如何利用读者定势、主角视角限制或错误焦点进行认知误导",
        "payoff_mechanism": "回收时如何与当前危机、爽点或情绪反转咬合；没有后文证据则为空字符串"
      },
      "evidence": [
        {
          "quote": "原文短证据",
          "supports": "支持线索/伏笔/误导/回收判断",
          "location_hint": ""
        }
      ],
      "setup_evidence": [
        {
          "quote": "前文布置短证据",
          "supports": "支持布置判断",
          "location_hint": ""
        }
      ],
      "payoff_evidence": [
        {
          "quote": "后文回收短证据，没有则数组为空",
          "supports": "支持回收判断",
          "location_hint": ""
        }
      ],
      "craft_value": "这个线索设计的创作价值",
      "reuse_method": "创作者如何复用这种信息安排",
      "failure_modes": ["复用时容易写坏的地方"],
      "storage_decision": {
        "should_store": true,
        "value_score": 0.0,
        "reason": "为什么值得或不值得入库",
        "risk_flags": []
      },
      "confidence": 0.0
    }
  ],
  "invalid_reason": null
}
```

## confidence 特别标准

- 有前文布置和后文回收：可高于 `0.80`。
- 只有前文可疑信息、无后文：最高 `0.65`。
- 只有关键词重复、无意义变化：不要输出。

## 高质量答案标准

- 明确区分线索、疑似伏笔、误导和回收。
- 说明读者的信息状态如何被管理。
- 能拆出伪装、误导和回收引爆机制。
- 不把普通设定当伏笔。
- 不在没有后文证据时断言回收。

## 低质量禁区

- 看到重复词就判断伏笔。
- 没有 payoff 证据却说“后文必然回收”。
- 只写“这里埋下悬念”，不说明读者被引导怀疑什么。
