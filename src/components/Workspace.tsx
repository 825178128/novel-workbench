import { useState } from 'react';
import { CheckCircle2, CircleAlert, Database, FileUp, PlayCircle } from 'lucide-react';
import { useKnowledgeStore } from '../store/knowledgeStore';
import { parseFile } from '../services/fileParser';
import { loadAIConfig } from '../services/aiConfigStorage';
import { getFeatureAccess } from '../services/featureAccess';
import { segmentStoryUnits } from '../services/localAnalyzer';
import KnowledgeBase from './KnowledgeBase';
import './Workspace.css';

interface WorkspaceProps {
  aiPanelVisible: boolean;
}

function Workspace({ aiPanelVisible }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'import' | 'report' | 'knowledge'>('editor');

  return (
    <div className="workspace">
      <div className="workspace-tabs">
        <button
          className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          编辑器
        </button>
        <button
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          导入与分析
        </button>
        <button
          className={`tab ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          知识库
        </button>
        <button
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          拆书报告
        </button>
      </div>

      <div className="workspace-content">
        {activeTab === 'editor' && <EditorView />}
        {activeTab === 'import' && <ImportView />}
        {activeTab === 'report' && <ReportView />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
      </div>

      {aiPanelVisible && <AIPanel />}
    </div>
  );
}

function EditorView() {
  return (
    <div className="editor-view">
      <div className="editor-toolbar">
        <button className="toolbar-btn" title="加粗"><b>B</b></button>
        <button className="toolbar-btn" title="斜体"><i>I</i></button>
        <button className="toolbar-btn" title="下划线"><u>U</u></button>
        <div className="toolbar-divider"></div>
        <button className="toolbar-btn" title="标题">H1</button>
        <button className="toolbar-btn" title="段落">P</button>
      </div>

      <div className="editor-area">
        <textarea placeholder="开始写作..." className="editor-textarea" />
      </div>
    </div>
  );
}

function ImportView() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const featureAccess = getFeatureAccess();
  const [analysisMode, setAnalysisMode] = useState<'local' | 'ai' | 'hybrid'>(featureAccess.aiAnalysis ? 'hybrid' : 'local');
  const {
    chapters,
    storyUnits,
    analysisCandidates,
    currentWork,
    analysisProgress,
    startAnalysis,
    createWorkFromFile,
    clearPersistedData,
    setStoryUnits,
  } = useKnowledgeStore();

  const isAIConfigured = loadAIConfig() !== null;
  const hasImportedNovel = chapters.length > 0;
  const isAnalyzing = analysisProgress.status === 'analyzing';

  const changeAnalysisMode = (mode: 'local' | 'ai' | 'hybrid') => {
    if ((mode === 'ai' || mode === 'hybrid') && !featureAccess.aiAnalysis) {
      alert(featureAccess.reason || 'AI 辅助当前不可用。');
      setAnalysisMode('local');
      return;
    }

    setAnalysisMode(mode);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);

    try {
      const parsedChapters = await parseFile(selectedFile);
      if (parsedChapters.length === 0) {
        alert('没有从文件中识别到章节。');
        return;
      }

      const work = await createWorkFromFile(selectedFile.name, parsedChapters);
      const units = segmentStoryUnits(parsedChapters).map(unit => ({ ...unit, work_id: work.work_id }));
      setStoryUnits(units);

      alert(`解析成功：已创建作品《${work.title}》，识别到 ${parsedChapters.length} 个章节，切分为 ${units.length} 个剧情单元。`);
    } catch (error) {
      alert(`文件解析失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setParsing(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!hasImportedNovel) {
      alert('请先导入小说原文。导入完成后，可以随时回来选择本地规则、混合模式或 AI 模式继续分析。');
      return;
    }

    if ((analysisMode === 'ai' || analysisMode === 'hybrid') && !featureAccess.aiAnalysis) {
      alert(featureAccess.reason || 'AI 辅助当前不可用。');
      setAnalysisMode('local');
      return;
    }

    if ((analysisMode === 'ai' || analysisMode === 'hybrid') && !isAIConfigured) {
      alert('请先在右上角设置中配置 AI API。');
      return;
    }

    if (analysisMode === 'ai' || analysisMode === 'hybrid') {
      const confirmed = confirm('当前模式会基于已导入原文调用 AI API 并消耗 token。若只是检测导入效果，请先切换到“本地规则”。确定继续吗？');
      if (!confirmed) {
        setAnalysisMode('local');
        return;
      }

      if (currentWork?.analysis_report) {
        const rerunConfirmed = confirm('当前作品已经有分析报告。重跑 AI 会再次消耗 token，并覆盖当前报告。确定继续增强吗？');
        if (!rerunConfirmed) {
          return;
        }
      }
    }

    let aiConfig = undefined;
    if (analysisMode === 'ai' || analysisMode === 'hybrid') {
      aiConfig = loadAIConfig() || undefined;
      if (!aiConfig) {
        alert('已保存的 AI 配置无效，请重新配置。');
        return;
      }
    }

    await startAnalysis({
      mode: analysisMode,
      focus: {
        story_unit: true,
        character: true,
        rhythm: true,
        foreshadow: true,
        map_dungeon: true,
        technique: true,
      },
      ai_config: aiConfig,
      force: Boolean(currentWork?.analysis_report && (analysisMode === 'ai' || analysisMode === 'hybrid')),
    });
  };

  const handleClearLocalData = async () => {
    if (!confirm('确定清空本地保存的作品、章节和知识库吗？此操作不会调用 AI。')) return;

    await clearPersistedData();
    setFile(null);
    alert('本地数据已清空，请重新导入小说。');
  };

  return (
    <div className="import-view">
      <div className="import-page-header">
        <div>
          <span className="page-kicker">Analysis Workspace</span>
          <h2>导入与分析</h2>
          <p>先沉淀原文索引，再按需运行本地规则或 AI 增强，避免重复上传和重复消耗 token。</p>
        </div>
        <div className="page-summary">
          <span>{currentWork ? '当前作品' : '未选择作品'}</span>
          <strong>{currentWork?.title || '等待导入'}</strong>
        </div>
      </div>

      <div className="import-workflow">
        <section className="workflow-panel import-source-panel">
          <div className="workflow-panel-header">
            <div className="workflow-icon">
              <FileUp size={22} />
            </div>
            <div>
              <span className="workflow-step">步骤一</span>
              <h3>导入原文</h3>
            </div>
          </div>
          <p className="workflow-desc">上传 TXT 或 DOCX 后，系统只建立作品、章节和原文证据索引。后续是否使用 AI，可以之后再决定。</p>

          {currentWork && (
            <div className="current-work-card">
              <div>
                <span className="current-work-label">当前作品</span>
                <strong>{currentWork.title}</strong>
              </div>
              <CheckCircle2 size={18} />
            </div>
          )}

          <div className="import-actions">
            <div className="control-with-tip">
              <label className="import-btn">
                <input
                  type="file"
                  accept=".txt,.docx"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                {parsing ? '解析中...' : currentWork ? '重新导入文件' : '选择文件'}
              </label>
              <HelpTip text="导入只会读取本地文件并建立章节索引，不会自动消耗 AI token。重新导入会创建新的当前作品。" />
            </div>

            {currentWork && (
              <div className="control-with-tip">
                <button className="import-btn import-btn-secondary" onClick={handleClearLocalData}>
                  清空本地数据
                </button>
                <HelpTip text="清空当前浏览器本地保存的作品、章节、拆书报告和知识库卡片。" />
              </div>
            )}
          </div>

          {file && (
            <div className="import-file-info">
              <p>已选择：{file.name}</p>
              <p>大小：{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          {chapters.length > 0 && (
            <div className="chapters-preview">
              <h4>识别到 {chapters.length} 个章节</h4>
              <div className="chapter-list">
                {chapters.slice(0, 10).map(chapter => (
                  <div key={chapter.chapter_index} className="chapter-item">
                    {chapter.title} ({chapter.word_count} 字)
                  </div>
                ))}
                {chapters.length > 10 && <div className="chapter-more">+{chapters.length - 10} 章</div>}
              </div>
            </div>
          )}
        </section>

        <section className="workflow-panel analysis-task-panel">
          <div className="workflow-panel-header">
            <div className="workflow-icon">
              <PlayCircle size={22} />
            </div>
            <div>
              <span className="workflow-step">步骤二</span>
              <h3>运行分析任务</h3>
            </div>
          </div>
          <p className="workflow-desc">只要原文已经导入，就可以随时回来重跑本地规则、混合增强或 AI 分析，不需要重新上传小说。</p>

          <div className="analysis-status-strip">
            <div>
              <Database size={16} />
              <span>{hasImportedNovel ? `已载入 ${chapters.length} 章` : '尚未导入原文'}</span>
            </div>
            <div>{storyUnits.length > 0 ? `${storyUnits.length} 个剧情单元` : '等待切分'}</div>
            <div>{analysisCandidates.length > 0 ? `${analysisCandidates.length} 个候选产物` : currentWork?.analysis_report ? '已有分析报告' : '尚未生成报告'}</div>
          </div>

          <div className="analysis-mode-selector">
            <label>分析模式</label>
            <div className="mode-options">
              <button
                className={`mode-btn ${analysisMode === 'local' ? 'active' : ''}`}
                onClick={() => changeAnalysisMode('local')}
              title="仅使用本地规则，速度最快"
            >
                <span>本地预检</span>
                <small>生成候选层</small>
                <HelpTip text="不调用 AI，不消耗 token。适合先检查章节、证据索引和本地技法雏形。" inline />
              </button>
              <button
                className={`mode-btn ${analysisMode === 'hybrid' ? 'active' : ''}`}
                onClick={() => changeAnalysisMode('hybrid')}
                disabled={!featureAccess.aiAnalysis}
              title={featureAccess.aiAnalysis ? '本地规则加 AI 增强，推荐' : 'AI 辅助是付费功能'}
            >
                <span>AI 审核增强</span>
                <small>复用候选层</small>
                <HelpTip text="基于已导入原文先建证据索引，再让 AI 补强创作机制和方法论提炼。会消耗 token。" inline />
              </button>
              <button
                className={`mode-btn ${analysisMode === 'ai' ? 'active' : ''}`}
                onClick={() => changeAnalysisMode('ai')}
                disabled={!featureAccess.aiAnalysis}
              title={featureAccess.aiAnalysis ? '优先使用 AI 分析' : 'AI 辅助是付费功能'}
            >
                <span>深度重拆</span>
                <small>重写核心结果</small>
                <HelpTip text="优先调用 AI 进行理解，成本更高。建议后续用于重点章节、重点技法或二次精修。" inline />
              </button>
            </div>
            {!featureAccess.aiAnalysis && (
              <div className="ai-warning">AI 辅助已接入付费开关；当前免费版仅开放本地规则分析。</div>
            )}
            {!isAIConfigured && (analysisMode === 'ai' || analysisMode === 'hybrid') && (
              <div className="ai-warning">请先点击右上角设置按钮配置 AI API。</div>
            )}
          </div>

          {analysisProgress.status === 'analyzing' && (
            <div className="analysis-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${analysisProgress.percentage}%` }} />
              </div>
              <p>{analysisProgress.current_step}</p>
            </div>
          )}

          {analysisProgress.status === 'error' && (
            <div className="ai-warning">{analysisProgress.error || analysisProgress.current_step}</div>
          )}

          <div className="control-with-tip">
            <button
              className="import-btn import-btn-primary"
              onClick={handleStartAnalysis}
              disabled={!hasImportedNovel || isAnalyzing}
            >
              {isAnalyzing ? '分析中...' : currentWork?.analysis_report ? '重新运行分析' : '开始分析'}
            </button>
            <HelpTip text="开始执行当前分析模式。完成后会保存创作技法、叙事机制、证据索引和方法论报告；可在之后再次运行 AI 增强。" />
          </div>
        </section>

        {storyUnits.length > 0 && (
          <section className="workflow-panel import-preview-panel">
            <div className="workflow-panel-header compact">
              <div>
                <span className="workflow-step">索引预览</span>
                <h3>剧情单元</h3>
              </div>
            </div>
            <div className="units-preview">
              <h4>切分为 {storyUnits.length} 个剧情单元</h4>
              <div className="unit-list">
                {storyUnits.map(unit => (
                  <div key={unit.unit_id} className="unit-item">
                    {unit.title} - {unit.unit_type}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function HelpTip({ text, inline = false }: { text: string; inline?: boolean }) {
  return (
    <span className={`help-tip ${inline ? 'help-tip-inline' : ''}`} data-tooltip={text} aria-label={text}>
      <CircleAlert size={14} />
    </span>
  );
}

function ReportView() {
  const currentWork = useKnowledgeStore(state => state.currentWork);
  const report = currentWork?.analysis_report || '';

  const handleCopy = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    alert('拆书报告已复制。');
  };

  if (!currentWork) {
    return <div className="report-empty">请先导入小说并完成分析。</div>;
  }

  if (!report) {
    return (
      <div className="report-empty">
        <h3>{currentWork.title}</h3>
        <p>当前作品还没有生成拆书报告。请先到「导入分析」执行一次本地规则或 AI 分析。</p>
      </div>
    );
  }

  return (
    <div className="report-view">
      <div className="report-toolbar">
        <div>
          <h3>{currentWork.title} 拆书报告</h3>
          <p>
            {currentWork.analysis_mode || 'unknown'} · {currentWork.analyzed_at ? new Date(currentWork.analyzed_at).toLocaleString() : '未记录时间'}
          </p>
        </div>
        <button className="import-btn" onClick={handleCopy}>复制报告</button>
      </div>
      <pre className="report-content">{report}</pre>
    </div>
  );
}

function AIPanel() {
  const featureAccess = getFeatureAccess();

  if (!featureAccess.aiAssist) {
    return (
      <div className="ai-panel">
        <div className="ai-panel-header">
          <span>AI 助手</span>
          <button className="ai-close-btn">x</button>
        </div>
        <div className="ai-panel-content">
          <div className="ai-message ai-message-ai">
            AI 辅助已预留为付费功能。当前免费版可以继续使用导入、本地切分和知识库整理。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span>AI 助手</span>
        <button className="ai-close-btn">x</button>
      </div>
      <div className="ai-panel-content">
        <div className="ai-quick-actions">
          <button className="ai-action-btn">分析章节</button>
          <button className="ai-action-btn">提取人物</button>
          <button className="ai-action-btn">生成摘要</button>
        </div>
        <div className="ai-messages">
          <div className="ai-message ai-message-user">分析这一章的人物关系</div>
          <div className="ai-message ai-message-ai">选择文本后，我可以帮你做结构化分析。</div>
        </div>
      </div>
      <div className="ai-panel-input">
        <input type="text" placeholder="输入指令..." className="ai-input" />
        <button className="ai-send-btn">发送</button>
      </div>
    </div>
  );
}

export default Workspace;
