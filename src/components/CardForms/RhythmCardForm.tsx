import { useKnowledgeStore } from '../../store/knowledgeStore';
import { BaseCardForm, EditableField, ReadOnlyField, DynamicArrayField } from './BaseCardForm';
import type { RhythmCard } from '../../types/knowledge';

interface RhythmCardFormProps {
  rhythm: RhythmCard;
}

export function RhythmCardForm({ rhythm }: RhythmCardFormProps) {
  const { updateCard } = useKnowledgeStore();
  const handleUpdate = (data: Partial<RhythmCard>) => updateCard('rhythm', rhythm.rhythm_id, data);

  return (
    <BaseCardForm card={rhythm} cardType="rhythm" cardId={rhythm.rhythm_id} title="节奏卡">
      <ReadOnlyField label="关联剧情单元" value={rhythm.unit_id} />
      <ReadOnlyField
        label="节奏密度"
        value={`冲突 ${rhythm.pacing_density.conflict_count} / 揭示 ${rhythm.pacing_density.reveal_count} / 兑现 ${rhythm.pacing_density.payoff_count} / 新钩子 ${rhythm.pacing_density.new_hook_count}`}
      />
      <DynamicArrayField
        label="情绪曲线"
        items={rhythm.emotional_curve}
        onChange={items => handleUpdate({ emotional_curve: items })}
      />
      <div className="form-field">
        <label>节拍序列</label>
        <div className="readonly-list">
          {rhythm.beat_sequence.length === 0 ? '暂无节拍' : rhythm.beat_sequence.map((beat, index) => (
            <div className="readonly-list-item" key={`${beat.beat}-${index}`}>
              <strong>{beat.beat}</strong>：{beat.content}
              <div>{beat.function}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-field">
        <label>章节钩子</label>
        <div className="readonly-list">
          {rhythm.chapter_hooks.length === 0 ? '暂无章节钩子' : rhythm.chapter_hooks.map(hook => (
            <div className="readonly-list-item" key={`${hook.chapter}-${hook.hook_type}`}>
              <strong>第{hook.chapter}章 [{hook.hook_type}]</strong>：{hook.hook}
            </div>
          ))}
        </div>
      </div>
      <EditableField label="兑现点" value={rhythm.payoff} onChange={value => handleUpdate({ payoff: value })} type="textarea" />
      <EditableField label="新钩子" value={rhythm.new_hook} onChange={value => handleUpdate({ new_hook: value })} type="textarea" />
      <EditableField
        label="写作启发"
        value={rhythm.writing_takeaway}
        onChange={value => handleUpdate({ writing_takeaway: value })}
        type="textarea"
      />
    </BaseCardForm>
  );
}
