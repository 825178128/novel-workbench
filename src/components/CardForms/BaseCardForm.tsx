import React from 'react';
import { useKnowledgeStore } from '../../store/knowledgeStore';
import './CardForms.css';

interface BaseCardFormProps {
  card: { confidence?: number };
  cardType: 'story_unit' | 'character' | 'rhythm' | 'foreshadow' | 'map_dungeon' | 'technique';
  cardId: string;
  title: string;
  children: React.ReactNode;
}

function getConfidenceLevel(confidence = 0): string {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.75) return 'medium';
  if (confidence >= 0.6) return 'low';
  return 'reject';
}

function getConfidenceText(confidence = 0): string {
  if (confidence >= 0.9) return '原文明确支持';
  if (confidence >= 0.75) return '原文支持，含少量推断';
  if (confidence >= 0.6) return '可能成立，建议人工审核';
  return '置信度较低，建议暂不入库';
}

export function BaseCardForm({ card, cardType, cardId, title, children }: BaseCardFormProps) {
  const { updateCard, setSelectedCard } = useKnowledgeStore();
  const confidence = card.confidence ?? 0;

  const handleApprove = () => {
    updateCard(cardType, cardId, cardType === 'foreshadow' ? { review_status: 'approved' } : { status: 'approved' });
    setSelectedCard(null, null);
  };

  const handleReject = () => {
    updateCard(cardType, cardId, cardType === 'foreshadow' ? { review_status: 'rejected' } : { status: 'rejected' });
    setSelectedCard(null, null);
  };

  return (
    <div className="card-form">
      <div className="card-form-header">
        <h3>{title}</h3>
      </div>

      <div className="card-confidence-banner" data-level={getConfidenceLevel(confidence)}>
        置信度 {Math.round(confidence * 100)}% - {getConfidenceText(confidence)}
      </div>

      <div className="card-form-fields">{children}</div>

      <div className="card-form-actions">
        <button className="btn-approve" onClick={handleApprove}>
          入库
        </button>
        <button className="btn-reject" onClick={handleReject}>
          拒绝
        </button>
      </div>
    </div>
  );
}

export function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'textarea' | 'select';
  options?: string[];
}) {
  if (type === 'textarea') {
    return (
      <div className="form-field">
        <label>{label}</label>
        <textarea value={value} onChange={event => onChange(event.target.value)} rows={4} />
      </div>
    );
  }

  if (type === 'select' && options) {
    return (
      <div className="form-field">
        <label>{label}</label>
        <select value={value} onChange={event => onChange(event.target.value)}>
          <option value="">请选择</option>
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="form-field">
      <label>{label}</label>
      <input type="text" value={value} onChange={event => onChange(event.target.value)} />
    </div>
  );
}

export function DynamicArrayField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const handleAdd = () => onChange([...items, '']);
  const handleChange = (index: number, value: string) => {
    const nextItems = [...items];
    nextItems[index] = value;
    onChange(nextItems);
  };
  const handleRemove = (index: number) => onChange(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="form-field">
      <label>{label}</label>
      {items.map((item, index) => (
        <div className="array-item" key={index}>
          <input type="text" value={item} onChange={event => handleChange(index, event.target.value)} />
          <button onClick={() => handleRemove(index)} title="删除">
            x
          </button>
        </div>
      ))}
      <button className="btn-add-item" onClick={handleAdd}>
        + 添加
      </button>
    </div>
  );
}

export function ReadOnlyField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <div className="readonly-value">{String(value)}</div>
    </div>
  );
}
