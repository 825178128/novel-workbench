# 节奏控制分析 Prompt

## 任务定位

你要分析章节或片段中的节奏控制。

重点不是说“节奏快/慢”，而是拆解作者如何安排：

- 信息释放
- 冲突升级
- 情绪波动
- 爽点兑现
- 悬念悬置
- 段落/章节钩子
- 读者注意力转移

## 输入说明

输入可能包含：

- `novel_text`
- `chapter_index`
- `local_segments`：本地切出的段落/事件候选
- `context_before`
- `context_after`
- `source_span`

本地切分只作参考。必须以原文证据确认每个节奏 beat。

## 何时返回 invalid

- 文本太短，无法判断节奏变化。
- 只有单一静态描写。
- 平铺直叙，一次性把设定、结果、对话全盘托出，没有延迟满足或信息扣留。
- 为凑字数进行重复对话或环境描写，未起到压抑情绪或建立期待的作用。
- 章节结尾是事件彻底平息的自然终结，没有悬念、变量或新问题。
- 无明显信息释放或情绪推进。
- 无法提炼可复用节奏方法。

## 输出 JSON schema

```json
{
  "valid": true,
  "module": "rhythm",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [
    {
      "id": "rhythm_001",
      "type": "rhythm_profile",
      "name": "string",
      "surface_summary": "片段表层推进，不超过80字",
      "author_operation": "作者如何控制信息、冲突、情绪和钩子的释放顺序",
      "reader_effect": "读者情绪或注意力如何变化",
      "overall_pattern": "例如：压迫递增后小兑现再悬置/信息遮蔽后反转/先爽点后新危机",
      "pacing_mechanics": {
        "information_drip": "作者刻意扣留什么关键信息，又切碎释放什么次要信息来吊住读者",
        "tension_retardation": "高潮动作前是否通过时间膨胀、视角切换、路人反应或闪回延迟兑现",
        "cut_point_anatomy": "断点卡在什么位置，例如危机降临、关键秘密将揭、利益即将兑现、关系刚刚变质"
      },
      "beats": [
        {
          "beat_order": 1,
          "beat_function": "铺垫|施压|揭示|误导|兑现|反转|悬置|转场",
          "author_operation": "作者具体如何控制节奏",
          "information_released": "释放了什么信息",
          "information_withheld": "保留了什么信息",
          "reader_effect": "造成什么阅读驱动",
          "evidence": [
            {
              "quote": "原文短证据",
              "supports": "支持该 beat 判断",
              "location_hint": ""
            }
          ],
          "confidence": 0.0
        }
      ],
      "hook_design": {
        "has_hook": true,
        "hook_type": "问题悬置|危机升级|身份揭示|利益诱惑|关系变化|反常细节|none",
        "author_operation": "作者如何制造钩子，没有则为空字符串",
        "evidence": [
          {
            "quote": "原文短证据",
            "supports": "支持钩子判断",
            "location_hint": ""
          }
        ],
        "confidence": 0.0
      },
      "evidence": [
        {
          "quote": "原文短证据",
          "supports": "支持整体节奏判断",
          "location_hint": ""
        }
      ],
      "reuse_method": "创作者如何复用这种节奏模型",
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

- 能拆出多个节奏 beat，而不是只评价快慢。
- 明确每个 beat 释放了什么、保留了什么。
- 能说明信息滴漏、张力延迟和章末卡点的具体操作。
- 能指出钩子是否存在，以及具体如何构造。
- 给出可复用节奏模型。

## 低质量禁区

- 只说“先抑后扬”“高潮迭起”。
- 不标明每个节奏 beat 的功能。
- 把剧情顺序当成节奏分析。
