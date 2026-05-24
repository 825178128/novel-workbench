# 剧情单元分析 Prompt

## 任务定位

你要分析一个或多个章节片段中的“剧情单元”。

剧情单元不是剧情摘要，而是作者为了推动阅读欲望而组织的一组叙事动作。你需要识别：

- 这个单元的核心创作功能
- 作者如何建立目标、阻碍、变化、爽点、悬念或钩子
- 这个单元如何服务后续追读
- 创作者可以如何复用这种结构

## 输入说明

输入可能包含：

- `novel_text`：原文片段
- `local_candidates`：本地预检得到的章节切分、事件候选、人物候选、场景候选，可能有噪声
- `context_before`：可选，上文摘要或片段
- `context_after`：可选，下文摘要或片段
- `source_span`：可选，章节和文本位置

只基于原文和可靠上下文判断。`local_candidates` 只作参考，不可当成事实。

## 何时返回 invalid

- 文本过短，无法形成完整剧情单元。
- 只有静态描写，没有明显叙事推进。
- 纯日常过渡、赶路、设定说明，没有情绪起伏或明确冲突。
- 流水账式战斗或事件，只有动作堆砌，没有拉扯感、信息差、规则利用或博弈。
- 冲突极度老套且缺乏前置压抑或期待建立，例如反派无脑挑衅后被直接解决。
- 无法从文本证据中判断作者的创作操作。
- 只能总结“发生了什么”，无法提炼“怎么设计”。
- 分析无法提供创作者复用价值。

## 输出 JSON schema

```json
{
  "valid": true,
  "module": "plot_unit",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [
    {
      "id": "plot_unit_001",
      "type": "plot_unit",
      "name": "string",
      "surface_summary": "简短说明发生了什么，不超过80字",
      "author_operation": "作者在该剧情单元中执行的核心创作操作",
      "reader_effect": "该操作制造的追读、爽点、悬念、焦虑或情绪效果",
      "creative_function": "立目标/制造危机/兑现爽点/反转预期/引出新问题等",
      "structure_breakdown": {
        "setup": "作者如何建立局面",
        "pressure": "作者如何施加压力或阻碍",
        "turning_point": "作者如何制造变化",
        "payoff_or_hook": "作者如何兑现或悬置"
      },
      "arc_operations": {
        "hook_setup": "作者如何建立期待，例如抛出死局、稀缺资源、异常目标或不对称信息",
        "escalation_tension": "作者如何升级冲突、恶化处境、制造误会或反转",
        "payoff_catharsis": "作者如何引爆情绪，破局依靠武力碾压、智力算计、规则漏洞还是关系逆转"
      },
      "drive_mechanisms": [
        {
          "mechanism": "读者追读机制",
          "author_operation": "作者具体做了什么",
          "reader_effect": "对读者造成什么期待、焦虑、爽感或疑问",
          "evidence": [
            {
              "quote": "原文短证据",
              "supports": "这条证据支持的判断",
              "location_hint": ""
            }
          ],
          "confidence": 0.0
        }
      ],
      "evidence": [
        {
          "quote": "原文短证据",
          "supports": "支持核心剧情单元判断",
          "location_hint": ""
        }
      ],
      "reuse_method": "创作者如何迁移这种剧情单元结构",
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

## 高质量答案标准

- `surface_summary` 很短，只作为理解入口。
- `author_operation` 明确说明作者如何组织目标、阻碍、变化和钩子。
- `structure_breakdown` 能看出剧情单元的内部推进。
- `arc_operations` 能说明期待建立、冲突升级和情绪兑现的动作链。
- `reuse_method` 是可迁移方法，不是评价。
- `reuse_method` 不保留原文专有名词，必须抽象成动作、信息差、资源或认知操作。
- 每个核心判断有原文证据。

## 低质量禁区

- “本章主要讲了……”后面只写剧情。
- “节奏紧凑”“引人入胜”但不说明操作。
- 把任何冲突都说成“制造悬念”。
- 没有证据就推断作者意图。
