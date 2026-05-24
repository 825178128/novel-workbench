import { useKnowledgeStore } from '../../store/knowledgeStore';
import { BaseCardForm, EditableField, DynamicArrayField } from './BaseCardForm';
import type { CharacterCard } from '../../types/knowledge';

const ROLE_TYPES = ['主角', '女主', '男主', '男配', '女配', '反派', '导师', '工具人', '重要配角', '待定'];
const NARRATIVE_FUNCTIONS = ['承载爽点', '推动升级', '制造情绪认同', '提供阻碍', '引导主角', '衬托主角', '制造悬念', '情感寄托'];

interface CharacterCardFormProps {
  character: CharacterCard;
}

export function CharacterCardForm({ character }: CharacterCardFormProps) {
  const { updateCard } = useKnowledgeStore();
  const handleUpdate = (data: Partial<CharacterCard>) => updateCard('character', character.character_id, data);

  return (
    <BaseCardForm card={character} cardType="character" cardId={character.character_id} title={`人物: ${character.name}`}>
      <EditableField label="姓名" value={character.name} onChange={value => handleUpdate({ name: value })} />

      <EditableField
        label="角色类型"
        value={character.role_type}
        onChange={value => handleUpdate({ role_type: value })}
        type="select"
        options={ROLE_TYPES}
      />

      <div className="form-field">
        <label>叙事功能</label>
        <div className="checkbox-group">
          {NARRATIVE_FUNCTIONS.map(func => (
            <label key={func} className="checkbox-item">
              <input
                type="checkbox"
                checked={character.narrative_function.includes(func)}
                onChange={event => {
                  handleUpdate({
                    narrative_function: event.target.checked
                      ? [...character.narrative_function, func]
                      : character.narrative_function.filter(item => item !== func),
                  });
                }}
              />
              {func}
            </label>
          ))}
        </div>
      </div>

      <EditableField label="核心欲望" value={character.core_desire} onChange={value => handleUpdate({ core_desire: value })} type="textarea" />
      <EditableField label="外部目标" value={character.external_goal} onChange={value => handleUpdate({ external_goal: value })} type="textarea" />
      <EditableField label="内在缺口" value={character.internal_lack} onChange={value => handleUpdate({ internal_lack: value })} type="textarea" />
      <DynamicArrayField label="原文证据" items={character.source_evidence || []} onChange={items => handleUpdate({ source_evidence: items })} />
      <DynamicArrayField label="魅力点" items={character.charm_points} onChange={items => handleUpdate({ charm_points: items })} />
      <DynamicArrayField label="读者共情点" items={character.reader_empathy} onChange={items => handleUpdate({ reader_empathy: items })} />
      <DynamicArrayField label="冲突来源" items={character.conflict_sources} onChange={items => handleUpdate({ conflict_sources: items })} />
      <EditableField
        label="写作启发"
        value={character.writing_takeaway}
        onChange={value => handleUpdate({ writing_takeaway: value })}
        type="textarea"
      />
    </BaseCardForm>
  );
}
