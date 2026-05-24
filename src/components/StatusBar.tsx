import './StatusBar.css';

interface StatusBarProps {
  aiConfigured?: boolean;
  aiAvailable?: boolean;
}

function StatusBar({ aiConfigured = false, aiAvailable = false }: StatusBarProps) {
  return (
    <div className="statusbar">
      <div className="statusbar-left">
        <span className="status-item">字数: 0</span>
        <span className="status-item">今日: 0 字</span>
        <span className="status-item">写作时长: 00:00:00</span>
      </div>
      <div className="statusbar-right">
        <span className="status-item status-ready">就绪</span>
        <span className={`status-item ${aiConfigured ? 'status-ai-connected' : 'status-ai-disconnected'}`}>
          AI: {!aiAvailable ? '付费功能' : aiConfigured ? '已配置' : '未配置'}
        </span>
      </div>
    </div>
  );
}

export default StatusBar;
