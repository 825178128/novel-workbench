import { useEffect, useState } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import StatusBar from './components/StatusBar';
import { AIConfigPanel } from './components/AIConfigPanel';
import { aiService } from './services/aiService';
import { clearAIConfig, loadAIConfig, saveAIConfig } from './services/aiConfigStorage';
import { getFeatureAccess } from './services/featureAccess';
import { useKnowledgeStore } from './store/knowledgeStore';
import type { AIConfig } from './types/ai';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelVisible, setAiPanelVisible] = useState(false);
  const [aiConfigVisible, setAiConfigVisible] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(() => loadAIConfig() !== null);
  const featureAccess = getFeatureAccess();

  useEffect(() => {
    const config = loadAIConfig();
    if (config) {
      aiService.setConfig(config);
    }
    void useKnowledgeStore.getState().loadLatestWork();
  }, []);

  const handleSaveAIConfig = (config: AIConfig) => {
    aiService.setConfig(config);
    saveAIConfig(config);
    setAiConfigured(true);
  };

  const handleClearAIConfig = () => {
    aiService.clearConfig();
    clearAIConfig();
    setAiConfigured(false);
  };

  return (
    <div className="app-container">
      <TopBar
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleAIPanel={() => setAiPanelVisible(!aiPanelVisible)}
        onToggleAIConfig={() => setAiConfigVisible(true)}
        aiConfigured={aiConfigured}
        aiAvailable={featureAccess.aiAssist}
      />

      <div className="main-content">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Workspace aiPanelVisible={aiPanelVisible} />
      </div>

      <StatusBar aiConfigured={aiConfigured} aiAvailable={featureAccess.aiAssist} />

      {aiConfigVisible && (
        <AIConfigPanel
          onClose={() => setAiConfigVisible(false)}
          onSave={handleSaveAIConfig}
          onClear={handleClearAIConfig}
        />
      )}
    </div>
  );
}

export default App;
