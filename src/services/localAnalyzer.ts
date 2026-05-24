import type {
  Chapter,
  StoryUnit,
  ForeshadowCard,
  CharacterCard,
  RhythmCard,
  MapDungeonCard,
  TechniqueCard,
  EvidenceItem,
  NarrativeMechanism,
} from '../types/knowledge';

const DEFAULT_UNIT_SIZE = 8;
const MAX_UNIT_SIZE = 14;

const BOUNDARY_PATTERNS = [
  /三日后|数日后|翌日|次日|转眼|与此同时/,
  /来到|进入|离开|回到|前往|抵达/,
  /突破|晋级|获胜|失败|真相|揭开/,
  /没想到|原来|竟然|居然|然而|但是/,
  /新的任务|考核|试炼|挑战|比赛/,
];

const EMOTION_PATTERNS: Array<[string, RegExp]> = [
  ['压抑', /压抑|沉默|无奈|叹气|苦笑/],
  ['愤怒', /愤怒|怒火|生气|咬牙|不满/],
  ['紧张', /紧张|心跳|屏住呼吸|危机|小心/],
  ['期待', /期待|希望|渴望|想要|机会/],
  ['爆发', /爆发|反击|冲出|大喝|出手/],
  ['热血', /热血|兴奋|振奋|豪迈|胜利/],
  ['悲伤', /悲伤|难过|流泪|痛苦|心酸/],
  ['释然', /释然|明白|理解|放下|松了口气/],
];

const FORESHADOW_PATTERNS: Array<[string, RegExp]> = [
  ['游戏规则伏笔', /系统|任务|奖励|惩罚|技能|称号|剧本|通关|玩家/g],
  ['悬疑线索伏笔', /线索|真相|秘密|隐藏|异常|谜|推理|调查/g],
  ['危机伏笔', /死亡|尸体|血迹|怪物|鬼|恐惧|追杀|警告/g],
  ['物品伏笔', /钥匙|纸条|书|门|房间|道具|装备|卡片/g],
  ['身份伏笔', /身份|来历|背景|真实|伪装|名字/g],
];

const COMMON_WORDS = new Set([
  '一个', '这个', '那个', '什么', '怎么', '为什么', '自己', '没有', '不是', '就是',
  '可能', '应该', '现在', '时候', '地方', '东西', '事情', '问题', '心里', '手中',
  '身上', '眼中', '声音', '知道', '觉得', '感觉', '认为', '想到', '看到', '说道',
  '问道', '回答', '点头', '摇头', '如果', '但是', '因为', '所以', '虽然', '然而',
  '已经', '正在', '即将', '突然', '渐渐', '慢慢',
  '当然', '普通', '类型', '名称', '备注', '效果', '说明', '技能', '装备', '系统',
  '任务', '玩家', '剧本', '游戏', '恐惧', '时间', '生命', '体能', '页面', '菜单',
  '封不觉道', '封不觉的', '封不觉说', '封不觉看', '封不觉回', '边邱少爷',
]);

const NAME_SUFFIX_PATTERN = /(说道|回道|问道|答道|笑道|叹道|骂道|喝道|道|说|问|答|看|回|的|就)$/;
const DIALOGUE_NAME_PATTERN = /([\u4e00-\u9fa5]{2,4})(?:说道|回道|问道|答道|笑道|叹道|骂道|喝道|道|说|问|答)/g;
const ACTION_NAME_PATTERN = /(?:主角|玩家|侦探|医生|警察|少年|男人|女人|队友)?([\u4e00-\u9fa5]{2,4})(?:走|看|想|听|拿|打开|进入|离开|发现|选择|使用|攻击|闪避|推理)/g;

const EVIDENCE_RULES: Array<[EvidenceItem['category'], RegExp, string[]]> = [
  ['rule', /系统|任务|奖励|惩罚|技能|称号|剧本|通关|玩家|规则/, ['规则', '副本']],
  ['danger', /死亡|尸体|血迹|怪物|鬼|恐惧|追杀|危险|危机/, ['危机', '压迫']],
  ['suspense', /线索|真相|秘密|隐藏|异常|谜|推理|调查|发现/, ['悬念', '信息']],
  ['worldbuilding', /世界|组织|公司|游戏|空间|设定|现实|商城|论坛/, ['世界观']],
  ['dialogue', /说道|问道|回道|答道|笑道|吐槽/, ['对话', '人物']],
  ['hook', /。$|！$|？$/, ['章节钩子']],
  ['item', /钥匙|纸条|书|门|房间|道具|装备|卡片/, ['道具', '线索']],
];

const SCENE_ENTRY_PATTERN = /进入|来到|抵达|前往|离开|回到|搬进|入住|赴约|参加|被带到|现场|开场|开始|副本|剧本|任务|案件|秘境|考核|宴会|学校|学院|公司|医院|宫廷|战场/g;
const SCENE_GOAL_PATTERN = /寻找|调查|保护|救|逃离|完成|赢|获胜|通关|证明|夺取|争夺|谈判|追求|隐藏|复仇|破案|晋级|修炼|拜师|赚钱|签约/g;
const SCENE_RULE_PATTERN = /规则|任务|系统|必须|不能|禁止|限制|条件|期限|身份|契约|婚约|考核|制度|阶级|家法|门规|校规|法律|流程|名额|资格|权限/g;
const SCENE_RESOURCE_PATTERN = /钥匙|门|房间|道具|装备|技能|奖励|称号|物品|线索|证据|提示|身份|钱|股份|权力|人脉|关系|情报|信物|功法|丹药|法宝|合同/g;
const SCENE_STAKE_PATTERN = /代价|惩罚|失败|死亡|扣除|消耗|限制|恐惧|危险|追杀|攻击|怪物|陷阱|暴露|失去|破产|退婚|背叛|淘汰|舆论|处分|受伤|牺牲/g;
const SCENE_EXIT_PATTERN = /通关|完成|奖励|获得|离开|结束|回到|结算|解决|破案|胜利|失败|晋级|升级|离场|散场|脱身|达成|兑现/g;
const SCENE_NAME_PATTERN = /副本|剧本|任务|系统|规则|游戏|房间|门|案件|秘境|考核|宴会|学校|学院|公司|医院|宫廷|战场|赛场|现场|城市|村|镇|岛|山|楼|馆|屋/;

interface SceneSignal {
  score: number;
  hasEntry: boolean;
  hasGoal: boolean;
  hasRule: boolean;
  hasResource: boolean;
  hasStake: boolean;
  hasExit: boolean;
  hasSpecificArena: boolean;
}

export function segmentStoryUnits(chapters: Chapter[]): StoryUnit[] {
  if (chapters.length === 0) {
    return [];
  }

  const units: StoryUnit[] = [];
  let startIndex = 0;

  for (let index = 1; index < chapters.length; index++) {
    const currentSize = index - startIndex + 1;
    const chapter = chapters[index];
    const hasBoundary = BOUNDARY_PATTERNS.some(pattern => pattern.test(`${chapter.title}\n${chapter.text.slice(0, 800)}`));

    if ((currentSize >= DEFAULT_UNIT_SIZE && hasBoundary) || currentSize >= MAX_UNIT_SIZE) {
      units.push(createStoryUnit(chapters.slice(startIndex, index + 1), units.length + 1));
      startIndex = index + 1;
    }
  }

  if (startIndex < chapters.length) {
    units.push(createStoryUnit(chapters.slice(startIndex), units.length + 1));
  }

  return units;
}

export function buildEvidenceIndex(chapters: Chapter[], workId: string): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  for (const chapter of chapters) {
    const paragraphs = chapter.text.split(/\n+/).map(item => item.trim()).filter(Boolean);

    paragraphs.forEach((paragraph, paragraphIndex) => {
      for (const [category, pattern, tags] of EVIDENCE_RULES) {
        if (!pattern.test(paragraph)) continue;

        evidence.push({
          evidence_id: `ev_${workId}_${chapter.chapter_index}_${paragraphIndex}_${category}`,
          work_id: workId,
          chapter_index: chapter.chapter_index,
          paragraph_index: paragraphIndex,
          category,
          text: paragraph.slice(0, 220),
          tags,
        });
        break;
      }
    });

    const tail = chapter.text.replace(/\s+/g, ' ').slice(-180);
    if (tail) {
      evidence.push({
        evidence_id: `ev_${workId}_${chapter.chapter_index}_tail_hook`,
        work_id: workId,
        chapter_index: chapter.chapter_index,
        paragraph_index: paragraphs.length,
        category: 'hook',
        text: tail,
        tags: ['章节尾钩'],
      });
    }
  }

  return evidence.slice(0, 800);
}

export function generateNarrativeMechanisms({
  workId,
  evidenceIndex,
  storyUnits,
  characterCards,
  rhythmCards,
  foreshadowCards,
}: {
  workId: string;
  evidenceIndex: EvidenceItem[];
  storyUnits: StoryUnit[];
  characterCards: CharacterCard[];
  rhythmCards: RhythmCard[];
  foreshadowCards: ForeshadowCard[];
}): NarrativeMechanism[] {
  const mechanisms: NarrativeMechanism[] = [];

  const ruleEvidence = evidenceIndex.filter(item => item.category === 'rule').slice(0, 8);
  if (ruleEvidence.length > 0) {
    mechanisms.push({
      mechanism_id: `mech_${workId}_dungeon_rules`,
      work_id: workId,
      category: '副本设计',
      name: '规则先行的副本推进机制',
      source_units: storyUnits.map(unit => unit.unit_id),
      evidence_ids: ruleEvidence.map(item => item.evidence_id),
      observation: '文本中反复出现系统、任务、奖励、剧本、通关等规则性信息。',
      method_summary: '先限定目标和规则，再让主角在规则内解决问题，形成副本可玩性。',
      confidence: 0.66,
      status: 'pending',
    });
  }

  const suspenseEvidence = evidenceIndex.filter(item => item.category === 'suspense' || item.category === 'hook').slice(0, 10);
  if (suspenseEvidence.length > 0 || rhythmCards.some(card => card.pacing_density.reveal_count > 0)) {
    mechanisms.push({
      mechanism_id: `mech_${workId}_suspense_release`,
      work_id: workId,
      category: '悬念危机',
      name: '异常信息分批释放机制',
      source_units: storyUnits.map(unit => unit.unit_id),
      evidence_ids: suspenseEvidence.map(item => item.evidence_id),
      observation: '章节尾钩和线索词频提示文本在持续制造未解问题。',
      method_summary: '用异常、线索、局部解释和新问题交替推进，让读者持续追问。',
      confidence: 0.62,
      status: 'pending',
    });
  }

  const dangerEvidence = evidenceIndex.filter(item => item.category === 'danger').slice(0, 8);
  if (dangerEvidence.length > 0) {
    mechanisms.push({
      mechanism_id: `mech_${workId}_danger_pressure`,
      work_id: workId,
      category: '悬念危机',
      name: '危机压迫与解谜并行机制',
      source_units: storyUnits.map(unit => unit.unit_id),
      evidence_ids: dangerEvidence.map(item => item.evidence_id),
      observation: '危险、死亡、怪物、追杀等压力词与线索推进并存。',
      method_summary: '危机不只负责吓人，也负责压缩决策时间，迫使主角展示能力。',
      confidence: 0.6,
      status: 'pending',
    });
  }

  if (characterCards.length > 0) {
    mechanisms.push({
      mechanism_id: `mech_${workId}_protagonist_signature`,
      work_id: workId,
      category: '主角塑造',
      name: '通过重复行动证明主角特质',
      source_units: storyUnits.slice(0, 4).map(unit => unit.unit_id),
      evidence_ids: evidenceIndex.filter(item => item.category === 'dialogue').slice(0, 8).map(item => item.evidence_id),
      observation: `高频人物候选“${characterCards[0].name}”在对话与行动语境中反复出现。`,
      method_summary: '主角魅力不靠介绍，而靠面对规则、危机和线索时的稳定反应被反复证明。',
      confidence: characterCards[0].confidence,
      status: 'pending',
    });
  }

  if (foreshadowCards.length > 0) {
    mechanisms.push({
      mechanism_id: `mech_${workId}_information_planting`,
      work_id: workId,
      category: '伏笔回收',
      name: '候选线索的信息控制机制',
      source_units: storyUnits.map(unit => unit.unit_id),
      evidence_ids: evidenceIndex.filter(item => item.category === 'item' || item.category === 'rule').slice(0, 10).map(item => item.evidence_id),
      observation: '规则、道具、异常、身份等信息在早期构成后续可回收的候选线索。',
      method_summary: '先让信息以表层用途出现，再通过强化、误导和回收转化为剧情解法。',
      confidence: 0.58,
      status: 'pending',
    });
  }

  return mechanisms;
}

export function extractForeshadowCandidates(unit: StoryUnit, chapters: Chapter[]): ForeshadowCard[] {
  const unitChapters = chapters.filter(
    chapter => chapter.chapter_index >= unit.chapter_range[0] && chapter.chapter_index <= unit.chapter_range[1],
  );
  const candidates: ForeshadowCard[] = [];

  for (const chapter of unitChapters) {
    for (const [type, pattern] of FORESHADOW_PATTERNS) {
      const matches = Array.from(chapter.text.matchAll(pattern)).slice(0, 1);

      for (const match of matches) {
        const start = Math.max(0, (match.index ?? 0) - 50);
        const end = Math.min(chapter.text.length, (match.index ?? 0) + match[0].length + 50);
        const context = chapter.text.slice(start, end);

        if (context.length < 20 || candidates.some(candidate => candidate.surface_info === context)) {
          continue;
        }

        candidates.push({
          foreshadow_id: `fs_${unit.unit_id}_${candidates.length + 1}`,
          work_id: unit.work_id,
          name: `${type}：${match[0]}`,
          foreshadow_type: type,
          first_appearance: `chapter_${chapter.chapter_index}`,
          surface_info: context,
          hidden_info: '',
          planting_method: '关键词或异常信息首次出现',
          reinforcement_nodes: [],
          misdirection: '',
          status: 'pending',
          writing_takeaway: '',
          confidence: 0.5,
          review_status: 'pending',
        });
      }
    }
  }

  return candidates
    .filter(candidate => isStrongForeshadowCandidate(candidate.surface_info))
    .slice(0, 3);
}

export function extractCharacterCandidates(chapters: Chapter[]): Array<{
  name: string;
  frequency: number;
  score: number;
}> {
  const nameMap = new Map<string, number>();

  for (const chapter of chapters) {
    collectNamesFromPattern(chapter.text, DIALOGUE_NAME_PATTERN, nameMap, 4);
    collectNamesFromPattern(chapter.text, ACTION_NAME_PATTERN, nameMap, 2);
  }

  const totalChapters = Math.max(chapters.length, 1);
  return Array.from(nameMap.entries())
    .filter(([name, frequency]) => isLikelyCharacterName(name) && frequency >= 3)
    .map(([name, frequency]) => ({
      name,
      frequency,
      score: Math.min(0.45 + frequency / (totalChapters * 4), 0.95),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);
}

export function generateCharacterCards(
  candidates: Array<{ name: string; frequency: number; score: number }>,
  workId: string,
): CharacterCard[] {
  return candidates.slice(0, 15).map((candidate, index) => ({
    character_id: `char_${workId}_${index + 1}`,
    work_id: workId,
    name: candidate.name,
    role_type: inferRoleType(candidate.score),
    narrative_function: [],
    first_appearance: '待确认',
    initial_tags: [],
    core_desire: '',
    external_goal: '',
    internal_lack: '',
    charm_points: [],
    reader_empathy: [],
    conflict_sources: [],
    growth_path: [],
    relationship_tensions: [],
    writing_takeaway: '',
    source_evidence: [],
    confidence: candidate.score,
    status: 'pending',
  }));
}

export function generateRhythmCard(unit: StoryUnit, chapters: Chapter[], workId: string): RhythmCard {
  const unitChapters = chapters.filter(
    chapter => chapter.chapter_index >= unit.chapter_range[0] && chapter.chapter_index <= unit.chapter_range[1],
  );
  const fullText = unitChapters.map(chapter => chapter.text).join('\n');
  const chapterHooks = unitChapters.map(chapter => ({
    chapter: chapter.chapter_index,
    hook_type: inferHookType(`${chapter.title}\n${chapter.text.slice(-260)}`),
    hook: buildChapterHook(chapter),
  })).filter(item => item.hook);

  return {
    rhythm_id: `rhythm_${unit.unit_id}`,
    work_id: workId,
    unit_id: unit.unit_id,
    beat_sequence: buildBeatSequence(unit, unitChapters),
    pacing_density: {
      conflict_count: countMatches(fullText, /冲突|争执|攻击|战斗|怪物|危险|危机|追杀|死亡/g),
      reveal_count: countMatches(fullText, /发现|真相|线索|原来|秘密|谜|提示/g),
      payoff_count: countMatches(fullText, /完成|通关|奖励|获得|解决|击败|成功/g),
      new_hook_count: chapterHooks.length,
    },
    chapter_hooks: chapterHooks.slice(0, 12),
    emotional_curve: unit.emotional_curve,
    payoff: unit.payoff || inferPayoff(fullText),
    new_hook: unit.next_hook || chapterHooks.at(-1)?.hook || '',
    writing_takeaway: '按章节尾钩和单元情绪曲线生成的本地节奏草稿，建议人工审核后再入库。',
    confidence: 0.62,
    status: 'pending',
  };
}

export function generateMapDungeonCards(units: StoryUnit[], chapters: Chapter[], workId: string): MapDungeonCard[] {
  return units
    .map(unit => {
      const unitChapters = chapters.filter(
        chapter => chapter.chapter_index >= unit.chapter_range[0] && chapter.chapter_index <= unit.chapter_range[1],
      );
      const fullText = unitChapters.map(chapter => chapter.text).join('\n');
      const sceneSignal = analyzeSceneStructure(fullText, `${unit.unit_type}${unit.title}${unit.core_question}`);
      const ruleSnippets = extractSentences(fullText, SCENE_RULE_PATTERN, 5);
      const threatSnippets = extractSentences(fullText, SCENE_STAKE_PATTERN, 5);
      const resourceSnippets = extractSentences(fullText, SCENE_RESOURCE_PATTERN, 5);
      const concreteEvidenceCount = ruleSnippets.length + threatSnippets.length + resourceSnippets.length;

      if (sceneSignal.score < 4.2 || concreteEvidenceCount < 2) {
        return null;
      }

      const titleHint = unitChapters.find(chapter => SCENE_NAME_PATTERN.test(`${chapter.title}\n${chapter.text.slice(0, 500)}`));
      const name = titleHint ? extractMapName(titleHint.title, titleHint.text) : `第${unit.chapter_range[0]}-${unit.chapter_range[1]}章场景结构`;

      return {
        map_id: `map_${unit.unit_id}`,
        work_id: workId,
        name,
        map_type: inferMapType(fullText, sceneSignal),
        entry_reason: extractFirstSentence(fullText, SCENE_ENTRY_PATTERN) || `第${unit.chapter_range[0]}-${unit.chapter_range[1]}章形成新的场景、关系或规则约束。`,
        entry_cost: extractFirstSentence(fullText, SCENE_STAKE_PATTERN) || '本地规则暂未识别明确进入代价，建议人工补充。',
        new_rules: ruleSnippets,
        core_resources: resourceSnippets,
        core_threats: threatSnippets,
        key_characters: extractLikelyNames(fullText).slice(0, 6),
        plot_functions: inferMapFunctions(fullText, sceneSignal),
        internal_structure: inferInternalStructure(unitChapters),
        exit_change: extractFirstSentence(fullText, SCENE_EXIT_PATTERN) || unit.payoff || '本地规则暂未识别明确退出变化。',
        writing_takeaway: '本地规则根据入口、目标、限制、资源、威胁和退出变化抽取的场景结构草稿；适合用于人工复盘“作者如何搭建这一段的创作舞台”。',
        confidence: Math.min(0.78, 0.48 + sceneSignal.score / 12),
        status: 'pending',
      };
    })
    .filter((card): card is MapDungeonCard => Boolean(card));
}

export function generateTechniqueCards({
  workId,
  workTitle,
  narrativeMechanisms,
  storyUnits,
  characterCards,
  rhythmCards,
  foreshadowCards,
}: {
  workId: string;
  workTitle: string;
  narrativeMechanisms: NarrativeMechanism[];
  storyUnits: StoryUnit[];
  characterCards: CharacterCard[];
  rhythmCards: RhythmCard[];
  foreshadowCards: ForeshadowCard[];
}): TechniqueCard[] {
  const cards: TechniqueCard[] = [];
  const unitIds = storyUnits.map(unit => unit.unit_id);
  const firstUnit = storyUnits[0];
  const firstMainCharacter = characterCards[0];

  if (firstMainCharacter) {
    cards.push({
      technique_id: `tech_${workId}_protagonist_contrast`,
      work_id: workId,
      name: '用反类型主角反应建立记忆点',
      category: '主角塑造',
      source_work: workTitle,
      source_units: unitIds.slice(0, 3),
      source_mechanisms: findMechanisms(narrativeMechanisms, '主角塑造'),
      pattern: `围绕“${firstMainCharacter.name}”建立区别于常规类型主角的反应方式，再通过行动反复证明这种特质。`,
      why_it_works: [
        '读者能快速记住主角和同类作品的差异。',
        '反常反应会制造期待：下一次危机中主角会如何处理。',
        '如果反应能服务解谜、吐槽或行动，会同时推动剧情和人物魅力。',
      ],
      usable_when: ['强类型开局', '恐怖/悬疑/副本流', '需要快速建立主角记忆点时'],
      risks: ['反常反应必须有设定解释，否则会显得装酷。', '主角不能只反常不行动，必须持续解决问题。'],
      reuse_template: '先建立类型常规反应，再让主角给出反常但合理的反应，并安排后续情节不断证明这个特质有用。',
      confidence: firstMainCharacter.confidence,
      status: 'pending',
    });
  }

  if (storyUnits.some(unit => /副本|剧本|规则|游戏|任务|系统/.test(`${unit.unit_type} ${unit.core_question} ${unit.source_evidence.join(' ')}`))) {
    cards.push({
      technique_id: `tech_${workId}_dungeon_rules`,
      work_id: workId,
      name: '用规则边界设计副本可玩性',
      category: '副本设计',
      source_work: workTitle,
      source_units: unitIds,
      source_mechanisms: findMechanisms(narrativeMechanisms, '副本设计'),
      pattern: '先给出任务、规则或限制，再让主角在规则内寻找解法，使副本既有危机也有推理空间。',
      why_it_works: [
        '规则让读者知道游戏边界，便于参与推理。',
        '限制条件能自然制造压迫感。',
        '通关结果可以同时兑现爽点、能力信息和世界观信息。',
      ],
      usable_when: ['副本流', '无限流', '悬疑关卡', '规则怪谈式章节'],
      risks: ['规则过多会压垮阅读节奏。', '解法必须来自已给规则，否则会变成作者强行解释。'],
      reuse_template: '进入副本 -> 给出目标与限制 -> 制造信息差危机 -> 主角利用规则破解 -> 奖励或新世界观信息兑现。',
      confidence: 0.66,
      status: 'pending',
    });
  }

  if (rhythmCards.some(card => card.pacing_density.reveal_count > 0 || card.pacing_density.new_hook_count > 0)) {
    cards.push({
      technique_id: `tech_${workId}_suspense_release`,
      work_id: workId,
      name: '用分批揭示维持悬念推进',
      category: '悬念危机',
      source_work: workTitle,
      source_units: unitIds,
      source_mechanisms: findMechanisms(narrativeMechanisms, '悬念危机'),
      pattern: '每个单元不一次性解释全部真相，而是用线索、异常、章节尾钩逐步释放信息。',
      why_it_works: [
        '读者会持续追问“真相是什么”。',
        '分批揭示可以让章节之间形成自然续读。',
        '悬念和危机交替出现，能避免单纯说明设定造成疲劳。',
      ],
      usable_when: ['悬疑线', '副本解谜', '世界观逐步展开', '章节尾钩设计'],
      risks: ['只抛谜不兑现会损耗信任。', '线索必须可回溯，不能依赖临时补设定。'],
      reuse_template: '异常现象 -> 局部解释 -> 新矛盾 -> 更深线索 -> 阶段性兑现 -> 新问题。',
      confidence: 0.64,
      status: 'pending',
    });
  }

  if (foreshadowCards.length > 0) {
    cards.push({
      technique_id: `tech_${workId}_information_planting`,
      work_id: workId,
      name: '把规则/道具/异常作为后续信息控制点',
      category: '伏笔回收',
      source_work: workTitle,
      source_units: unitIds,
      source_mechanisms: findMechanisms(narrativeMechanisms, '伏笔回收'),
      pattern: '在早期通过规则、道具、异常或身份信息留下候选线索，后续可以强化、误导或回收。',
      why_it_works: [
        '早期信息让后续反转有来源。',
        '读者回看时能获得“原来早有提示”的满足感。',
        '信息控制能把世界观说明转化为剧情推进。',
      ],
      usable_when: ['伏笔链设计', '悬疑副本', '世界观规则透露', '道具回收'],
      risks: ['候选线索不等于伏笔，必须有强化和回收链路。', '伏笔太密会显得像资料堆砌。'],
      reuse_template: '表层信息首次出现 -> 用情节强化它的重要性 -> 制造误读 -> 在关键节点回收真实含义。',
      confidence: 0.58,
      status: 'pending',
    });
  }

  if (firstUnit) {
    cards.push({
      technique_id: `tech_${workId}_opening_question`,
      work_id: workId,
      name: '用开局核心问题牵引读者进入类型承诺',
      category: '开局',
      source_work: workTitle,
      source_units: [firstUnit.unit_id],
      source_mechanisms: narrativeMechanisms.slice(0, 2).map(mechanism => mechanism.mechanism_id),
      pattern: `开局围绕“${firstUnit.unit_type}”建立读者要追问的问题，并用主角反应、规则或危机给出类型承诺。`,
      why_it_works: [
        '读者会先被问题牵引，而不是被设定说明劝退。',
        '开局类型承诺越清晰，后续副本和人物表现越容易被接受。',
      ],
      usable_when: ['小说开篇', '新卷开篇', '新副本开场'],
      risks: ['开局问题不能太抽象，需要立刻落在人物行动或具体危机上。'],
      reuse_template: '用一个具体异常/危机/任务开场，让主角立刻行动，并在行动中暴露世界规则。',
      confidence: firstUnit.confidence,
      status: 'pending',
    });
  }

  return cards;
}

function findMechanisms(mechanisms: NarrativeMechanism[], category: NarrativeMechanism['category']): string[] {
  return mechanisms.filter(mechanism => mechanism.category === category).map(mechanism => mechanism.mechanism_id);
}

function createStoryUnit(chapters: Chapter[], unitIndex: number): StoryUnit {
  const firstChapter = chapters[0];
  const lastChapter = chapters[chapters.length - 1];
  const fullText = chapters.map(chapter => chapter.text).join('\n');

  return {
    unit_id: `unit_${firstChapter.chapter_index}_${lastChapter.chapter_index}`,
    work_id: '',
    title: buildLocalStoryUnitTitle(fullText, unitIndex, firstChapter.chapter_index, lastChapter.chapter_index),
    chapter_range: [firstChapter.chapter_index, lastChapter.chapter_index],
    unit_type: inferUnitType(fullText, firstChapter.chapter_index),
    core_question: '',
    protagonist_goal: '',
    main_obstacle: '',
    reader_hook: '',
    emotional_curve: extractEmotionCurve(fullText),
    start_state: '',
    end_state: '',
    payoff: '',
    next_hook: '',
    writing_takeaway: '',
    source_evidence: buildStoryUnitEvidence(chapters),
    confidence: 0.6,
    status: 'pending',
  };
}

function buildLocalStoryUnitTitle(text: string, unitIndex: number, startChapter: number, endChapter: number): string {
  const unitType = inferUnitType(text, startChapter);
  if (/副本|剧本|系统|任务|规则|玩家|通关/.test(text)) {
    return `规则场建立与通关压力`;
  }
  if (/线索|真相|谜|调查|推理|异常/.test(text)) {
    return `异常线索推动悬念升级`;
  }
  if (/战斗|攻击|追杀|危险|死亡|怪物|危机/.test(text)) {
    return `危机对抗推动角色选择`;
  }
  if (/关系|喜欢|婚约|退婚|误会|心动|告白/.test(text)) {
    return `关系变化制造情绪牵引`;
  }
  return `${unitType}单元 ${unitIndex}: 第${startChapter}-${endChapter}章`;
}

function isStrongForeshadowCandidate(text: string): boolean {
  const hasSetupSignal = /异常|隐藏|秘密|真相|谜|伏笔|线索|提示|规则|任务|身份|名字|钥匙|门|道具|奖励|惩罚|系统/.test(text);
  const hasPayoffSignal = /后来|之后|再次|终于|原来|竟然|没想到|确认|发现|证明|揭开|完成|通关|获得/.test(text);
  const hasNoiseSignal = /经验值|游戏币|装备：无|简介|进度更新|已完成|生命值|体能值|菜单|按钮/.test(text);
  return hasSetupSignal && !hasNoiseSignal && (hasPayoffSignal || text.length >= 45);
}

function buildStoryUnitEvidence(chapters: Chapter[]): string[] {
  return chapters.slice(0, 3).map(chapter => {
    const snippet = chapter.text.replace(/\s+/g, ' ').slice(0, 120);
    return `第${chapter.chapter_index}章《${chapter.title}》：${snippet}`;
  }).filter(Boolean);
}

function inferUnitType(text: string, startChapter: number): string {
  if (startChapter <= 3) {
    return '开局铺垫';
  }

  if (/试炼|考核|秘境|副本|遗迹|禁地/.test(text)) {
    return '副本探索';
  }

  if (/突破|晋级|升级|觉醒|传承/.test(text)) {
    return '升级突破';
  }

  if (/战斗|大战|对决|厮杀|出手/.test(text)) {
    return '高潮战斗';
  }

  if (/感情|暧昧|约定|牵手|心动/.test(text)) {
    return '感情发展';
  }

  if (/宗门|家族|势力|朝廷|门派/.test(text)) {
    return '势力斗争';
  }

  return '剧情推进';
}

function extractEmotionCurve(text: string): string[] {
  const emotions: string[] = [];

  for (const [emotion, pattern] of EMOTION_PATTERNS) {
    if (pattern.test(text)) {
      emotions.push(emotion);
    }
  }

  return emotions.length > 0 ? emotions : ['平稳'];
}

function inferRoleType(score: number): string {
  if (score >= 0.82) {
    return '主要角色';
  }

  if (score >= 0.65) {
    return '重要配角';
  }

  return '待定';
}

function collectNamesFromPattern(text: string, pattern: RegExp, nameMap: Map<string, number>, weight: number): void {
  pattern.lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const name = cleanCharacterName(match[1]);
    if (isLikelyCharacterName(name)) {
      nameMap.set(name, (nameMap.get(name) || 0) + weight);
    }
  }
}

function cleanCharacterName(name: string): string {
  let cleaned = name.trim().replace(NAME_SUFFIX_PATTERN, '');
  cleaned = cleaned.replace(/^(这个|那个|一名|一位|一个|此时|突然|只是|但是|然后)/, '');
  return cleaned;
}

function isLikelyCharacterName(name: string): boolean {
  if (name.length < 2 || name.length > 4) return false;
  if (COMMON_WORDS.has(name)) return false;
  if (/[说看问答道回的就]$/.test(name)) return false;
  if (/^(当然|普通|名称|备注|类型|封不觉[的说道看回就])/.test(name)) return false;
  return /^[\u4e00-\u9fa5]+$/.test(name);
}

function buildBeatSequence(unit: StoryUnit, chapters: Chapter[]): RhythmCard['beat_sequence'] {
  const beats: RhythmCard['beat_sequence'] = [
    {
      beat: 'setup',
      content: `第${unit.chapter_range[0]}章进入${unit.unit_type}`,
      function: '建立本单元情境和读者预期',
    },
  ];

  if (chapters.some(chapter => /任务|系统|规则|剧本|副本|玩家/.test(chapter.text))) {
    beats.push({ beat: 'rule', content: '出现任务、系统或剧本规则', function: '给读者建立解题边界' });
  }

  if (chapters.some(chapter => /线索|发现|真相|谜|推理|调查/.test(chapter.text))) {
    beats.push({ beat: 'reveal', content: '出现线索或推理推进', function: '推动悬疑问题向前' });
  }

  if (chapters.some(chapter => /危险|怪物|死亡|追杀|攻击|战斗|恐惧/.test(chapter.text))) {
    beats.push({ beat: 'pressure', content: '出现危险或对抗压力', function: '提高紧张感和阅读黏性' });
  }

  beats.push({
    beat: 'new_hook',
    content: unit.next_hook || `第${unit.chapter_range[1]}章留下后续期待`,
    function: '引导读者进入下一单元',
  });

  return beats;
}

function buildChapterHook(chapter: Chapter): string {
  const tail = chapter.text.replace(/\s+/g, ' ').slice(-140);
  return tail || chapter.title;
}

function extractSentences(text: string, pattern: RegExp, limit: number): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/[。！？!?]/)
    .map(sentence => sentence.trim())
    .filter(sentence => {
      pattern.lastIndex = 0;
      return sentence.length >= 8 && sentence.length <= 120 && pattern.test(sentence);
    })
    .slice(0, limit);
}

function extractFirstSentence(text: string, pattern: RegExp): string {
  return extractSentences(text, pattern, 1)[0] || '';
}

function analyzeSceneStructure(text: string, context: string): SceneSignal {
  const source = `${context}\n${text}`;
  [SCENE_ENTRY_PATTERN, SCENE_GOAL_PATTERN, SCENE_RULE_PATTERN, SCENE_RESOURCE_PATTERN, SCENE_STAKE_PATTERN, SCENE_EXIT_PATTERN].forEach(pattern => {
    pattern.lastIndex = 0;
  });

  const hasEntry = SCENE_ENTRY_PATTERN.test(source);
  const hasGoal = SCENE_GOAL_PATTERN.test(source);
  const hasRule = SCENE_RULE_PATTERN.test(source);
  const hasResource = SCENE_RESOURCE_PATTERN.test(source);
  const hasStake = SCENE_STAKE_PATTERN.test(source);
  const hasExit = SCENE_EXIT_PATTERN.test(source);
  const hasSpecificArena = SCENE_NAME_PATTERN.test(source);

  [SCENE_ENTRY_PATTERN, SCENE_GOAL_PATTERN, SCENE_RULE_PATTERN, SCENE_RESOURCE_PATTERN, SCENE_STAKE_PATTERN, SCENE_EXIT_PATTERN].forEach(pattern => {
    pattern.lastIndex = 0;
  });

  let score = 0;
  if (hasEntry) score += 1;
  if (hasGoal) score += 1;
  if (hasRule) score += 1.4;
  if (hasResource) score += 1;
  if (hasStake) score += 1.2;
  if (hasExit) score += 0.8;
  if (hasSpecificArena) score += 0.8;

  return { score, hasEntry, hasGoal, hasRule, hasResource, hasStake, hasExit, hasSpecificArena };
}

function extractMapName(title: string, text: string): string {
  const source = `${title} ${text.slice(0, 500)}`;
  const quoted = source.match(/[《「『“](.{2,18}?)[》」』”]/)?.[1];
  if (quoted && SCENE_NAME_PATTERN.test(quoted)) {
    return quoted;
  }

  const named = source.match(/(?:副本|剧本|任务|地图|场景|房间|案件|秘境|考核|宴会|学校|学院|公司|医院|宫廷|战场|赛场|现场|世界)[：:《「『“\s]*([\u4e00-\u9fa5A-Za-z0-9·]{2,18})/)?.[1];
  if (named && isUsefulSceneName(named)) return named;
  return title || '未命名副本/规则段';
}

function isUsefulSceneName(name: string): boolean {
  const normalized = name.trim();
  if (normalized.length < 2 || normalized.length > 20) return false;
  if (/^(简介|已完成|进度更新|你的|的时候|开始时|一开始|第\d+章|加入|产品|内容)$/.test(normalized)) return false;
  if (/^(的|了|和|与|并|或|及)/.test(normalized)) return false;
  return true;
}

function inferMapType(text: string, signal: SceneSignal): string {
  if (/剧本|玩家|通关|系统|任务|奖励/.test(text)) return '游戏剧本/副本';
  if (/案件|现场|证据|调查|破案|嫌疑/.test(text)) return '案件场';
  if (/宴会|婚约|退婚|家族|宫廷|朝堂|权力|身份|舆论/.test(text)) return '关系/权力场';
  if (/公司|合同|股份|项目|商业|签约|破产|投资/.test(text)) return '职场/商业局';
  if (/学校|学院|考试|考核|社团|老师|学生/.test(text)) return '校园/考核场';
  if (/秘境|遗迹|禁地|修炼|功法|丹药|法宝|宗门/.test(text)) return '修炼地图';
  if (/房间|门|钥匙|走廊|楼梯|大厅/.test(text)) return '封闭空间';
  if (signal.hasRule && signal.hasStake) return '规则压力场';
  if (/村|镇|城|岛|山|遗迹|禁地/.test(text)) return '区域地图';
  return '场景结构';
}

function inferMapFunctions(text: string, signal: SceneSignal): string[] {
  const functions: string[] = [];
  if (signal.hasRule) functions.push('建立行动规则或关系限制');
  if (signal.hasGoal) functions.push('给人物设置阶段目标');
  if (signal.hasStake) functions.push('制造代价和压力');
  if (signal.hasResource) functions.push('布置可利用资源');
  if (/线索|真相|谜|发现|推理/.test(text)) functions.push('承载悬疑信息');
  if (/奖励|技能|装备|称号|获得/.test(text)) functions.push('兑现成长奖励');
  if (/世界|组织|游戏|商城|论坛|现实|家族|公司|宗门|朝廷/.test(text)) functions.push('透露世界观或组织结构');
  return functions.length > 0 ? functions : ['承载阶段剧情推进'];
}

function inferInternalStructure(chapters: Chapter[]): string[] {
  return chapters.slice(0, 8).map(chapter => `第${chapter.chapter_index}章：${chapter.title}`);
}

function extractLikelyNames(text: string): string[] {
  const names = new Set<string>();
  Array.from(text.matchAll(DIALOGUE_NAME_PATTERN)).forEach(match => {
    const name = cleanCharacterName(match[1]);
    if (isLikelyCharacterName(name)) names.add(name);
  });
  Array.from(text.matchAll(ACTION_NAME_PATTERN)).forEach(match => {
    const name = cleanCharacterName(match[1]);
    if (isLikelyCharacterName(name)) names.add(name);
  });
  return Array.from(names);
}

function inferHookType(text: string): string {
  if (/死亡|怪物|危险|恐惧|追杀/.test(text)) return '危机';
  if (/线索|真相|谜|发现|推理/.test(text)) return '悬念';
  if (/任务|系统|奖励|剧本|规则/.test(text)) return '规则';
  if (/没想到|竟然|原来|突然/.test(text)) return '反转';
  return '续读';
}

function inferPayoff(text: string): string {
  if (/奖励|获得|升级|技能|称号/.test(text)) return '系统奖励或能力信息被兑现';
  if (/真相|线索|发现|推理/.test(text)) return '悬疑线索被推进或部分揭示';
  if (/通关|完成|解决|成功/.test(text)) return '阶段目标被完成';
  return '';
}

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) || []).length;
}
