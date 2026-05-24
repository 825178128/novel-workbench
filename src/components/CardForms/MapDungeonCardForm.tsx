import { useKnowledgeStore } from '../../store/knowledgeStore';
import { BaseCardForm, EditableField, DynamicArrayField } from './BaseCardForm';
import type { MapDungeonCard } from '../../types/knowledge';

interface MapDungeonCardFormProps {
  map: MapDungeonCard;
}

export function MapDungeonCardForm({ map }: MapDungeonCardFormProps) {
  const { updateCard } = useKnowledgeStore();
  const handleUpdate = (data: Partial<MapDungeonCard>) => updateCard('map_dungeon', map.map_id, data);

  return (
    <BaseCardForm card={map} cardType="map_dungeon" cardId={map.map_id} title={`场景/副本: ${map.name}`}>
      <EditableField label="名称" value={map.name} onChange={value => handleUpdate({ name: value })} />
      <EditableField label="类型" value={map.map_type} onChange={value => handleUpdate({ map_type: value })} />
      <EditableField label="进入原因" value={map.entry_reason} onChange={value => handleUpdate({ entry_reason: value })} type="textarea" />
      <EditableField label="进入代价" value={map.entry_cost} onChange={value => handleUpdate({ entry_cost: value })} type="textarea" />
      <DynamicArrayField label="新规则" items={map.new_rules} onChange={items => handleUpdate({ new_rules: items })} />
      <DynamicArrayField label="核心资源" items={map.core_resources} onChange={items => handleUpdate({ core_resources: items })} />
      <DynamicArrayField label="核心威胁" items={map.core_threats} onChange={items => handleUpdate({ core_threats: items })} />
      <EditableField
        label="写作启发"
        value={map.writing_takeaway}
        onChange={value => handleUpdate({ writing_takeaway: value })}
        type="textarea"
      />
    </BaseCardForm>
  );
}
