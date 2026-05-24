// 剧情单元卡(最重要)
import type { AIPlatform } from './ai';

export type MechanismCategory =
  | '主角塑造'
  | '副本设计'
  | '悬念危机'
  | '世界观透露'
  | '情感互动'
  | '节奏爽点'
  | '伏笔回收';

export interface EvidenceItem {
  evidence_id: string;
  work_id: string;
  chapter_index: number;
  paragraph_index: number;
  category: 'character' | 'rule' | 'danger' | 'suspense' | 'worldbuilding' | 'dialogue' | 'hook' | 'item';
  text: string;
  tags: string[];
}

export interface NarrativeMechanism {
  mechanism_id: string;
  work_id: string;
  category: MechanismCategory;
  name: string;
  source_units: string[];
  evidence_ids: string[];
  observation: string;
  method_summary: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

export type AnalysisCandidateType = 'story_unit' | 'character' | 'foreshadow' | 'map_dungeon' | 'rhythm';

export interface AnalysisCandidate {
  candidate_id: string;
  work_id: string;
  candidate_type: AnalysisCandidateType;
  source_unit_id?: string;
  chapter_range?: [number, number];
  label: string;
  summary: string;
  payload: Record<string, unknown>;
  confidence: number;
  status: 'candidate' | 'used' | 'rejected';
  created_by: 'local' | 'ai';
}

export interface StoryUnit {
  unit_id: string;
  work_id: string;
  title: string;
  chapter_range: [number, number];
  unit_type: string; // 开局冲突/副本探索/升级突破等
  core_question: string;
  protagonist_goal: string;
  main_obstacle: string;
  reader_hook: string;
  emotional_curve: string[];
  start_state: string;
  end_state: string;
  payoff: string;
  next_hook: string;
  writing_takeaway: string;
  source_evidence: string[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

// 人物卡
export interface CharacterCard {
  character_id: string;
  work_id: string;
  name: string;
  role_type: string; // 主角/女主/男配/反派/导师等
  narrative_function: string[];
  first_appearance: string;
  initial_tags: string[];
  core_desire: string;
  external_goal: string;
  internal_lack: string;
  charm_points: string[];
  reader_empathy: string[];
  conflict_sources: string[];
  growth_path: Array<{
    unit_id: string;
    before: string;
    after: string;
    change_type: string;
  }>;
  relationship_tensions: Array<{
    target: string;
    relationship: string;
    tension: string;
    function: string;
  }>;
  writing_takeaway: string;
  source_evidence: string[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

// 节奏卡
export interface RhythmCard {
  rhythm_id: string;
  work_id: string;
  unit_id: string;
  beat_sequence: Array<{
    beat: string;
    content: string;
    function: string;
  }>;
  pacing_density: {
    conflict_count: number;
    reveal_count: number;
    payoff_count: number;
    new_hook_count: number;
  };
  chapter_hooks: Array<{
    chapter: number;
    hook_type: string;
    hook: string;
  }>;
  emotional_curve: string[];
  payoff: string;
  new_hook: string;
  writing_takeaway: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

// 伏笔卡
export interface ForeshadowCard {
  foreshadow_id: string;
  work_id: string;
  name: string;
  foreshadow_type: string;
  first_appearance: string;
  surface_info: string;
  hidden_info: string;
  planting_method: string;
  reinforcement_nodes: Array<{
    chapter: number;
    method: string;
    effect: string;
  }>;
  misdirection: string;
  payoff_node?: string;
  payoff_effect?: string;
  payoff_type?: string;
  status: 'active' | 'resolved' | 'pending';
  writing_takeaway: string;
  confidence: number;
  review_status: 'pending' | 'approved' | 'rejected';
}

// 地图/副本卡
export interface MapDungeonCard {
  map_id: string;
  work_id: string;
  name: string;
  map_type: string;
  entry_reason: string;
  entry_cost: string;
  new_rules: string[];
  core_resources: string[];
  core_threats: string[];
  key_characters: string[];
  plot_functions: string[];
  internal_structure: string[];
  exit_change: string;
  writing_takeaway: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

// 技法卡(最终沉淀物)
export interface TechniqueCard {
  technique_id: string;
  work_id: string;
  name: string;
  category: string;
  source_work: string;
  source_units: string[];
  source_mechanisms?: string[];
  pattern: string;
  why_it_works: string[];
  usable_when: string[];
  risks: string[];
  reuse_template: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}

// 章节数据
export interface Chapter {
  work_id?: string;
  chapter_index: number;
  title: string;
  text: string;
  word_count: number;
}

// 作品信息
export interface Work {
  work_id: string;
  title: string;
  genre: string[];
  source: string;
  analysis_goal: string;
  created_at: string;
  analyzed_at?: string;
  analysis_mode?: 'local' | 'ai' | 'hybrid';
  analysis_report?: string;
  analysis_version?: string;
}

// 分析配置
export interface AnalysisConfig {
  mode: 'local' | 'ai' | 'hybrid';
  force?: boolean;
  focus: {
    story_unit: boolean;
    character: boolean;
    rhythm: boolean;
    foreshadow: boolean;
    map_dungeon: boolean;
    technique: boolean;
  };
  ai_config?: {
    platform: AIPlatform;
    apiKey: string;
    baseUrl?: string;
    model: string;
  };
}

// 分析进度
export interface AnalysisProgress {
  status: 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error';
  current_step: string;
  percentage: number;
  completed_steps: string[];
  results?: AnalysisResult;
  error?: string;
}

// 分析结果
export interface AnalysisResult {
  story_units: StoryUnit[];
  character_cards: CharacterCard[];
  rhythm_cards: RhythmCard[];
  foreshadow_cards: ForeshadowCard[];
  map_dungeon_cards: MapDungeonCard[];
  technique_cards: TechniqueCard[];
  analysis_candidates?: AnalysisCandidate[];
}

// 审核任务
export interface ReviewTask {
  card_type: string;
  card_id: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
}
