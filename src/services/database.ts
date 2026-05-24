import Dexie, { type Table } from 'dexie';
import type {
  StoryUnit,
  CharacterCard,
  RhythmCard,
  ForeshadowCard,
  MapDungeonCard,
  TechniqueCard,
  EvidenceItem,
  NarrativeMechanism,
  AnalysisCandidate,
  Work,
  Chapter,
} from '../types/knowledge';

type StoredChapter = Chapter & { work_id: string };
type CardRecord = object;

export class KnowledgeDB extends Dexie {
  works!: Table<Work>;
  chapters!: Table<StoredChapter>;
  story_units!: Table<StoryUnit>;
  character_cards!: Table<CharacterCard>;
  rhythm_cards!: Table<RhythmCard>;
  foreshadow_cards!: Table<ForeshadowCard>;
  map_dungeon_cards!: Table<MapDungeonCard>;
  technique_cards!: Table<TechniqueCard>;
  evidence_items!: Table<EvidenceItem>;
  narrative_mechanisms!: Table<NarrativeMechanism>;
  analysis_candidates!: Table<AnalysisCandidate>;

  constructor() {
    super('novel-workbench-db');
    
    this.version(1).stores({
      works: 'work_id, title, created_at',
      chapters: '[work_id+chapter_index], work_id',
      story_units: 'unit_id, work_id, unit_type',
      character_cards: 'character_id, work_id, name, role_type',
      rhythm_cards: 'rhythm_id, unit_id, work_id',
      foreshadow_cards: 'foreshadow_id, work_id, status',
      map_dungeon_cards: 'map_id, work_id, map_type',
      technique_cards: 'technique_id, category',
    });

    this.version(2).stores({
      works: 'work_id, title, created_at',
      chapters: '[work_id+chapter_index], work_id',
      story_units: 'unit_id, work_id, unit_type',
      character_cards: 'character_id, work_id, name, role_type',
      rhythm_cards: 'rhythm_id, unit_id, work_id',
      foreshadow_cards: 'foreshadow_id, work_id, status',
      map_dungeon_cards: 'map_id, work_id, map_type',
      technique_cards: 'technique_id, work_id, category',
    });

    this.version(3).stores({
      works: 'work_id, title, created_at',
      chapters: '[work_id+chapter_index], work_id',
      story_units: 'unit_id, work_id, unit_type',
      character_cards: 'character_id, work_id, name, role_type',
      rhythm_cards: 'rhythm_id, unit_id, work_id',
      foreshadow_cards: 'foreshadow_id, work_id, status',
      map_dungeon_cards: 'map_id, work_id, map_type',
      technique_cards: 'technique_id, work_id, category',
      evidence_items: 'evidence_id, work_id, chapter_index, category',
      narrative_mechanisms: 'mechanism_id, work_id, category, status',
    });

    this.version(4).stores({
      works: 'work_id, title, created_at',
      chapters: '[work_id+chapter_index], work_id',
      story_units: 'unit_id, work_id, unit_type',
      character_cards: 'character_id, work_id, name, role_type',
      rhythm_cards: 'rhythm_id, unit_id, work_id',
      foreshadow_cards: 'foreshadow_id, work_id, status',
      map_dungeon_cards: 'map_id, work_id, map_type',
      technique_cards: 'technique_id, work_id, category',
      evidence_items: 'evidence_id, work_id, chapter_index, category',
      narrative_mechanisms: 'mechanism_id, work_id, category, status',
      analysis_candidates: 'candidate_id, work_id, candidate_type, status',
    });
  }
}

export const db = new KnowledgeDB();

// 便捷操作函数
export const dbOperations = {
  // 作品操作
  async saveWork(work: Work) {
    return await db.works.put(work);
  },
  
  async getWork(workId: string) {
    return await db.works.get(workId);
  },
  
  async getAllWorks() {
    return await db.works.toArray();
  },
  
  // 章节操作
  async saveChapters(workId: string, chapters: Chapter[]) {
    const chaptersWithWorkId = chapters.map(ch => ({
      ...ch,
      work_id: workId,
    }));
    return await db.chapters.bulkPut(chaptersWithWorkId);
  },
  
  async getChapters(workId: string) {
    return await db.chapters.where('work_id').equals(workId).toArray();
  },
  
  // 通用卡片操作
  async saveCard(table: string, card: CardRecord) {
    return await (db.table(table) as Table<CardRecord>).put(card);
  },
  
  async getCards(table: string, workId?: string) {
    if (workId) {
      return await (db.table(table) as Table<CardRecord>).where('work_id').equals(workId).toArray();
    }
    return await (db.table(table) as Table<CardRecord>).toArray();
  },
  
  async updateCard(table: string, id: string, data: Partial<CardRecord>) {
    return await (db.table(table) as Table<CardRecord>).update(id, data);
  },
  
  async deleteCard(table: string, id: string) {
    return await db.table(table).delete(id);
  },
  
  async bulkSaveCards(table: string, cards: CardRecord[]) {
    return await (db.table(table) as Table<CardRecord>).bulkPut(cards);
  },

  async bulkSaveStoryUnits(cards: StoryUnit[]) {
    return await db.story_units.bulkPut(cards);
  },

  async bulkSaveCharacterCards(cards: CharacterCard[]) {
    return await db.character_cards.bulkPut(cards);
  },

  async bulkSaveRhythmCards(cards: RhythmCard[]) {
    return await db.rhythm_cards.bulkPut(cards);
  },

  async bulkSaveForeshadowCards(cards: ForeshadowCard[]) {
    return await db.foreshadow_cards.bulkPut(cards);
  },

  async bulkSaveMapDungeonCards(cards: MapDungeonCard[]) {
    return await db.map_dungeon_cards.bulkPut(cards);
  },

  async bulkSaveTechniqueCards(cards: TechniqueCard[]) {
    return await db.technique_cards.bulkPut(cards);
  },

  async bulkSaveEvidenceItems(items: EvidenceItem[]) {
    return await db.evidence_items.bulkPut(items);
  },

  async bulkSaveNarrativeMechanisms(items: NarrativeMechanism[]) {
    return await db.narrative_mechanisms.bulkPut(items);
  },

  async bulkSaveAnalysisCandidates(items: AnalysisCandidate[]) {
    return await db.analysis_candidates.bulkPut(items);
  },
  
  // 按类型获取卡片
  async getStoryUnits(workId: string) {
    return await db.story_units.where('work_id').equals(workId).toArray();
  },
  
  async getCharacterCards(workId: string) {
    return await db.character_cards.where('work_id').equals(workId).toArray();
  },
  
  async getRhythmCards(workId: string) {
    return await db.rhythm_cards.where('work_id').equals(workId).toArray();
  },
  
  async getForeshadowCards(workId: string) {
    return await db.foreshadow_cards.where('work_id').equals(workId).toArray();
  },
  
  async getMapDungeonCards(workId: string) {
    return await db.map_dungeon_cards.where('work_id').equals(workId).toArray();
  },
  
  async getTechniqueCards(workId?: string) {
    if (workId) {
      return await db.technique_cards.where('work_id').equals(workId).toArray();
    }
    return await db.technique_cards.toArray();
  },

  async getEvidenceItems(workId: string) {
    return await db.evidence_items.where('work_id').equals(workId).toArray();
  },

  async getNarrativeMechanisms(workId: string) {
    return await db.narrative_mechanisms.where('work_id').equals(workId).toArray();
  },

  async getAnalysisCandidates(workId: string) {
    return await db.analysis_candidates.where('work_id').equals(workId).toArray();
  },

  async clearAllData() {
    await db.transaction('rw', [
      db.works,
      db.chapters,
      db.story_units,
      db.character_cards,
      db.rhythm_cards,
      db.foreshadow_cards,
      db.map_dungeon_cards,
      db.technique_cards,
      db.evidence_items,
      db.narrative_mechanisms,
      db.analysis_candidates,
    ], async () => {
      await Promise.all([
        db.works.clear(),
        db.chapters.clear(),
        db.story_units.clear(),
        db.character_cards.clear(),
        db.rhythm_cards.clear(),
        db.foreshadow_cards.clear(),
        db.map_dungeon_cards.clear(),
        db.technique_cards.clear(),
        db.evidence_items.clear(),
        db.narrative_mechanisms.clear(),
        db.analysis_candidates.clear(),
      ]);
    });
  },
};
