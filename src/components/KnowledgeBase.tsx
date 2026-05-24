import { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  FileText,
  Fingerprint,
  Gauge,
  Layers,
  Lightbulb,
  Map,
  Network,
  Search,
  ShieldAlert,
  Trash2,
  Users,
} from 'lucide-react';
import { useKnowledgeStore } from '../store/knowledgeStore';
import type {
  StoryUnit,
  CharacterCard,
  RhythmCard,
  ForeshadowCard,
  MapDungeonCard,
  TechniqueCard,
  NarrativeMechanism,
} from '../types/knowledge';
import {
  StoryUnitForm,
  CharacterCardForm,
  RhythmCardForm,
  ForeshadowCardForm,
  MapDungeonCardForm,
  TechniqueCardForm,
} from './CardForms';
import './KnowledgeBase.css';

type CardType = 'story_unit' | 'character' | 'rhythm' | 'foreshadow' | 'map_dungeon' | 'technique' | 'mechanism';
type ReviewFilter = 'all' | 'pending' | 'approved' | 'rejected';
type KnowledgeCard = StoryUnit | CharacterCard | RhythmCard | ForeshadowCard | MapDungeonCard | TechniqueCard | NarrativeMechanism;

const CARD_TYPES: Array<{ key: CardType; label: string; group: 'core' | 'analysis' | 'evidence'; icon: React.ComponentType<{ size?: number }>; color: string; description: string }> = [
  { key: 'technique', label: '创作技法', group: 'core', icon: Lightbulb, color: '#ec4899', description: '最终沉淀的可复用写作方法' },
  { key: 'mechanism', label: '叙事机制', group: 'analysis', icon: Brain, color: '#f97316', description: '从证据归纳出的作者操作方式' },
  { key: 'story_unit', label: '剧情单元', group: 'evidence', icon: Layers, color: '#3b82f6', description: '按创作功能归并的剧情段落' },
  { key: 'character', label: '人物塑造', group: 'evidence', icon: Users, color: '#8b5cf6', description: '需 AI 理解人物功能，本地模式跳过' },
  { key: 'rhythm', label: '节奏后台', group: 'evidence', icon: Gauge, color: '#10b981', description: '辅助技法归纳，一般不用逐条审核' },
  { key: 'foreshadow', label: '线索后台', group: 'evidence', icon: Fingerprint, color: '#f59e0b', description: '需 AI 筛选高价值线索，本地模式跳过' },
  { key: 'map_dungeon', label: '场景/副本', group: 'evidence', icon: Map, color: '#06b6d4', description: '副本、案件、权力场和场景规则' },
];

const GROUP_LABELS = {
  core: '核心成果',
  analysis: '机制分析',
  evidence: '后台证据（可选查看）',
};

function KnowledgeBase() {
  const [selectedType, setSelectedType] = useState<CardType>('technique');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');

  const {
    storyUnits,
    characterCards,
    rhythmCards,
    foreshadowCards,
    mapDungeonCards,
    techniqueCards,
    narrativeMechanisms,
    selectedCardType,
    selectedCardId,
    setSelectedCard,
    clearPersistedData,
  } = useKnowledgeStore();

  const cardsByType = useMemo<Record<CardType, KnowledgeCard[]>>(() => ({
    story_unit: storyUnits,
    character: characterCards,
    rhythm: rhythmCards,
    foreshadow: foreshadowCards,
    map_dungeon: mapDungeonCards,
    technique: techniqueCards,
    mechanism: narrativeMechanisms,
  }), [characterCards, foreshadowCards, mapDungeonCards, narrativeMechanisms, rhythmCards, storyUnits, techniqueCards]);

  const cards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedCards = cardsByType[selectedType].filter(card => {
      if (reviewFilter === 'all') return true;
      return getCardStatus(card) === reviewFilter;
    });

    if (!query) {
      return selectedCards;
    }

    return selectedCards.filter(card => {
      const searchable = `${getCardTitle(card)} ${getCardSummary(card)}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [cardsByType, reviewFilter, searchQuery, selectedType]);

  const reviewCounts = useMemo(() => {
    const selectedCards = cardsByType[selectedType];
    return {
      all: selectedCards.length,
      pending: selectedCards.filter(card => getCardStatus(card) === 'pending').length,
      approved: selectedCards.filter(card => getCardStatus(card) === 'approved').length,
      rejected: selectedCards.filter(card => getCardStatus(card) === 'rejected').length,
    };
  }, [cardsByType, selectedType]);

  const handleCardClick = (card: KnowledgeCard) => {
    setSelectedCard(selectedType, getCardId(card));
  };

  const handleClearKnowledgeBase = async () => {
    if (!confirm('确定清空当前浏览器本地保存的作品、章节、拆书报告和知识库卡片吗？')) {
      return;
    }

    await clearPersistedData();
    setSearchQuery('');
    setReviewFilter('all');
    alert('本地拆书结果和知识库已清空。');
  };

  return (
    <div className="knowledge-base">
      <div className="kb-sidebar">
        <div className="kb-sidebar-header">
          <BookOpen size={18} />
          <div>
            <h3>方法库</h3>
            <span>从小说反推写法</span>
          </div>
        </div>
        <div className="kb-nav">
          {(['core', 'analysis', 'evidence'] as const).map(group => (
            <div className="kb-nav-group" key={group}>
              <div className="kb-nav-group-title">{GROUP_LABELS[group]}</div>
              {CARD_TYPES.filter(type => type.group === group).map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.key}
                    className={`kb-nav-item ${selectedType === type.key ? 'active' : ''}`}
                    onClick={() => setSelectedType(type.key)}
                    style={{ '--card-color': type.color } as React.CSSProperties}
                  >
                    <span className="kb-nav-icon"><Icon size={16} /></span>
                    <span className="kb-nav-label">{type.label}</span>
                    <span className="kb-nav-count">{cardsByType[type.key].length}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="kb-list">
        <div className="kb-list-header">
          <div className="kb-section-title">
            {(() => {
              const selectedMeta = CARD_TYPES.find(type => type.key === selectedType);
              const Icon = selectedMeta?.icon || FileText;
              return (
                <>
                  <span className="kb-section-icon"><Icon size={20} /></span>
                  <div>
                    <h2>{selectedMeta?.label || '知识卡片'}</h2>
                    <p>{selectedMeta?.description}</p>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="kb-metrics">
            <div className="kb-metric"><strong>{techniqueCards.length}</strong><span>技法</span></div>
            <div className="kb-metric"><strong>{narrativeMechanisms.length}</strong><span>机制</span></div>
            <div className="kb-metric"><strong>{storyUnits.length}</strong><span>单元</span></div>
          </div>
          <div className="kb-list-toolbar">
            <Search className="kb-search-icon" size={16} />
            <input
              type="text"
              placeholder="搜索卡片..."
              className="kb-search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
            />
            <button className="kb-danger-btn" onClick={handleClearKnowledgeBase}>
              <Trash2 size={14} />
              清空
            </button>
          </div>
          <div className="kb-review-filters">
            {[
              ['all', '全部'],
              ['pending', '待审核'],
              ['approved', '已入库'],
              ['rejected', '已拒绝'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`kb-filter-btn ${reviewFilter === key ? 'active' : ''}`}
                onClick={() => setReviewFilter(key as ReviewFilter)}
              >
                {label} {reviewCounts[key as ReviewFilter]}
              </button>
            ))}
          </div>
        </div>

        <div className="kb-cards-grid">
          {cards.length === 0 ? (
            <div className="kb-empty">
              <ShieldAlert size={28} />
              <p>暂无{CARD_TYPES.find(type => type.key === selectedType)?.label}</p>
              <p className="kb-empty-hint">请先导入文件并开始分析。</p>
            </div>
          ) : (
            cards.map(card => (
              <div key={getCardId(card)} className="kb-card" onClick={() => handleCardClick(card)}>
                <div className="kb-card-header">
                  <h4>{getCardTitle(card)}</h4>
                  <span className="kb-card-status" data-status={getCardStatus(card)}>
                    {getStatusText(getCardStatus(card))}
                  </span>
                </div>
                <div className="kb-card-body">
                  <p className="kb-card-summary">{getCardSummary(card) || '暂无摘要'}</p>
                </div>
                <div className="kb-card-footer">
                  <div className="kb-confidence">
                    <span>置信度</span>
                    <div className="kb-confidence-bar">
                      <div className="kb-confidence-fill" style={{ width: `${getConfidence(card) * 100}%` }} />
                    </div>
                    <span>{Math.round(getConfidence(card) * 100)}%</span>
                  </div>
                  {'source_mechanisms' in card && card.source_mechanisms && card.source_mechanisms.length > 0 && (
                    <span className="kb-card-source"><Network size={12} /> {card.source_mechanisms.length} 个机制</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="kb-detail">
        <CardDetailPanel
          cardType={selectedCardType as CardType | null}
          cardId={selectedCardId}
          storyUnits={storyUnits}
          characterCards={characterCards}
          rhythmCards={rhythmCards}
          foreshadowCards={foreshadowCards}
          mapDungeonCards={mapDungeonCards}
          techniqueCards={techniqueCards}
          narrativeMechanisms={narrativeMechanisms}
        />
      </div>
    </div>
  );
}

function CardDetailPanel({
  cardType,
  cardId,
  storyUnits,
  characterCards,
  rhythmCards,
  foreshadowCards,
  mapDungeonCards,
  techniqueCards,
  narrativeMechanisms,
}: {
  cardType: CardType | null;
  cardId: string | null;
  storyUnits: StoryUnit[];
  characterCards: CharacterCard[];
  rhythmCards: RhythmCard[];
  foreshadowCards: ForeshadowCard[];
  mapDungeonCards: MapDungeonCard[];
  techniqueCards: TechniqueCard[];
  narrativeMechanisms: NarrativeMechanism[];
}) {
  if (!cardType || !cardId) {
    return <div className="kb-detail-empty">选择卡片查看详情</div>;
  }

  switch (cardType) {
    case 'story_unit': {
      const card = storyUnits.find(item => item.unit_id === cardId);
      return card ? <StoryUnitForm unit={card} /> : <MissingCard />;
    }
    case 'character': {
      const card = characterCards.find(item => item.character_id === cardId);
      return card ? <CharacterCardForm character={card} /> : <MissingCard />;
    }
    case 'rhythm': {
      const card = rhythmCards.find(item => item.rhythm_id === cardId);
      return card ? <RhythmCardForm rhythm={card} /> : <MissingCard />;
    }
    case 'foreshadow': {
      const card = foreshadowCards.find(item => item.foreshadow_id === cardId);
      return card ? <ForeshadowCardForm foreshadow={card} /> : <MissingCard />;
    }
    case 'map_dungeon': {
      const card = mapDungeonCards.find(item => item.map_id === cardId);
      return card ? <MapDungeonCardForm map={card} /> : <MissingCard />;
    }
    case 'technique': {
      const card = techniqueCards.find(item => item.technique_id === cardId);
      return card ? <TechniqueCardForm technique={card} /> : <MissingCard />;
    }
    case 'mechanism': {
      const card = narrativeMechanisms.find(item => item.mechanism_id === cardId);
      return card ? <MechanismDetail mechanism={card} /> : <MissingCard />;
    }
  }
}

function MechanismDetail({ mechanism }: { mechanism: NarrativeMechanism }) {
  const { updateCard } = useKnowledgeStore();

  return (
    <div className="card-form">
      <div className="card-form-header">
        <h3>{mechanism.name}</h3>
      </div>
      <div className="card-confidence-banner" data-level={mechanism.confidence >= 0.7 ? 'medium' : 'low'}>
        机制置信度 {Math.round(mechanism.confidence * 100)}% - 机制层是技法提炼的中间依据
      </div>
      <div className="card-form-fields">
        <div className="form-field">
          <label>分类</label>
          <div className="readonly-value">{mechanism.category}</div>
        </div>
        <div className="form-field">
          <label>观察</label>
          <textarea value={mechanism.observation} onChange={event => updateCard('mechanism', mechanism.mechanism_id, { observation: event.target.value })} />
        </div>
        <div className="form-field">
          <label>方法摘要</label>
          <textarea value={mechanism.method_summary} onChange={event => updateCard('mechanism', mechanism.mechanism_id, { method_summary: event.target.value })} />
        </div>
        <div className="form-field">
          <label>来源剧情单元</label>
          <div className="readonly-value">{mechanism.source_units.join('、') || '暂无'}</div>
        </div>
        <div className="form-field">
          <label>证据索引数量</label>
          <div className="readonly-value">{mechanism.evidence_ids.length}</div>
        </div>
      </div>
    </div>
  );
}

function MissingCard() {
  return <div className="kb-detail-empty">卡片不存在</div>;
}

function getCardId(card: KnowledgeCard): string {
  if ('rhythm_id' in card) return String(card.rhythm_id);
  if ('mechanism_id' in card) return String(card.mechanism_id);
  if ('character_id' in card) return String(card.character_id);
  if ('foreshadow_id' in card) return String(card.foreshadow_id);
  if ('map_id' in card) return String(card.map_id);
  if ('technique_id' in card) return String(card.technique_id);
  return String(card.unit_id);
}

function getCardTitle(card: KnowledgeCard): string {
  if ('technique_id' in card) return card.name;
  if ('mechanism_id' in card) return card.name;
  if ('rhythm_id' in card) return `节奏证据 ${card.unit_id}`;
  if ('name' in card) return card.name;
  if ('title' in card) return card.title;
  return '未命名卡片';
}

function getCardSummary(card: KnowledgeCard): string {
  if ('pattern' in card) return card.pattern;
  if ('method_summary' in card) return card.method_summary;
  if ('core_question' in card) return card.core_question;
  if ('core_desire' in card) return card.core_desire;
  if ('surface_info' in card) return card.surface_info;
  return card.writing_takeaway || '';
}

function getCardStatus(card: KnowledgeCard): string {
  if ('review_status' in card) return String(card.review_status);
  return String(card.status);
}

function getConfidence(card: KnowledgeCard): number {
  return Math.max(0, Math.min(card.confidence || 0, 1));
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    approved: '已入库',
    rejected: '已拒绝',
    active: '进行中',
    resolved: '已兑现',
  };
  return statusMap[status] || status;
}

export default KnowledgeBase;
