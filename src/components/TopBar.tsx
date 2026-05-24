import { Menu, Search, Settings } from 'lucide-react';
import { useKnowledgeStore } from '../store/knowledgeStore';
import './TopBar.css';

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleAIPanel: () => void;
  onToggleAIConfig: () => void;
  aiConfigured: boolean;
  aiAvailable: boolean;
}

function TopBar({ onToggleSidebar, onToggleAIPanel, onToggleAIConfig, aiConfigured, aiAvailable }: TopBarProps) {
  const currentWork = useKnowledgeStore(state => state.currentWork);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="topbar-btn" onClick={onToggleSidebar} title="切换侧边栏">
          <Menu size={18} />
        </button>
        <div className="topbar-logo">
          <span className="logo-icon">NW</span>
          <span className="logo-text">网文工作台</span>
        </div>
        <div className="topbar-divider"></div>
        <select className="work-select" value={currentWork?.work_id || ''} disabled>
          <option value="">{currentWork ? currentWork.title : '尚未导入作品'}</option>
          {currentWork && <option value={currentWork.work_id}>{currentWork.title}</option>}
        </select>
      </div>

      <div className="topbar-center">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="搜索... (Ctrl+K)" />
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-btn" onClick={onToggleAIPanel} title={aiAvailable ? 'AI 助手' : 'AI 助手（付费功能）'}>
          AI
        </button>
        <button
          className="topbar-btn"
          onClick={onToggleAIConfig}
          title={aiAvailable ? (aiConfigured ? 'AI 已配置' : '配置 AI') : 'AI 配置（付费功能）'}
        >
          <Settings size={18} />
          {aiConfigured && <span className="ai-status-dot" />}
        </button>
      </div>
    </div>
  );
}

export default TopBar;
