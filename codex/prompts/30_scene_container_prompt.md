# 场景/副本/案件/权力场分析 Prompt

## 任务定位

你要分析文本中的场景、任务、副本、案件或权力场设计。

重点不是地点介绍，而是拆解作者如何搭建一个可产生冲突、探索、压迫、反转或爽点的叙事容器。

请识别：

- 场景/副本/案件/权力场的规则
- 信息不对称
- 压力来源
- 角色站位
- 可触发的冲突
- 作者如何让这个容器产生剧情

## 输入说明

输入可能包含：

- `novel_text`
- `local_scene_candidates`
- `local_event_candidates`
- `context_before`
- `context_after`
- `source_span`

本地候选只作参考。必须以原文证据确认场景容器的规则、压力和叙事功能。

## 何时返回 invalid

- 只有普通地点描写，没有规则、压力或冲突结构。
- 场景只是物理背景，没有特殊规则、环境压力或隐性限制。
- 只是单向宣读副本怪物、奖励、案件设定或势力资料，没有角色与规则的交互或利用。
- 没有资源稀缺、多方势力牵制、时间压力、规则惩罚或信息不对称。
- 场景没有承载叙事功能。
- 无法抽象出可复用设计方法。
- 只有人物移动或环境描写，不能支撑“容器设计”判断。

## 输出 JSON schema

```json
{
  "valid": true,
  "module": "scene_container",
  "source_span": {
    "chapter_id": "",
    "start_offset": null,
    "end_offset": null
  },
  "items": [
    {
      "id": "scene_container_001",
      "type": "scene|dungeon|case|power_field|relationship_field",
      "name": "string",
      "surface_summary": "表层内容简述，不超过80字",
      "author_operation": "作者如何设计这个叙事容器",
      "reader_effect": "这个容器制造的压迫、探索、悬念、爽点或关系张力",
      "design_function": "这个叙事容器的核心功能",
      "container_mechanics": {
        "pressure_system": "作者引入的外部压力机制，例如倒计时、缩圈、规则惩罚、环境 debuff、追捕或资源耗尽",
        "rule_exploitation": "角色如何利用规则漏洞、信息差或资源错配破局；没有则为空字符串",
        "faction_dynamics": "多方势力如何制衡、牵制或误判；没有则为空字符串"
      },
      "rules_or_constraints": [
        {
          "rule": "显性或隐性规则",
          "effect": "规则如何制造压力、选择或冲突",
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
      "pressure_sources": [
        {
          "source": "压力来源",
          "author_operation": "作者如何施压",
          "reader_effect": "读者感受到的期待、紧张、压迫或爽点",
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
      "information_design": {
        "known_to_reader": "读者已知信息",
        "hidden_or_uncertain": "隐藏或不确定信息",
        "misdirection": "可能的误导设计，没有则为空字符串",
        "evidence": [
          {
            "quote": "原文短证据",
            "supports": "支持信息设计判断",
            "location_hint": ""
          }
        ]
      },
      "role_positions": [
        {
          "role": "人物/势力",
          "position": "在该容器中的权力、资源、信息或情绪位置",
          "function": "此站位如何服务冲突",
          "evidence": [
            {
              "quote": "原文短证据",
              "supports": "支持角色站位判断",
              "location_hint": ""
            }
          ]
        }
      ],
      "evidence": [
        {
          "quote": "原文短证据",
          "supports": "支持叙事容器判断",
          "location_hint": ""
        }
      ],
      "reuse_method": "创作者如何迁移这个容器设计",
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

- 不把地点当成场景设计。
- 能拆出规则、压力、信息差和角色站位。
- 能拆出压力系统、规则剥削点和势力博弈。
- 能说明这个容器如何制造剧情。
- 能给创作者迁移模板。

## 低质量禁区

- “场景是某某地点”。
- 把“有敌人”当成“权力场”。
- 不分析规则、压力、信息差、角色站位。
