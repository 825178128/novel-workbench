import { useKnowledgeStore } from '../../store/knowledgeStore';
import { BaseCardForm, EditableField, DynamicArrayField } from './BaseCardForm';
import type { TechniqueCard } from '../../types/knowledge';

interface TechniqueCardFormProps {
  technique: TechniqueCard;
}

export function TechniqueCardForm({ technique }: TechniqueCardFormProps) {
  const { updateCard } = useKnowledgeStore();
  const handleUpdate = (data: Partial<TechniqueCard>) => updateCard('technique', technique.technique_id, data);

  return (
    <BaseCardForm card={technique} cardType="technique" cardId={technique.technique_id} title={`技法: ${technique.name}`}>
      <EditableField label="技法名称" value={technique.name} onChange={value => handleUpdate({ name: value })} />
      <EditableField label="分类" value={technique.category} onChange={value => handleUpdate({ category: value })} />
      <EditableField label="模式" value={technique.pattern} onChange={value => handleUpdate({ pattern: value })} type="textarea" />
      <DynamicArrayField label="为什么有效" items={technique.why_it_works} onChange={items => handleUpdate({ why_it_works: items })} />
      <DynamicArrayField label="适用场景" items={technique.usable_when} onChange={items => handleUpdate({ usable_when: items })} />
      <DynamicArrayField label="风险" items={technique.risks} onChange={items => handleUpdate({ risks: items })} />
      <EditableField
        label="可复用模板"
        value={technique.reuse_template}
        onChange={value => handleUpdate({ reuse_template: value })}
        type="textarea"
      />
    </BaseCardForm>
  );
}
