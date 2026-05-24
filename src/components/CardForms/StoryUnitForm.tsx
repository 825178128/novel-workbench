import { useKnowledgeStore } from '../../store/knowledgeStore';
import { BaseCardForm, EditableField, DynamicArrayField, ReadOnlyField } from './BaseCardForm';
import type { StoryUnit } from '../../types/knowledge';

const UNIT_TYPES = ['开局铺垫', '开局冲突', '副本探索', '升级突破', '感情发展', '势力斗争', '高潮战斗', '剧情推进'];
const EMOTION_TAGS = ['压抑', '愤怒', '爆发', '期待', '紧张', '轻松', '热血', '悲伤', '震惊', '释然'];

interface StoryUnitFormProps {
  unit: StoryUnit;
}

export function StoryUnitForm({ unit }: StoryUnitFormProps) {
  const { updateCard } = useKnowledgeStore();
  const handleUpdate = (data: Partial<StoryUnit>) => updateCard('story_unit', unit.unit_id, data);

  return (
    <BaseCardForm card={unit} cardType="story_unit" cardId={unit.unit_id} title={`剧情单元: ${unit.title}`}>
      <ReadOnlyField label="章节范围" value={`第 ${unit.chapter_range[0]} - ${unit.chapter_range[1]} 章`} />
      <DynamicArrayField label="原文证据" items={unit.source_evidence || []} onChange={items => handleUpdate({ source_evidence: items })} />

      <EditableField
        label="单元类型"
        value={unit.unit_type}
        onChange={value => handleUpdate({ unit_type: value })}
        type="select"
        options={UNIT_TYPES}
      />

      <EditableField
        label="核心问题"
        value={unit.core_question}
        onChange={value => handleUpdate({ core_question: value })}
        type="textarea"
      />

      <EditableField
        label="主角目标"
        value={unit.protagonist_goal}
        onChange={value => handleUpdate({ protagonist_goal: value })}
        type="textarea"
      />

      <EditableField
        label="主要障碍"
        value={unit.main_obstacle}
        onChange={value => handleUpdate({ main_obstacle: value })}
        type="textarea"
      />

      <EditableField
        label="读者钩子"
        value={unit.reader_hook}
        onChange={value => handleUpdate({ reader_hook: value })}
        type="textarea"
      />

      <DynamicArrayField
        label="情绪曲线"
        items={unit.emotional_curve}
        onChange={items => handleUpdate({ emotional_curve: items })}
      />

      <div className="form-field">
        <label>快捷情绪标签</label>
        <div className="tag-quick-add">
          {EMOTION_TAGS.map(tag => (
            <button
              key={tag}
              className="tag-btn"
              onClick={() => {
                if (!unit.emotional_curve.includes(tag)) {
                  handleUpdate({ emotional_curve: [...unit.emotional_curve, tag] });
                }
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <EditableField label="起始状态" value={unit.start_state} onChange={value => handleUpdate({ start_state: value })} type="textarea" />
      <EditableField label="结束状态" value={unit.end_state} onChange={value => handleUpdate({ end_state: value })} type="textarea" />
      <EditableField label="兑现点" value={unit.payoff} onChange={value => handleUpdate({ payoff: value })} type="textarea" />
      <EditableField label="下一钩子" value={unit.next_hook} onChange={value => handleUpdate({ next_hook: value })} type="textarea" />
      <EditableField
        label="写作启发"
        value={unit.writing_takeaway}
        onChange={value => handleUpdate({ writing_takeaway: value })}
        type="textarea"
      />
    </BaseCardForm>
  );
}
