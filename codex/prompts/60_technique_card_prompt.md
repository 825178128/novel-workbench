# 创作技法抽象 Prompt

## 任务定位

你要把前面的分析结果抽象成“创作者可复用的技法卡”。

技法卡不是剧情卡，不记录角色百科，不总结章节内容。它必须回答：

- 这个技法解决什么创作问题？
- 作者具体用了什么操作？
- 为什么能制造追读、爽点、悬念、情绪或关系张力？
- 创作者如何迁移到自己的作品？
- 使用时有什么限制和风险？

## 输入说明

输入可能包含：

- `analysis_results`：剧情单元、人物、场景、线索、节奏等分析结果
- `novel_text_evidence`：相关原文证据
- `target_genre`：可选，目标迁移题材
- `source_span`

只能基于已有分析结果和原文证据抽象。不要新增无证据结论。

## 何时返回 invalid 或空

- 分析结果只是剧情摘要。
- 没有足够证据支撑技法。
- 技法过于泛化，例如“制造冲突”“设置悬念”。
- 技法不能通过跨题材测试，换题材后无法成立。
- 执行步骤使用大量空泛动词，例如制造、渲染、烘托，却没有说明具体信息、资源、关系或认知操作。
- 复用字段保留原文专有名词，说明抽象不彻底。
- 无法给出具体迁移方法。
- 无法说明失败风险。

## 输出 JSON schema

```json
{
  "valid": true,
  "module": "technique_card",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [
    {
      "id": "technique_001",
      "type": "technique_card",
      "name": "技法名称，具体、可操作，避免空泛",
      "surface_summary": "该技法来自文本中的什么表层写法，不超过80字",
      "author_operation": "作者使用的核心创作操作",
      "reader_effect": "该技法制造的追读感、爽点、悬念、压迫感、情绪释放或关系张力",
      "problem_solved": "解决的创作问题",
      "core_mechanism": "技法的核心机制",
      "applicable_scenarios": [
        "该技法适合在哪类写作场景下使用，必须脱离原文专有名词"
      ],
      "author_operations": [
        {
          "step": 1,
          "operation": "具体操作",
          "purpose": "为什么这么做",
          "evidence": [
            {
              "quote": "原文短证据",
              "supports": "支持该操作判断",
              "location_hint": ""
            }
          ]
        }
      ],
      "migration_method": {
        "abstract_template": "可迁移模板",
        "how_to_use": "创作者落地步骤",
        "genre_variants": "不同题材如何改写，没有则为空字符串"
      },
      "execution_formula": [
        "动作级步骤，优先写成：状态改变/信息操作/资源操作/认知操作"
      ],
      "cross_genre_test": {
        "passes": true,
        "test_description": "说明该技法如何在另一个题材中仍然成立，不得使用原文专有名词"
      },
      "example_rewrite_prompt": "给创作者使用的简短写作指令",
      "abstracted_example": "脱离原小说背景的全新示例，用于证明该技法可跨题材复用",
      "evidence": [
        {
          "quote": "原文短证据",
          "supports": "支持技法抽象",
          "location_hint": ""
        }
      ],
      "reuse_method": "创作者如何复用该技法",
      "failure_modes": ["常见写坏方式"],
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

## 技法命名要求

不要命名为：

- 制造悬念
- 设置冲突
- 塑造人物
- 节奏控制
- 情绪渲染

应命名为：

- 用已知危险加未知代价制造逼近感
- 先用权力位置建立压迫，再用私下破绽制造可接近性
- 先让规则压制主角，再让主角利用规则漏洞反杀
- 用小兑现缓解压力，再用更大未解问题拉住追读

## 高质量答案标准

- 技法名称具体、可操作。
- 能说明解决什么创作问题。
- 有适用场景、执行公式、证据、迁移模板和跨题材测试。
- 执行公式必须是动作级，不是形容词或口号。
- 复用字段不得出现原文专有名词。
- `failure_modes` 能提醒实际写作风险。

## 低质量禁区

- 把剧情摘要包装成技法卡。
- 技法名称空泛。
- 没有证据支撑抽象。
- 迁移方法只是“可以用于其他小说”。
