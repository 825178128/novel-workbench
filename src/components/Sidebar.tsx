import { ChevronLeft, ChevronRight, Book, Brain, FolderPlus, Gauge, Layers, Lightbulb, Network, ShieldCheck } from 'lucide-react';
import { useKnowledgeStore } from '../store/knowledgeStore';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const {
    chapters,
    characterCards,
    storyUnits,
    techniqueCards,
    narrativeMechanisms,
    evidenceItems,
    foreshadowCards,
  } = useKnowledgeStore();

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">资源管理器</span>
        <button className="sidebar-toggle" onClick={onToggle} title="折叠侧边栏">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="section-header">
            <Book size={14} />
            <span>原文索引</span>
          </div>
          {!collapsed && (
            <div className="section-content">
              <div className="tree-item">
                <span className="tree-icon">卷</span>
                <span className="tree-label">章节样本</span>
              </div>
              {chapters.slice(0, 8).map(chapter => (
                <div className="tree-item tree-child" key={chapter.chapter_index}>
                  <span className="tree-icon">章</span>
                  <span className="tree-label">{chapter.title}</span>
                  <span className="tree-meta">{chapter.word_count.toLocaleString()} 字</span>
                </div>
              ))}
              {chapters.length === 0 && <div className="tree-item tree-child">尚未导入章节</div>}
              {chapters.length > 8 && <div className="tree-item tree-child">+{chapters.length - 8} 章</div>}
            </div>
          )}
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <ShieldCheck size={14} />
            <span>拆书产物</span>
          </div>
          {!collapsed && (
            <div className="section-content">
              <div className="tree-item">
                <Lightbulb size={14} />
                <span className="tree-label">创作技法</span>
                <span className="tree-badge">{techniqueCards.length}</span>
              </div>
              <div className="tree-item">
                <Brain size={14} />
                <span className="tree-label">叙事机制</span>
                <span className="tree-badge">{narrativeMechanisms.length}</span>
              </div>
              <div className="tree-item">
                <Layers size={14} />
                <span className="tree-label">剧情单元</span>
                <span className="tree-badge">{storyUnits.length}</span>
              </div>
              <div className="tree-item">
                <Network size={14} />
                <span className="tree-label">证据索引</span>
                <span className="tree-badge">{evidenceItems.length}</span>
              </div>
              <div className="tree-item">
                <Gauge size={14} />
                <span className="tree-label">人物/线索</span>
                <span className="tree-badge">{characterCards.length + foreshadowCards.length}</span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button className="sidebar-action-btn">
            <FolderPlus size={16} />
            <span>导入小说</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
