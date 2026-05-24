import { create } from 'zustand';
import type {
  Work,
  Chapter,
  StoryUnit,
  CharacterCard,
  RhythmCard,
  ForeshadowCard,
  MapDungeonCard,
  TechniqueCard,
  EvidenceItem,
  NarrativeMechanism,
  AnalysisCandidate,
  AnalysisConfig,
  AnalysisProgress,
} from '../types/knowledge';
import {
  segmentStoryUnits,
  extractCharacterCandidates,
  extractForeshadowCandidates,
  generateCharacterCards,
  generateRhythmCard,
  generateMapDungeonCards,
  generateTechniqueCards,
  buildEvidenceIndex,
  generateNarrativeMechanisms,
} from '../services/localAnalyzer';
import { aiService } from '../services/aiService';
import { parseAIJsonArray, parseAIJsonObject } from '../services/jsonUtils';
import {
  STORY_UNIT_ANALYSIS_PROMPT,
  CHARACTER_ANALYSIS_PROMPT,
  MAP_DUNGEON_ANALYSIS_PROMPT,
  FORESHADOW_ANALYSIS_PROMPT,
  SYSTEM_PROMPT,
} from '../services/aiPrompts';
import { dbOperations } from '../services/database';

type CardType = 'story_unit' | 'character' | 'rhythm' | 'foreshadow' | 'map_dungeon' | 'technique';
type ExtendedCardType = CardType | 'mechanism';
type SetState = (partial: Partial<KnowledgeState> | ((state: KnowledgeState) => Partial<KnowledgeState>)) => void;

interface KnowledgeState {
  currentWork: Work | null;
  chapters: Chapter[];
  selectedChapters: number[];
  storyUnits: StoryUnit[];
  characterCards: CharacterCard[];
  rhythmCards: RhythmCard[];
  foreshadowCards: ForeshadowCard[];
  mapDungeonCards: MapDungeonCard[];
  techniqueCards: TechniqueCard[];
  evidenceItems: EvidenceItem[];
  narrativeMechanisms: NarrativeMechanism[];
  analysisCandidates: AnalysisCandidate[];
  analysisProgress: AnalysisProgress;
  selectedCardType: string | null;
  selectedCardId: string | null;
  loadLatestWork: () => Promise<void>;
  createWorkFromFile: (fileName: string, chapters: Chapter[]) => Promise<Work>;
  loadWork: (workId: string) => Promise<void>;
  saveCurrentSnapshot: () => Promise<void>;
  clearPersistedData: () => Promise<void>;
  setCurrentWork: (work: Work) => void;
  setChapters: (chapters: Chapter[]) => void;
  setSelectedChapters: (chapters: number[]) => void;
  setStoryUnits: (units: StoryUnit[]) => void;
  setCharacterCards: (cards: CharacterCard[]) => void;
  setRhythmCards: (cards: RhythmCard[]) => void;
  setForeshadowCards: (cards: ForeshadowCard[]) => void;
  setMapDungeonCards: (cards: MapDungeonCard[]) => void;
  setTechniqueCards: (cards: TechniqueCard[]) => void;
  setEvidenceItems: (items: EvidenceItem[]) => void;
  setNarrativeMechanisms: (items: NarrativeMechanism[]) => void;
  setAnalysisCandidates: (items: AnalysisCandidate[]) => void;
  updateCard: (cardType: ExtendedCardType, cardId: string, data: Partial<Record<string, unknown>>) => void;
  deleteCard: (cardType: ExtendedCardType, cardId: string) => void;
  setAnalysisProgress: (progress: Partial<AnalysisProgress>) => void;
  startAnalysis: (config: AnalysisConfig) => Promise<void>;
  resetAnalysis: () => void;
  setSelectedCard: (cardType: string | null, cardId: string | null) => void;
  clearAll: () => void;
}

const idleProgress: AnalysisProgress = {
  status: 'idle',
  current_step: '',
  percentage: 0,
  completed_steps: [],
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  currentWork: null,
  chapters: [],
  selectedChapters: [],
  storyUnits: [],
  characterCards: [],
  rhythmCards: [],
  foreshadowCards: [],
  mapDungeonCards: [],
  techniqueCards: [],
  evidenceItems: [],
  narrativeMechanisms: [],
  analysisCandidates: [],
  analysisProgress: idleProgress,
  selectedCardType: null,
  selectedCardId: null,

  loadLatestWork: async () => {
    const works = await dbOperations.getAllWorks();
    const latestWork = works.sort((left, right) => right.created_at.localeCompare(left.created_at))[0];
    if (latestWork) {
      await get().loadWork(latestWork.work_id);
    }
  },

  createWorkFromFile: async (fileName, chapters) => {
    const title = fileName.replace(/\.[^.]+$/, '') || '未命名作品';
    const work: Work = {
      work_id: `work_${Date.now()}`,
      title,
      genre: [],
      source: fileName,
      analysis_goal: '网文拆书与写作方法沉淀',
      created_at: new Date().toISOString(),
    };
    const chaptersWithWorkId = chapters.map(chapter => ({ ...chapter, work_id: work.work_id }));

    await dbOperations.saveWork(work);
    await dbOperations.saveChapters(work.work_id, chaptersWithWorkId);
    set({
      currentWork: work,
      chapters: chaptersWithWorkId,
      storyUnits: [],
      characterCards: [],
      rhythmCards: [],
      foreshadowCards: [],
      mapDungeonCards: [],
      techniqueCards: [],
      evidenceItems: [],
      narrativeMechanisms: [],
      analysisCandidates: [],
      selectedCardType: null,
      selectedCardId: null,
      analysisProgress: idleProgress,
    });

    return work;
  },

  loadWork: async workId => {
    const work = await dbOperations.getWork(workId);
    if (!work) return;

    const [
      chapters,
      storyUnits,
      characterCards,
      rhythmCards,
      foreshadowCards,
      mapDungeonCards,
      techniqueCards,
      evidenceItems,
      narrativeMechanisms,
      analysisCandidates,
    ] = await Promise.all([
      dbOperations.getChapters(workId),
      dbOperations.getStoryUnits(workId),
      dbOperations.getCharacterCards(workId),
      dbOperations.getRhythmCards(workId),
      dbOperations.getForeshadowCards(workId),
      dbOperations.getMapDungeonCards(workId),
      dbOperations.getTechniqueCards(workId),
      dbOperations.getEvidenceItems(workId),
      dbOperations.getNarrativeMechanisms(workId),
      dbOperations.getAnalysisCandidates(workId),
    ]);

    set({
      currentWork: work,
      chapters,
      storyUnits,
      characterCards,
      rhythmCards,
      foreshadowCards,
      mapDungeonCards,
      techniqueCards,
      evidenceItems,
      narrativeMechanisms,
      analysisCandidates,
      analysisProgress: idleProgress,
      selectedCardType: null,
      selectedCardId: null,
    });
  },

  saveCurrentSnapshot: async () => {
    const state = get();
    if (!state.currentWork) return;

    await Promise.all([
      dbOperations.saveWork(state.currentWork),
      dbOperations.saveChapters(state.currentWork.work_id, state.chapters),
      dbOperations.bulkSaveStoryUnits(state.storyUnits),
      dbOperations.bulkSaveCharacterCards(state.characterCards),
      dbOperations.bulkSaveRhythmCards(state.rhythmCards),
      dbOperations.bulkSaveForeshadowCards(state.foreshadowCards),
      dbOperations.bulkSaveMapDungeonCards(state.mapDungeonCards),
      dbOperations.bulkSaveTechniqueCards(state.techniqueCards),
      dbOperations.bulkSaveEvidenceItems(state.evidenceItems),
      dbOperations.bulkSaveNarrativeMechanisms(state.narrativeMechanisms),
      dbOperations.bulkSaveAnalysisCandidates(state.analysisCandidates),
    ]);
  },

  clearPersistedData: async () => {
    await dbOperations.clearAllData();
    get().clearAll();
  },

  setCurrentWork: work => set({ currentWork: work }),
  setChapters: chapters => set({ chapters }),
  setSelectedChapters: chapters => set({ selectedChapters: chapters }),
  setStoryUnits: storyUnits => set({ storyUnits }),
  setCharacterCards: characterCards => set({ characterCards }),
  setRhythmCards: rhythmCards => set({ rhythmCards }),
  setForeshadowCards: foreshadowCards => set({ foreshadowCards }),
  setMapDungeonCards: mapDungeonCards => set({ mapDungeonCards }),
  setTechniqueCards: techniqueCards => set({ techniqueCards }),
  setEvidenceItems: evidenceItems => set({ evidenceItems }),
  setNarrativeMechanisms: narrativeMechanisms => set({ narrativeMechanisms }),
  setAnalysisCandidates: analysisCandidates => set({ analysisCandidates }),

  updateCard: (cardType, cardId, data) => {
    const state = get();
    let updatedCard: object | null = null;

    switch (cardType) {
      case 'story_unit':
        set({ storyUnits: state.storyUnits.map(card => {
          if (card.unit_id !== cardId) return card;
          const nextCard = { ...card, ...data } as StoryUnit;
          updatedCard = nextCard;
          return nextCard;
        }) });
        break;
      case 'character':
        set({ characterCards: state.characterCards.map(card => {
          if (card.character_id !== cardId) return card;
          const nextCard = { ...card, ...data } as CharacterCard;
          updatedCard = nextCard;
          return nextCard;
        }) });
        break;
      case 'rhythm':
        set({ rhythmCards: state.rhythmCards.map(card => {
          if (card.rhythm_id !== cardId) return card;
          const nextCard = { ...card, ...data } as RhythmCard;
          updatedCard = nextCard;
          return nextCard;
        }) });
        break;
      case 'foreshadow':
        set({ foreshadowCards: state.foreshadowCards.map(card => {
          if (card.foreshadow_id !== cardId) return card;
          const nextCard = { ...card, ...data } as ForeshadowCard;
          updatedCard = nextCard;
          return nextCard;
        }) });
        break;
      case 'map_dungeon':
        set({ mapDungeonCards: state.mapDungeonCards.map(card => {
          if (card.map_id !== cardId) return card;
          const nextCard = { ...card, ...data } as MapDungeonCard;
          updatedCard = nextCard;
          return nextCard;
        }) });
        break;
      case 'technique':
        set({ techniqueCards: state.techniqueCards.map(card => {
          if (card.technique_id !== cardId) return card;
          const nextCard = { ...card, ...data } as TechniqueCard;
          updatedCard = nextCard;
          return nextCard;
        }) });
        break;
      case 'mechanism':
        set({ narrativeMechanisms: state.narrativeMechanisms.map(card => {
          if (card.mechanism_id !== cardId) return card;
          const nextCard = { ...card, ...data } as NarrativeMechanism;
          updatedCard = nextCard;
          return nextCard;
        }) });
        break;
    }

    if (updatedCard) {
      const tableName = getCardTableName(cardType as ExtendedCardType);
      if (tableName) {
        void dbOperations.saveCard(tableName, updatedCard);
      }
    }
  },

  deleteCard: (cardType, cardId) => {
    const state = get();
    let changed = false;

    switch (cardType) {
      case 'story_unit':
        set({ storyUnits: state.storyUnits.filter(card => card.unit_id !== cardId) });
        changed = true;
        break;
      case 'character':
        set({ characterCards: state.characterCards.filter(card => card.character_id !== cardId) });
        changed = true;
        break;
      case 'rhythm':
        set({ rhythmCards: state.rhythmCards.filter(card => card.rhythm_id !== cardId) });
        changed = true;
        break;
      case 'foreshadow':
        set({ foreshadowCards: state.foreshadowCards.filter(card => card.foreshadow_id !== cardId) });
        changed = true;
        break;
      case 'map_dungeon':
        set({ mapDungeonCards: state.mapDungeonCards.filter(card => card.map_id !== cardId) });
        changed = true;
        break;
      case 'technique':
        set({ techniqueCards: state.techniqueCards.filter(card => card.technique_id !== cardId) });
        changed = true;
        break;
      case 'mechanism':
        set({ narrativeMechanisms: state.narrativeMechanisms.filter(card => card.mechanism_id !== cardId) });
        changed = true;
        break;
    }

    if (changed) {
      const tableName = getCardTableName(cardType as ExtendedCardType);
      if (tableName) {
        void dbOperations.deleteCard(tableName, cardId);
      }
    }
  },

  setAnalysisProgress: progress =>
    set(state => ({
      analysisProgress: { ...state.analysisProgress, ...progress },
    })),

  startAnalysis: async config => {
    const { chapters } = get();
    const workId = get().currentWork?.work_id || 'work_001';

    if (chapters.length === 0) {
      set({
        analysisProgress: {
          status: 'error',
          current_step: 'No chapter data',
          percentage: 0,
          completed_steps: [],
          error: 'Please import a novel file first.',
        },
      });
      return;
    }

    const isAIEnabled = config.mode === 'ai' || config.mode === 'hybrid';
    if (isAIEnabled && get().currentWork?.analysis_report && !config.force) {
      set({
        analysisProgress: {
          status: 'error',
          current_step: 'Analysis already exists',
          percentage: 0,
          completed_steps: [],
          error: '当前作品已有拆书报告。若确实需要重跑 AI，请在确认弹窗中选择继续。',
        },
      });
      return;
    }

    const completedSteps: string[] = [];
    const candidateLayer: AnalysisCandidate[] = [];

    try {
      setProgress(set, 'Building evidence index...', 3);
      await sleep(120);
      const evidenceItems = buildEvidenceIndex(chapters, workId);
      set({ evidenceItems });
      completedSteps.push('Evidence indexing');

      setProgress(set, 'Detecting story units...', 5);
      await sleep(200);

      let units = get().storyUnits;
      if (config.mode !== 'ai' || units.length === 0) {
        units = withWorkId(segmentStoryUnits(chapters), workId);
        set({ storyUnits: units });
      }
      candidateLayer.push(...buildStoryUnitCandidates(units, workId));
      completedSteps.push('Story unit detection');

      if (config.focus.story_unit && isAIEnabled && config.ai_config && units.length > 0) {
        aiService.setConfig(config.ai_config);
        const analyzedUnits: StoryUnit[] = [];

        for (let index = 0; index < units.length; index++) {
          const unit = units[index];
          setProgress(set, `AI analyzing story unit (${index + 1}/${units.length})...`, 15 + Math.round(index / units.length * 35), completedSteps);

          const unitText = chapters
            .filter(chapter => chapter.chapter_index >= unit.chapter_range[0] && chapter.chapter_index <= unit.chapter_range[1])
            .map(chapter => chapter.text)
            .join('\n')
            .slice(0, 8000);

          try {
            const prompt = STORY_UNIT_ANALYSIS_PROMPT
              .replace('{{story_unit_text}}', unitText)
              .replace('{{start_chapter}}', String(unit.chapter_range[0]))
              .replace('{{end_chapter}}', String(unit.chapter_range[1]))
              .replace('{{inferred_type}}', unit.unit_type);

            const response = await aiService.analyze({
              platform: config.ai_config.platform,
              prompt,
              systemPrompt: SYSTEM_PROMPT,
              temperature: 0.7,
              maxTokens: 2000,
            });

            const jsonData = parseAIJsonObject<AIAnalysisResponse | Partial<StoryUnit>>(response.content);
            const safeData = jsonData ? mapStoryUnitAIResult(jsonData) : null;
            analyzedUnits.push(safeData && hasGroundedEvidence(safeData.source_evidence, unitText) ? {
              ...unit,
              ...safeData,
              title: buildStoryUnitTitle(unit, safeData),
              confidence: Math.max(unit.confidence, safeData.confidence || 0.7),
            } : unit);
          } catch (error) {
            console.warn('[AI] Story unit analysis failed:', error);
            analyzedUnits.push(unit);
          }
        }

        set({ storyUnits: analyzedUnits });
        units = analyzedUnits;
        completedSteps.push('AI story analysis');
      }

      if (config.focus.character) {
        setProgress(set, isAIEnabled ? 'Extracting character candidates...' : 'Skipping character cards without AI...', isAIEnabled ? 55 : 30, completedSteps);
        await sleep(200);

        const characterCandidates = extractCharacterCandidates(chapters);
        const characterCards = generateCharacterCards(characterCandidates, workId);
        candidateLayer.push(...buildCharacterCandidates(characterCandidates, workId));

        if (!isAIEnabled || !config.ai_config) {
          set({ characterCards: [] });
          completedSteps.push('Character cards skipped (AI required)');
        } else if (characterCards.length > 0) {
          aiService.setConfig(config.ai_config);
          const analyzedCharacters: CharacterCard[] = [];
          const analysisCount = Math.min(8, characterCards.length);

          for (let index = 0; index < analysisCount; index++) {
            setProgress(set, `AI analyzing character (${index + 1}/${analysisCount})...`, 60 + Math.round(index / analysisCount * 10), completedSteps);
            const candidate = characterCards[index];
            const characterContext = buildCharacterContext(chapters, candidate.name);

            try {
              const prompt = CHARACTER_ANALYSIS_PROMPT
                .replace('{{character_name}}', candidate.name)
                .replace('{{character_text}}', characterContext)
                .replace('{{frequency}}', String(characterCandidates[index]?.frequency || 0));

              const response = await aiService.analyze({
                platform: config.ai_config.platform,
                prompt,
                systemPrompt: SYSTEM_PROMPT,
                temperature: 0.7,
                maxTokens: 1500,
              });

              const jsonData = parseAIJsonObject<AIAnalysisResponse | Partial<CharacterCard>>(response.content);
              const safeData = jsonData ? mapCharacterAIResult(jsonData) : null;
              if (safeData && hasGroundedEvidence(safeData.source_evidence, characterContext) && safeData.role_type !== '待定') {
                analyzedCharacters.push({
                  ...candidate,
                  ...safeData,
                  name: candidate.name,
                  confidence: Math.max(candidate.confidence, safeData.confidence || 0.65),
                  status: 'pending',
                });
              }
            } catch (error) {
              console.warn('[AI] Character analysis failed:', error);
            }
          }

          set({ characterCards: analyzedCharacters });
          completedSteps.push('AI character analysis');
        } else {
          set({ characterCards: [] });
          completedSteps.push('No character candidates found');
        }
      }

      if (config.focus.foreshadow) {
        setProgress(set, isAIEnabled ? 'AI filtering high-value clues...' : 'Skipping clue cards without AI...', isAIEnabled ? 72 : 50, completedSteps);
        await sleep(200);

        const localCandidates = withWorkId(units.flatMap(unit => extractForeshadowCandidates(unit, chapters)), workId);
        candidateLayer.push(...buildForeshadowCandidates(localCandidates, workId));

        if (!isAIEnabled || !config.ai_config) {
          set({ foreshadowCards: [] });
          completedSteps.push('Clue cards skipped (AI required)');
        } else {
          aiService.setConfig(config.ai_config);
          const verifiedForeshadows: ForeshadowCard[] = [];
          const analysisUnits = units
            .filter(unit => localCandidates.some(candidate => candidate.foreshadow_id.startsWith(`fs_${unit.unit_id}_`)))
            .slice(0, 8);

          for (let index = 0; index < analysisUnits.length; index++) {
            const unit = analysisUnits[index];
            setProgress(set, `AI filtering clues (${index + 1}/${analysisUnits.length})...`, 72 + Math.round(index / Math.max(analysisUnits.length, 1) * 8), completedSteps);
            const unitText = chapters
              .filter(chapter => chapter.chapter_index >= unit.chapter_range[0] && chapter.chapter_index <= unit.chapter_range[1])
              .map(chapter => `第${chapter.chapter_index}章《${chapter.title}》\n${chapter.text}`)
              .join('\n\n')
              .slice(0, 9000);

            try {
              const response = await aiService.analyze({
                platform: config.ai_config.platform,
                prompt: FORESHADOW_ANALYSIS_PROMPT.replace('{{foreshadow_text}}', unitText),
                systemPrompt: SYSTEM_PROMPT,
                temperature: 0.4,
                maxTokens: 1600,
              });

              const objectData = parseAIJsonObject<AIAnalysisResponse>(response.content);
              const jsonData = objectData?.items || parseAIJsonArray<Partial<ForeshadowCard>>(response.content) || [];
              jsonData.slice(0, 3).forEach(item => {
                const safeData = mapForeshadowAIResult(item);
                if (!safeData || !isUsefulForeshadowAIResult(safeData, unitText)) return;

                verifiedForeshadows.push({
                  foreshadow_id: `fs_${unit.unit_id}_ai_${verifiedForeshadows.length + 1}`,
                  work_id: workId,
                  name: safeData.name || `${safeData.foreshadow_type || '线索'}：${safeData.surface_info?.slice(0, 12) || '待命名'}`,
                  foreshadow_type: safeData.foreshadow_type || '线索候选',
                  first_appearance: `chapter_${unit.chapter_range[0]}`,
                  surface_info: safeData.surface_info || '',
                  hidden_info: safeData.hidden_info || '',
                  planting_method: safeData.planting_method || '',
                  reinforcement_nodes: safeData.reinforcement_nodes || [],
                  misdirection: safeData.misdirection || '',
                  payoff_node: safeData.payoff_node,
                  payoff_effect: safeData.payoff_effect,
                  payoff_type: safeData.payoff_type,
                  status: safeData.status || 'pending',
                  writing_takeaway: safeData.writing_takeaway || '',
                  confidence: Math.max(0.62, safeData.confidence || 0.62),
                  review_status: 'pending',
                });
              });
            } catch (error) {
              console.warn('[AI] Foreshadowing analysis failed:', error);
            }
          }

          set({ foreshadowCards: verifiedForeshadows });
          completedSteps.push('AI clue filtering');
        }
      }

      if (config.focus.rhythm) {
        setProgress(set, 'Generating rhythm cards...', isAIEnabled ? 82 : 65, completedSteps);
        await sleep(200);

        const rhythmCards = units.map(unit => generateRhythmCard(unit, chapters, workId));
        candidateLayer.push(...buildRhythmCandidates(rhythmCards, workId));
        set({ rhythmCards });
        completedSteps.push('Rhythm card generation');
      }

      if (config.focus.map_dungeon) {
        setProgress(set, 'Detecting map/dungeon units...', 90, completedSteps);
        await sleep(150);

        let mapDungeonCards = generateMapDungeonCards(units, chapters, workId);
        candidateLayer.push(...buildMapDungeonCandidates(mapDungeonCards, workId));

        if (isAIEnabled && config.ai_config && mapDungeonCards.length > 0) {
          aiService.setConfig(config.ai_config);
          const verifiedCards: MapDungeonCard[] = [];
          const analysisCount = Math.min(8, mapDungeonCards.length);

          for (let index = 0; index < analysisCount; index++) {
            const localCard = mapDungeonCards[index];
            const sourceUnit = units.find(unit => localCard.map_id === `map_${unit.unit_id}`);
            if (!sourceUnit) continue;

            setProgress(set, `AI verifying scene structure (${index + 1}/${analysisCount})...`, 86 + Math.round(index / analysisCount * 4), completedSteps);

            const mapText = chapters
              .filter(chapter => chapter.chapter_index >= sourceUnit.chapter_range[0] && chapter.chapter_index <= sourceUnit.chapter_range[1])
              .map(chapter => `第${chapter.chapter_index}章《${chapter.title}》\n${chapter.text}`)
              .join('\n\n')
              .slice(0, 9000);

            try {
              const response = await aiService.analyze({
                platform: config.ai_config.platform,
                prompt: MAP_DUNGEON_ANALYSIS_PROMPT.replace('{{map_text}}', mapText),
                systemPrompt: SYSTEM_PROMPT,
                temperature: 0.4,
                maxTokens: 1800,
              });

              const jsonData = parseAIJsonObject<AIAnalysisResponse | (Partial<MapDungeonCard> & { is_map_dungeon?: boolean })>(response.content);
              const safeData = jsonData ? mapMapDungeonAIResult(jsonData) : null;
              if (safeData) {
                verifiedCards.push({
                  ...localCard,
                  ...safeData,
                  map_id: localCard.map_id,
                  work_id: workId,
                  confidence: Math.max(localCard.confidence, safeData.confidence || 0.68),
                  status: 'pending',
                });
              }
            } catch (error) {
              console.warn('[AI] Scene structure verification failed:', error);
            }
          }

          mapDungeonCards = [
            ...verifiedCards,
            ...mapDungeonCards.slice(analysisCount).filter(card => card.confidence >= 0.72),
          ];
          completedSteps.push('AI scene structure verification');
        }

        set({ mapDungeonCards });
        completedSteps.push('Map/dungeon detection');
      }

      if (config.focus.technique) {
        setProgress(set, 'Analyzing narrative mechanisms...', 90, completedSteps);
        await sleep(150);

        const narrativeMechanisms = generateNarrativeMechanisms({
          workId,
          evidenceIndex: get().evidenceItems,
          storyUnits: get().storyUnits,
          characterCards: get().characterCards,
          rhythmCards: get().rhythmCards,
          foreshadowCards: get().foreshadowCards,
        });
        set({ narrativeMechanisms });
        completedSteps.push('Narrative mechanism analysis');

        setProgress(set, 'Extracting reusable writing techniques...', 94, completedSteps);
        await sleep(150);

        const techniqueCards = generateTechniqueCards({
          workId,
          workTitle: get().currentWork?.title || '当前作品',
          narrativeMechanisms: get().narrativeMechanisms,
          storyUnits: get().storyUnits,
          characterCards: get().characterCards,
          rhythmCards: get().rhythmCards,
          foreshadowCards: get().foreshadowCards,
        });
        set({ techniqueCards });
        completedSteps.push('Technique extraction');
      }

      set({ analysisCandidates: candidateLayer });
      completedSteps.push('Candidate layer saved');

      const snapshotState = get();
      const analyzedWork = snapshotState.currentWork ? {
        ...snapshotState.currentWork,
        analyzed_at: new Date().toISOString(),
        analysis_mode: config.mode,
        analysis_version: '2026-05-24-grounded-v1',
        analysis_report: buildAnalysisReport({
          work: snapshotState.currentWork,
          chapters: snapshotState.chapters,
          storyUnits: snapshotState.storyUnits,
          characterCards: snapshotState.characterCards,
          rhythmCards: snapshotState.rhythmCards,
          foreshadowCards: snapshotState.foreshadowCards,
          mapDungeonCards: snapshotState.mapDungeonCards,
          techniqueCards: snapshotState.techniqueCards,
          mode: config.mode,
        }),
      } : null;

      set({
        currentWork: analyzedWork || snapshotState.currentWork,
        analysisProgress: {
          status: 'complete',
          current_step: 'Analysis complete. Report and cards saved locally.',
          percentage: 100,
          completed_steps: completedSteps,
        },
      });
      await get().saveCurrentSnapshot();
    } catch (error) {
      set({
        analysisProgress: {
          status: 'error',
          current_step: 'Analysis failed',
          percentage: get().analysisProgress.percentage,
          completed_steps: completedSteps,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  },

  resetAnalysis: () => set({ analysisProgress: idleProgress }),

  setSelectedCard: (cardType, cardId) =>
    set({ selectedCardType: cardType, selectedCardId: cardId }),

  clearAll: () =>
    set({
      currentWork: null,
      chapters: [],
      selectedChapters: [],
      storyUnits: [],
      characterCards: [],
      rhythmCards: [],
      foreshadowCards: [],
      mapDungeonCards: [],
      techniqueCards: [],
      evidenceItems: [],
      narrativeMechanisms: [],
      analysisCandidates: [],
      analysisProgress: idleProgress,
      selectedCardType: null,
      selectedCardId: null,
    }),
}));

function setProgress(
  set: SetState,
  currentStep: string,
  percentage: number,
  completedSteps: string[] = [],
) {
  set({
    analysisProgress: {
      status: 'analyzing',
      current_step: currentStep,
      percentage,
      completed_steps: completedSteps,
    },
  });
}

function withWorkId<T extends { work_id?: string }>(cards: T[], workId: string): Array<T & { work_id: string }> {
  return cards.map(card => ({ ...card, work_id: workId }));
}

function buildStoryUnitCandidates(units: StoryUnit[], workId: string): AnalysisCandidate[] {
  return units.map(unit => ({
    candidate_id: `cand_${workId}_story_${unit.unit_id}`,
    work_id: workId,
    candidate_type: 'story_unit',
    source_unit_id: unit.unit_id,
    chapter_range: unit.chapter_range,
    label: unit.title,
    summary: unit.core_question || unit.reader_hook || unit.unit_type,
    payload: unit as unknown as Record<string, unknown>,
    confidence: unit.confidence,
    status: 'candidate',
    created_by: 'local',
  }));
}

function buildCharacterCandidates(
  candidates: Array<{ name: string; frequency: number; score: number }>,
  workId: string,
): AnalysisCandidate[] {
  return candidates.slice(0, 24).map((candidate, index) => ({
    candidate_id: `cand_${workId}_character_${index + 1}`,
    work_id: workId,
    candidate_type: 'character',
    label: candidate.name,
    summary: `本地人物名候选，出现权重 ${candidate.frequency}`,
    payload: candidate as unknown as Record<string, unknown>,
    confidence: candidate.score,
    status: 'candidate',
    created_by: 'local',
  }));
}

function buildForeshadowCandidates(cards: ForeshadowCard[], workId: string): AnalysisCandidate[] {
  return cards.map(card => ({
    candidate_id: `cand_${workId}_foreshadow_${card.foreshadow_id}`,
    work_id: workId,
    candidate_type: 'foreshadow',
    label: card.name,
    summary: card.surface_info,
    payload: card as unknown as Record<string, unknown>,
    confidence: card.confidence,
    status: 'candidate',
    created_by: 'local',
  }));
}

function buildRhythmCandidates(cards: RhythmCard[], workId: string): AnalysisCandidate[] {
  return cards.map(card => ({
    candidate_id: `cand_${workId}_rhythm_${card.rhythm_id}`,
    work_id: workId,
    candidate_type: 'rhythm',
    source_unit_id: card.unit_id,
    label: `节奏候选 ${card.unit_id}`,
    summary: `冲突 ${card.pacing_density.conflict_count} / 揭示 ${card.pacing_density.reveal_count} / 兑现 ${card.pacing_density.payoff_count} / 新钩子 ${card.pacing_density.new_hook_count}`,
    payload: card as unknown as Record<string, unknown>,
    confidence: card.confidence,
    status: 'candidate',
    created_by: 'local',
  }));
}

function buildMapDungeonCandidates(cards: MapDungeonCard[], workId: string): AnalysisCandidate[] {
  return cards.map(card => ({
    candidate_id: `cand_${workId}_map_${card.map_id}`,
    work_id: workId,
    candidate_type: 'map_dungeon',
    label: card.name,
    summary: card.writing_takeaway || card.map_type,
    payload: card as unknown as Record<string, unknown>,
    confidence: card.confidence,
    status: 'candidate',
    created_by: 'local',
  }));
}

function getCardTableName(cardType: ExtendedCardType): string {
  const tableNames: Record<ExtendedCardType, string> = {
    story_unit: 'story_units',
    character: 'character_cards',
    rhythm: 'rhythm_cards',
    foreshadow: 'foreshadow_cards',
    map_dungeon: 'map_dungeon_cards',
    technique: 'technique_cards',
    mechanism: 'narrative_mechanisms',
  };

  return tableNames[cardType];
}

interface AIEvidence {
  quote?: string;
  supports?: string;
  location_hint?: string;
}

interface AIStorageDecision {
  should_store?: boolean;
  value_score?: number;
  reason?: string;
  risk_flags?: string[];
}

interface AIAnalysisItem extends Record<string, unknown> {
  name?: string;
  type?: string;
  surface_summary?: string;
  author_operation?: string;
  reader_effect?: string;
  evidence?: AIEvidence[];
  reuse_method?: string;
  failure_modes?: string[];
  storage_decision?: AIStorageDecision;
  confidence?: number;
}

interface AIAnalysisResponse extends Record<string, unknown> {
  valid?: boolean;
  module?: string;
  items?: AIAnalysisItem[];
  invalid_reason?: string | null;
}

function isUnifiedAIResponse(data: unknown): data is AIAnalysisResponse {
  return Boolean(data && typeof data === 'object' && Array.isArray((data as AIAnalysisResponse).items));
}

function getFirstStorableItem(data: AIAnalysisResponse): AIAnalysisItem | null {
  if (data.valid === false) return null;
  return data.items?.find(item => item.storage_decision?.should_store !== false && (item.confidence ?? 0) >= 0.55) || data.items?.[0] || null;
}

function evidenceQuotes(evidence: unknown): string[] {
  if (!Array.isArray(evidence)) return [];
  return evidence
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return String((item as AIEvidence).quote || '');
      return '';
    })
    .filter(Boolean);
}

function mapStoryUnitAIResult(data: AIAnalysisResponse | Partial<StoryUnit>): Partial<StoryUnit> | null {
  if (isUnifiedAIResponse(data)) {
    const item = getFirstStorableItem(data);
    if (!item) return null;
    const structure = (item.structure_breakdown || {}) as Record<string, string>;
    const driveMechanisms = Array.isArray(item.drive_mechanisms) ? item.drive_mechanisms as Array<Record<string, unknown>> : [];
    const quotes = [
      ...evidenceQuotes(item.evidence),
      ...driveMechanisms.flatMap(mechanism => evidenceQuotes(mechanism.evidence)),
    ];

    return sanitizeStoryUnitAIResult({
      title: item.name,
      unit_type: String(item.creative_function || item.type || ''),
      core_question: item.reader_effect || item.surface_summary || '',
      protagonist_goal: structure.setup || '',
      main_obstacle: structure.pressure || '',
      reader_hook: item.reader_effect || '',
      start_state: structure.setup || '',
      end_state: structure.payoff_or_hook || '',
      payoff: structure.payoff_or_hook || '',
      next_hook: structure.turning_point || '',
      writing_takeaway: item.reuse_method || item.author_operation || '',
      source_evidence: quotes,
      confidence: item.confidence,
    });
  }

  return sanitizeStoryUnitAIResult(data);
}

function mapCharacterAIResult(data: AIAnalysisResponse | Partial<CharacterCard>): Partial<CharacterCard> | null {
  if (isUnifiedAIResponse(data)) {
    const item = getFirstStorableItem(data);
    if (!item) return null;
    const craftOperations = Array.isArray(item.craft_operations) ? item.craft_operations as Array<Record<string, unknown>> : [];
    const relationship = (item.relationship_tension || {}) as Record<string, unknown>;
    const quotes = [
      ...evidenceQuotes(item.evidence),
      ...craftOperations.flatMap(operation => evidenceQuotes(operation.evidence)),
      ...evidenceQuotes(relationship.evidence),
    ];

    return sanitizeCharacterAIResult({
      role_type: String(item.role_in_scene || item.type || '待定'),
      narrative_function: Array.isArray(item.served_effects) ? item.served_effects.map(String) : [item.reader_effect || ''].filter(Boolean) as string[],
      core_desire: item.author_operation || '',
      external_goal: item.surface_summary || '',
      internal_lack: '',
      charm_points: [item.reader_effect || ''].filter(Boolean) as string[],
      reader_empathy: [],
      conflict_sources: Array.isArray(item.failure_modes) ? item.failure_modes : [],
      relationship_tensions: relationship.target ? [{
        target: String(relationship.target || ''),
        relationship: String(relationship.tension_type || ''),
        tension: String(relationship.author_operation || ''),
        function: item.reader_effect || '',
      }] : [],
      writing_takeaway: item.reuse_method || item.author_operation || '',
      source_evidence: quotes,
      confidence: item.confidence,
    });
  }

  return sanitizeCharacterAIResult(data);
}

function mapForeshadowAIResult(item: AIAnalysisItem | Partial<ForeshadowCard>): Partial<ForeshadowCard> | null {
  if ('surface_info' in item || 'foreshadow_type' in item) {
    return sanitizeForeshadowAIResult(item as Partial<ForeshadowCard>);
  }

  const aiItem = item as AIAnalysisItem;
  return sanitizeForeshadowAIResult({
    name: aiItem.name,
    foreshadow_type: String(aiItem.type || 'suspected'),
    surface_info: aiItem.surface_summary || evidenceQuotes(aiItem.evidence)[0] || '',
    hidden_info: String(aiItem.later_value || aiItem.reader_state || ''),
    planting_method: aiItem.author_operation || '',
    misdirection: aiItem.reader_effect || '',
    payoff_node: Array.isArray(aiItem.payoff_evidence) && aiItem.payoff_evidence.length > 0 ? '有回收证据' : '',
    writing_takeaway: aiItem.reuse_method || String(aiItem.craft_value || ''),
    confidence: aiItem.confidence,
  });
}

function mapMapDungeonAIResult(data: AIAnalysisResponse | (Partial<MapDungeonCard> & { is_map_dungeon?: boolean })): Partial<MapDungeonCard> | null {
  if (isUnifiedAIResponse(data)) {
    const item = getFirstStorableItem(data);
    if (!item) return null;
    const rules = Array.isArray(item.rules_or_constraints) ? item.rules_or_constraints as Array<Record<string, unknown>> : [];
    const pressures = Array.isArray(item.pressure_sources) ? item.pressure_sources as Array<Record<string, unknown>> : [];
    const info = (item.information_design || {}) as Record<string, unknown>;
    const roles = Array.isArray(item.role_positions) ? item.role_positions as Array<Record<string, unknown>> : [];

    return sanitizeMapDungeonAIResult({
      name: item.name,
      map_type: String(item.type || 'scene_container'),
      entry_reason: item.surface_summary || '',
      entry_cost: pressures.map(source => String(source.source || '')).filter(Boolean).join('；'),
      new_rules: rules.map(rule => String(rule.rule || '')).filter(Boolean),
      core_resources: [info.known_to_reader, info.hidden_or_uncertain].map(value => String(value || '')).filter(Boolean),
      core_threats: pressures.map(source => String(source.author_operation || source.reader_effect || '')).filter(Boolean),
      key_characters: roles.map(role => String(role.role || '')).filter(Boolean),
      plot_functions: [item.design_function, item.reader_effect].map(value => String(value || '')).filter(Boolean),
      internal_structure: [item.author_operation, item.reuse_method].map(value => String(value || '')).filter(Boolean),
      exit_change: item.reader_effect || '',
      writing_takeaway: item.reuse_method || item.author_operation || '',
      confidence: item.confidence,
    });
  }

  if (data.is_map_dungeon === false) return null;
  return sanitizeMapDungeonAIResult(data);
}

function sanitizeStoryUnitAIResult(data: Partial<StoryUnit>): Partial<StoryUnit> {
  const safeData = { ...data };
  delete safeData.unit_id;
  delete safeData.work_id;
  delete safeData.chapter_range;
  delete safeData.status;

  return safeData;
}

function sanitizeCharacterAIResult(data: Partial<CharacterCard>): Partial<CharacterCard> {
  const safeData = { ...data };
  delete safeData.character_id;
  delete safeData.work_id;
  delete safeData.name;
  delete safeData.first_appearance;
  delete safeData.status;

  return safeData;
}

function sanitizeForeshadowAIResult(data: Partial<ForeshadowCard>): Partial<ForeshadowCard> | null {
  if (!data || typeof data !== 'object') return null;

  const safeData = { ...data };
  delete safeData.foreshadow_id;
  delete safeData.work_id;
  delete safeData.review_status;

  if (safeData.reinforcement_nodes !== undefined && !Array.isArray(safeData.reinforcement_nodes)) {
    delete safeData.reinforcement_nodes;
  }

  return safeData;
}

function isUsefulForeshadowAIResult(data: Partial<ForeshadowCard>, sourceText: string): boolean {
  const name = (data.name || '').trim();
  const surfaceInfo = (data.surface_info || '').trim();
  const takeaway = (data.writing_takeaway || '').trim();
  const confidence = data.confidence || 0;

  if (confidence < 0.58) return false;
  if (name.length < 2 || /^(门|玩家|装备|名字|异常|隐藏|恐惧|死亡)$/.test(name)) return false;
  if (surfaceInfo.length < 8 || takeaway.length < 8) return false;

  const normalizedSource = normalizeEvidenceText(sourceText);
  const normalizedSurface = normalizeEvidenceText(surfaceInfo);
  return normalizedSurface.length < 10 || normalizedSource.includes(normalizedSurface.slice(0, Math.min(18, normalizedSurface.length)));
}

function sanitizeMapDungeonAIResult(data: Partial<MapDungeonCard> & { is_map_dungeon?: boolean }): Partial<MapDungeonCard> {
  const safeData = { ...data };
  delete safeData.is_map_dungeon;
  delete safeData.map_id;
  delete safeData.work_id;
  delete safeData.status;

  const arrayFields: Array<keyof Pick<MapDungeonCard, 'new_rules' | 'core_resources' | 'core_threats' | 'key_characters' | 'plot_functions' | 'internal_structure'>> = [
    'new_rules',
    'core_resources',
    'core_threats',
    'key_characters',
    'plot_functions',
    'internal_structure',
  ];

  for (const field of arrayFields) {
    const value = safeData[field];
    if (value !== undefined && !Array.isArray(value)) {
      delete safeData[field];
    }
  }

  return safeData;
}

function buildStoryUnitTitle(unit: StoryUnit, data: Partial<StoryUnit>): string {
  const aiTitle = (data.title || '').trim();
  if (isUsefulStoryUnitTitle(aiTitle)) return aiTitle.slice(0, 24);

  const hook = (data.reader_hook || data.core_question || data.protagonist_goal || unit.reader_hook || unit.core_question || '').trim();
  if (hook) {
    return hook.replace(/[。！？!?].*$/, '').slice(0, 24);
  }

  return unit.title;
}

function isUsefulStoryUnitTitle(title: string): boolean {
  if (title.length < 4 || title.length > 32) return false;
  if (/^剧情单元|^第\d+|章$|暂无|待补充/.test(title)) return false;
  return true;
}

function buildCharacterContext(chapters: Chapter[], characterName: string): string {
  const snippets: string[] = [];

  for (const chapter of chapters) {
    const index = chapter.text.indexOf(characterName);
    if (index < 0) continue;

    const start = Math.max(0, index - 450);
    const end = Math.min(chapter.text.length, index + characterName.length + 450);
    snippets.push(`第${chapter.chapter_index}章《${chapter.title}》\n${chapter.text.slice(start, end)}`);

    if (snippets.join('\n\n').length >= 5000) {
      break;
    }
  }

  return snippets.join('\n\n').slice(0, 5000) || chapters.slice(0, 3).map(chapter => chapter.text).join('\n').slice(0, 3000);
}

function hasGroundedEvidence(evidence: string[] | undefined, sourceText: string): boolean {
  if (!evidence || evidence.length === 0) {
    return false;
  }

  const normalizedSource = normalizeEvidenceText(sourceText);
  return evidence.some(item => {
    const normalizedItem = normalizeEvidenceText(item);
    if (normalizedItem.length < 8) {
      return false;
    }

    return normalizedSource.includes(normalizedItem.slice(0, Math.min(24, normalizedItem.length)));
  });
}

function normalizeEvidenceText(text: string): string {
  return text.replace(/\s+/g, '').replace(/[，。！？、；：“”"'《》（）()【】[\]：,.!?;:-]/g, '');
}

function buildAnalysisReport({
  work,
  chapters,
  storyUnits,
  characterCards,
  rhythmCards,
  foreshadowCards,
  mapDungeonCards,
  techniqueCards,
  mode,
}: {
  work: Work;
  chapters: Chapter[];
  storyUnits: StoryUnit[];
  characterCards: CharacterCard[];
  rhythmCards: RhythmCard[];
  foreshadowCards: ForeshadowCard[];
  mapDungeonCards: MapDungeonCard[];
  techniqueCards: TechniqueCard[];
  mode: AnalysisConfig['mode'];
}): string {
  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.word_count, 0);
  const pendingCount = [
    ...storyUnits,
    ...characterCards,
    ...rhythmCards,
    ...mapDungeonCards,
    ...techniqueCards,
  ].filter(card => card.status === 'pending').length + foreshadowCards.filter(card => card.review_status === 'pending').length;

  const lines: string[] = [
    `# ${work.title} 创作方法论报告`,
    '',
    `- 来源文件：${work.source}`,
    `- 分析模式：${mode}`,
    `- 章节数：${chapters.length}`,
    `- 估算字数：${totalWords.toLocaleString()}`,
    `- 剧情单元：${storyUnits.length}`,
    `- 人物卡：${characterCards.length}`,
    `- 伏笔候选：${foreshadowCards.length}`,
    `- 待审核卡片：${pendingCount}`,
    '',
    '## 可复用创作技法',
    ...techniqueCards.flatMap((card, index) => [
      '',
      `### ${index + 1}. ${card.name}`,
      `- 分类：${card.category}`,
      `- 方法模式：${card.pattern}`,
      `- 为什么有效：${card.why_it_works.join('；') || '待补充'}`,
      `- 适用场景：${card.usable_when.join('、') || '待补充'}`,
      `- 使用风险：${card.risks.join('；') || '待补充'}`,
      `- 可复用模板：${card.reuse_template}`,
      `- 来源单元：${card.source_units.join('、') || '待确认'}`,
    ]),
    '',
    '## 证据层：剧情单元',
    ...storyUnits.flatMap((unit, index) => [
      '',
      `### ${index + 1}. ${unit.title}`,
      `- 范围：第 ${unit.chapter_range[0]} - ${unit.chapter_range[1]} 章`,
      `- 类型：${unit.unit_type}`,
      `- 核心问题：${unit.core_question || '待补充'}`,
      `- 主角目标：${unit.protagonist_goal || '待补充'}`,
      `- 主要障碍：${unit.main_obstacle || '待补充'}`,
      `- 读者钩子：${unit.reader_hook || '待补充'}`,
      `- 兑现点：${unit.payoff || '待补充'}`,
      `- 下一钩子：${unit.next_hook || '待补充'}`,
      `- 写作启发：${unit.writing_takeaway || '待补充'}`,
      '- 原文证据：',
      ...formatEvidence(unit.source_evidence),
    ]),
    '',
    '## 证据层：人物塑造',
    ...characterCards.slice(0, 20).flatMap((card, index) => [
      '',
      `### ${index + 1}. ${card.name}`,
      `- 角色类型：${card.role_type}`,
      `- 叙事功能：${card.narrative_function.join('、') || '待补充'}`,
      `- 核心欲望：${card.core_desire || '待补充'}`,
      `- 外部目标：${card.external_goal || '待补充'}`,
      `- 魅力点：${card.charm_points.join('、') || '待补充'}`,
      `- 写作启发：${card.writing_takeaway || '待补充'}`,
      '- 原文证据：',
      ...formatEvidence(card.source_evidence),
    ]),
    '',
    '## 证据层：线索/伏笔候选',
    ...foreshadowCards.slice(0, 30).map(card => `- ${card.name}（${card.foreshadow_type}）：${card.surface_info.slice(0, 100)}`),
    '',
    '## 后续建议',
    '- 前台优先沉淀“创作技法”，剧情单元、人物、伏笔、节奏只作为证据层。',
    '- 对技法卡逐条审核：看它是否有足够证据，是否能迁移到自己的创作。',
    '- 需要 AI 精修时，只对某一类技法或重点剧情单元重跑，不要整书反复重跑。',
  ];

  return lines.join('\n');
}

function formatEvidence(evidence: string[] | undefined): string[] {
  if (!evidence || evidence.length === 0) {
    return ['  - 暂无'];
  }

  return evidence.slice(0, 3).map(item => `  - ${item}`);
}
