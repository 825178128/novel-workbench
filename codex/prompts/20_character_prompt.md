# 人物塑造分析 Prompt

## 任务定位

你要分析文本中的人物塑造方法。

重点不是整理人物档案，而是拆解作者如何让人物服务：

- 爽点
- 悬念
- 情绪
- 关系张力
- 权力差
- 价值观冲突
- 主角衬托
- 后续剧情牵引

## 输入说明

输入可能包含：

- `novel_text`
- `local_character_candidates`：本地识别的人名、称谓、关系，可能不准
- `context_before`
- `context_after`
- `source_span`

只分析文本中有足够证据的人物。不要补全人物设定。

## 何时返回 invalid 或空

- 人物只是被提及，没有形成塑造动作。
- 人物只是工具人或背景板，只负责传递基础信息、报信、服务或制造背景音。
- 只有身份信息，没有叙事功能。
- 作者只是用旁白罗列外貌、身世和性格，没有通过事件、动作、对话或他人反应展现。
- 无法判断人物如何服务爽点、悬念、情绪或关系。
- 证据不足以支持人物功能判断。
- 无法抽象出可复用的人物写法。

## 输出 JSON schema

```json
{
  "valid": true,
  "module": "character",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [
    {
      "id": "character_001",
      "type": "character",
      "name": "string",
      "surface_summary": "此片段中人物表层行为或状态，不超过80字",
      "author_operation": "作者如何塑造该人物以服务叙事效果",
      "reader_effect": "该人物写法制造的爽点、悬念、情绪或关系张力",
      "role_in_scene": "此片段中的叙事角色，而非百科身份",
      "narrative_ecology_position": "该人物在当前叙事网络中的功能生态位，例如压迫源、情绪缓冲、规则具象化、主角垫脚石、关系诱饵",
      "served_effects": ["爽点", "悬念", "情绪", "关系张力", "权力压迫", "反差", "误导"],
      "show_dont_tell_operations": [
        {
          "detail": "作者用来侧面塑造人物的动作、对话、他人反应或环境对比",
          "revealed_function": "该细节揭示的人物叙事功能",
          "evidence": [
            {
              "quote": "原文短证据",
              "supports": "支持侧面塑造判断",
              "location_hint": ""
            }
          ],
          "confidence": 0.0
        }
      ],
      "craft_operations": [
        {
          "operation": "具体人物塑造操作",
          "description": "作者如何写",
          "narrative_value": "这个操作带来的阅读效果",
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
      "relationship_tension": {
        "target": "与谁形成关系张力，没有则为空字符串",
        "tension_type": "压制/依赖/试探/敌对/暧昧/误解/利益绑定等，没有则为空字符串",
        "author_operation": "作者如何制造这种张力，没有则为空字符串",
        "evidence": [
          {
            "quote": "原文短证据",
            "supports": "支持关系张力判断",
            "location_hint": ""
          }
        ],
        "confidence": 0.0
      },
      "evidence": [
        {
          "quote": "原文短证据",
          "supports": "支持人物叙事功能判断",
          "location_hint": ""
        }
      ],
      "reuse_method": "创作者如何复用这种人物写法",
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

- 说明人物不是“是什么”，而是“被作者拿来做什么”。
- 能指出人物的叙事功能。
- 能识别人物的叙事生态位，而不是只列身份标签。
- 能指出作者如何通过动作、对话、他人反应或环境对比进行侧面塑造。
- 能说明人物如何服务爽点、悬念、情绪或关系张力。
- 能把具体写法抽象成可迁移手法。
- 不强行分析所有人物，只保留高价值人物。

## 低质量禁区

- 写成人物百科、身份表、关系表。
- 只说“人物形象丰满”“性格鲜明”。
- 没有证据就补全人物动机。
- 把人物出现等同于人物塑造。
