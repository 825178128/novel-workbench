import { useKnowledgeStore } from '../../store/knowledgeStore';
import { BaseCardForm, EditableField } from './BaseCardForm';
import type { ForeshadowCard } from '../../types/knowledge';

interface ForeshadowCardFormProps {
  foreshadow: ForeshadowCard;
}

export function ForeshadowCardForm({ foreshadow }: ForeshadowCardFormProps) {
  const { updateCard } = useKnowledgeStore();
  const handleUpdate = (data: Partial<ForeshadowCard>) => updateCard('foreshadow', foreshadow.foreshadow_id, data);

  return (
    <BaseCardForm card={foreshadow} cardType="foreshadow" cardId={foreshadow.foreshadow_id} title={`伏笔: ${foreshadow.name}`}>
      <EditableField label="伏笔名称" value={foreshadow.name} onChange={value => handleUpdate({ name: value })} />
      <EditableField label="伏笔类型" value={foreshadow.foreshadow_type} onChange={value => handleUpdate({ foreshadow_type: value })} />
      <EditableField label="首次出现" value={foreshadow.first_appearance} onChange={value => handleUpdate({ first_appearance: value })} />
      <EditableField label="表面信息" value={foreshadow.surface_info} onChange={value => handleUpdate({ surface_info: value })} type="textarea" />
      <EditableField label="隐藏信息" value={foreshadow.hidden_info} onChange={value => handleUpdate({ hidden_info: value })} type="textarea" />
      <EditableField label="埋设方式" value={foreshadow.planting_method} onChange={value => handleUpdate({ planting_method: value })} type="textarea" />
      <EditableField
        label="写作启发"
        value={foreshadow.writing_takeaway}
        onChange={value => handleUpdate({ writing_takeaway: value })}
        type="textarea"
      />
    </BaseCardForm>
  );
}
