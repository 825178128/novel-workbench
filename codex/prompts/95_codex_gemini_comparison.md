# Codex 与 Gemini Prompt 对比

## 总体结论

Codex 版更适合工程化落地，Gemini 版更适合作为“创作教练”的高压风格参考。

取长补短后的方向：

- 保留 Codex 的统一外层结构、统一 item 字段、`storage_decision`、`confidence`、`value_score`、模块化文件组织。
- 吸收 Gemini 的精确子串证据、专有名词剥离、跨题材测试、动作级执行步骤、模块判废细则。
- 不吸收 Gemini 的 `_thinking_process` 输出要求，因为这会污染可解析结果，也不适合让模型输出思维过程。
- 不吸收 Gemini 示例中的 JSON 注释和 `true或false` 写法，因为它们不是合法 JSON。

## Codex 版优势

- 共享规则独立：`01_shared_gate.md` 和 `02_shared_json_contract.md` 可以被所有模块复用。
- 程序解析稳定：所有模块统一使用 `valid`、`module`、`source_span`、`items`、`invalid_reason`。
- 入库判断明确：每个 item 都有 `storage_decision.should_store` 和 `value_score`。
- 质量审核更完整：包含 unsupported claims、low value items、schema issues。
- 更适合多模块聚合、去重、二次抽象和人工审核界面。

## Gemini 版优势

- 证据要求更硬：要求证据必须是原文精确子串，可用 `String.includes()` 做物理校验。
- 抽象要求更狠：复用方法中禁止出现原文专有名词，强制转成高位者、核心资源、第三方变量等功能性代词。
- 操作感更强：要求“动作 + 信息差/资源/认知”的结构，能防止输出“制造悬念”这类空话。
- 模块判废更具体：例如人物模块区分工具人/背景板，容器模块强调规则剥削和势力博弈，节奏模块强调信息滴漏和断章卡点。
- 技法卡更像写作教材：包含适用场景、执行公式、跨题材示例。

## Gemini 版风险

- 要求输出 `_thinking_process`，不利于稳定解析，也容易让模型输出剧情总结。
- JSON 示例包含注释和 `true或false` 这类非法 JSON 表达。
- 单一全局 schema 过扁，难以承载不同模块的复杂结构。
- 质量审核语气“暴躁”有辨识度，但产品化时不利于稳定、客观、可追踪。
- 缺少统一的入库决策字段，不方便后端做阈值过滤。

## 已合并进 Codex 的改进

- 在全局 prompt 和 JSON 契约中加入：`evidence.quote` 必须是原文精确子串。
- 在共享门禁中加入：复用字段不得泄漏原文专有名词。
- 在共享门禁中加入：动作级技法测试，要求方法能写成信息、资源、认知或关系操作。
- 在剧情单元中加入：Hook/Setup、Escalation/Tension、Payoff/Catharsis 三段动作链。
- 在人物模块中加入：叙事生态位、Show Don't Tell 侧面微操、工具人判废。
- 在容器模块中加入：压力系统、规则剥削、势力制衡。
- 在线索模块中加入：伪装埋藏、认知误导、回收引爆。
- 在节奏模块中加入：信息滴漏、张力延迟、断点解剖。
- 在技法卡中加入：适用场景、执行公式、跨题材测试、抽象示例。
- 在质量审核中加入：证据精确性、专有名词泄漏、空泛动词检查。

## 当前推荐

以 Codex 版作为主版本，Gemini 版作为风格和判废规则的参考库。

程序接入时，建议后端额外做三道硬校验：

1. `evidence.quote` 必须能被原文 `includes` 命中。
2. 复用字段不得命中原文中的人物名、地名、势力名、道具名等候选专有名词。
3. `storage_decision.should_store=true` 必须同时满足 `confidence >= 0.65`、`value_score >= 0.60`、证据校验通过。
