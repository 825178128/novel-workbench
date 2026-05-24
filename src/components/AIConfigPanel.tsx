import { useCallback, useEffect, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import { clearAIConfig, loadAIConfig } from '../services/aiConfigStorage';
import { getFeatureAccess } from '../services/featureAccess';
import { PLATFORM_PRESETS } from '../types/ai';
import type { AIConfig, AIPlatform, ModelInfo } from '../types/ai';
import './AIConfigPanel.css';

interface AIConfigPanelProps {
  onClose: () => void;
  onSave: (config: AIConfig) => void;
  onClear: () => void;
}

const CHAT_SUPPORTED_PLATFORMS = new Set<AIPlatform>([
  'openai',
  'anthropic',
  'google',
  'deepseek',
  'mistral',
  'cohere',
  'groq',
  'aliyun',
  'baidu',
  'moonshot',
  'zhipu',
  'minimax',
  'stepfun',
  'baichuan',
  'sensenova',
  'custom',
]);

const INTERNATIONAL_PLATFORMS: AIPlatform[] = ['openai', 'anthropic', 'google', 'deepseek', 'azure', 'mistral', 'cohere', 'groq'];
const CHINA_PLATFORMS: AIPlatform[] = ['aliyun', 'baidu', 'tencent', 'huawei', 'moonshot', 'zhipu', 'minimax', 'stepfun', 'baichuan', 'sensenova'];

function initialConfig(): AIConfig {
  const savedConfig = loadAIConfig();

  return savedConfig || {
    platform: 'deepseek',
    apiKey: '',
    baseUrl: '',
    model: PLATFORM_PRESETS.deepseek.defaultModel,
  };
}

export function AIConfigPanel({ onClose, onSave, onClear }: AIConfigPanelProps) {
  const [formConfig] = useState(initialConfig);
  const [platform, setPlatform] = useState<AIPlatform>(formConfig.platform);
  const [apiKey, setApiKey] = useState(formConfig.apiKey);
  const [baseUrl, setBaseUrl] = useState(formConfig.baseUrl || '');
  const [model, setModel] = useState(formConfig.model || PLATFORM_PRESETS[formConfig.platform].defaultModel);
  const [models, setModels] = useState<ModelInfo[]>(() => aiService.getRecommendedModels(formConfig.platform));
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelSource, setModelSource] = useState<'official' | 'recommended' | 'empty'>(() => {
    return aiService.getRecommendedModels(formConfig.platform).length > 0 ? 'recommended' : 'empty';
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const fetchSequence = useRef(0);

  const preset = PLATFORM_PRESETS[platform];
  const isSupported = CHAT_SUPPORTED_PLATFORMS.has(platform);
  const featureAccess = getFeatureAccess();

  const currentConfig = (): AIConfig => ({
    platform,
    apiKey: apiKey.trim(),
    baseUrl: baseUrl.trim() || undefined,
    model: model.trim() || preset.defaultModel,
  });

  const applyRecommendedModels = useCallback((targetPlatform: AIPlatform, preferredModel?: string) => {
    const recommendedModels = aiService.getRecommendedModels(targetPlatform);
    setModels(recommendedModels);
    setModelSource(recommendedModels.length > 0 ? 'recommended' : 'empty');
    setModel(preferredModel || recommendedModels[0]?.id || PLATFORM_PRESETS[targetPlatform].defaultModel);
  }, []);

  const fetchModelsForConfig = useCallback(async (config: AIConfig, options?: { silent?: boolean; preferredModel?: string }) => {
    const requestId = ++fetchSequence.current;

    if (!featureAccess.aiConfig) {
      setTestResult({ success: false, message: featureAccess.reason || 'AI 配置当前不可用。' });
      return;
    }

    if (!config.apiKey.trim()) {
      applyRecommendedModels(config.platform, options?.preferredModel);
      if (!options?.silent) {
        setTestResult({ success: false, message: '填写 API Key 后会自动获取该平台的官方模型列表。' });
      }
      return;
    }

    if (config.platform === 'custom' && !config.baseUrl?.trim()) {
      applyRecommendedModels(config.platform, options?.preferredModel);
      if (!options?.silent) {
        setTestResult({ success: false, message: '自定义平台需要填写 API Base URL 后才能获取模型。' });
      }
      return;
    }

    setLoadingModels(true);
    if (!options?.silent) {
      setTestResult(null);
    }

    try {
      const fetchedModels = await aiService.fetchModels(config);
      if (requestId !== fetchSequence.current) return;

      setModels(fetchedModels);
      setModelSource(fetchedModels.length > 0 ? 'official' : 'empty');

      const nextModel = options?.preferredModel && fetchedModels.some(item => item.id === options.preferredModel)
        ? options.preferredModel
        : fetchedModels[0]?.id || config.model;
      setModel(nextModel);

      setTestResult({
        success: fetchedModels.length > 0,
        message: fetchedModels.length > 0 ? `已从官方接口获取 ${fetchedModels.length} 个可用模型。` : '官方接口未返回可用聊天模型。',
      });
    } catch (error) {
      if (requestId !== fetchSequence.current) return;

      applyRecommendedModels(config.platform, options?.preferredModel);
      setTestResult({
        success: false,
        message: `官方模型列表获取失败，已切换为内置推荐。${error instanceof Error ? error.message : ''}`,
      });
    } finally {
      if (requestId === fetchSequence.current) {
        setLoadingModels(false);
      }
    }
  }, [applyRecommendedModels, featureAccess.aiConfig, featureAccess.reason]);

  useEffect(() => {
    const config: AIConfig = {
      platform,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined,
      model: model.trim() || PLATFORM_PRESETS[platform].defaultModel,
    };

    const timer = window.setTimeout(() => {
      void fetchModelsForConfig(config, { silent: true, preferredModel: model });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [apiKey, baseUrl, fetchModelsForConfig, model, platform]);

  const handlePlatformChange = (newPlatform: AIPlatform) => {
    const nextPreset = PLATFORM_PRESETS[newPlatform];
    setPlatform(newPlatform);
    setBaseUrl('');
    applyRecommendedModels(newPlatform, nextPreset.defaultModel);
    setTestResult(null);
  };

  const handleOpenApiApply = () => {
    if (preset.apiApplyUrl) {
      window.open(preset.apiApplyUrl, '_blank');
    }
  };

  const handleFetchModels = async () => {
    await fetchModelsForConfig(currentConfig());
  };

  const handleTestConnection = async () => {
    if (!featureAccess.aiConfig) {
      setTestResult({ success: false, message: featureAccess.reason || 'AI 配置当前不可用。' });
      return;
    }

    if (!isSupported) {
      setTestResult({ success: false, message: `${preset.name} 已列为预设，但当前还没有接入聊天调用。` });
      return;
    }

    if (!apiKey.trim()) {
      setTestResult({ success: false, message: '请填写 API Key。' });
      return;
    }

    if (!model.trim() && !preset.defaultModel) {
      setTestResult({ success: false, message: '请填写模型名。' });
      return;
    }

    if (!confirm('测试连接会调用一次 AI API 并消耗少量 token。确定继续吗？')) {
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await aiService.validateConfig(currentConfig());
    setTesting(false);
    setTestResult({
      success: result.valid,
      message: result.error || '连接成功。',
    });
  };

  const handleSave = () => {
    if (!featureAccess.aiConfig) {
      alert(featureAccess.reason || 'AI 配置当前不可用。');
      return;
    }

    if (!isSupported) {
      alert(`${preset.name} 当前还没有接入聊天调用。`);
      return;
    }

    if (!apiKey.trim()) {
      alert('请填写 API Key。');
      return;
    }

    if (!model.trim() && !preset.defaultModel) {
      alert('请填写模型名。');
      return;
    }

    onSave(currentConfig());
    alert('AI 配置已保存。');
    onClose();
  };

  const handleClear = () => {
    if (!confirm('确定清除已保存的 AI 配置吗？')) return;

    clearAIConfig();
    aiService.clearConfig();
    setPlatform('deepseek');
    setApiKey('');
    setBaseUrl('');
    applyRecommendedModels('deepseek', PLATFORM_PRESETS.deepseek.defaultModel);
    setTestResult(null);
    onClear();
  };

  return (
    <div className="ai-config-overlay" onClick={onClose}>
      <div className="ai-config-panel" onClick={event => event.stopPropagation()}>
        <div className="ai-config-header">
          <h3>AI API 配置</h3>
          <button className="ai-config-close" onClick={onClose}>x</button>
        </div>

        {apiKey && (
          <div className="config-status">
            <span className="status-dot"></span>
            <span>已配置：<strong>{preset.name}</strong> - {model || preset.defaultModel}</span>
            <button className="btn-clear-config" onClick={handleClear} title="清除配置">
              清除
            </button>
          </div>
        )}

        {!featureAccess.aiConfig && (
          <div className="test-result error">
            AI 辅助已预留为付费功能。当前免费版不会启用 API 配置、连接测试或 AI 分析。
          </div>
        )}

        <div className="ai-config-content">
          <div className="form-field">
            <label>AI 平台</label>
            <div className="platform-select-wrapper">
              <select value={platform} onChange={event => handlePlatformChange(event.target.value as AIPlatform)} className="platform-select">
                <optgroup label="国际平台">
                  {INTERNATIONAL_PLATFORMS.map(key => (
                    <option key={key} value={key}>{PLATFORM_PRESETS[key].name}</option>
                  ))}
                </optgroup>
                <optgroup label="国内平台">
                  {CHINA_PLATFORMS.map(key => (
                    <option key={key} value={key}>{PLATFORM_PRESETS[key].name}</option>
                  ))}
                </optgroup>
                <optgroup label="其他">
                  <option value="custom">{PLATFORM_PRESETS.custom.name}</option>
                </optgroup>
              </select>
              {preset.apiApplyUrl && (
                <button className="btn-apply-api" onClick={handleOpenApiApply} title="打开 API Key 申请页面">
                  获取 Key
                </button>
              )}
            </div>
            <div className="platform-description">{preset.description}</div>
            {!isSupported && (
              <div className="test-result error">该平台目前仅有预设信息，聊天调用还未接入。</div>
            )}
          </div>

          <div className="form-field">
            <label>API Key</label>
            <input type="password" value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder="输入你的 API Key" className="api-key-input" />
          </div>

          <div className="form-field">
            <label>API Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={event => setBaseUrl(event.target.value)}
              placeholder={preset.defaultBaseUrl || 'https://your-api.example.com/v1'}
              className="base-url-input"
            />
            <div className="field-hint">留空使用默认地址：{preset.defaultBaseUrl || '自定义平台必须填写'}</div>
          </div>

          <div className="form-field">
            <label>模型名</label>
            <select
              value={model}
              onChange={event => setModel(event.target.value)}
              className="model-select"
              disabled={loadingModels || models.length === 0}
            >
              {models.length === 0 && <option value={model}>{model || '暂无可选模型'}</option>}
              {models.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name || item.id}
                </option>
              ))}
            </select>
            <div className="field-hint">
              {loadingModels && '正在获取官方模型列表...'}
              {!loadingModels && modelSource === 'official' && '模型列表来自平台官方接口。'}
              {!loadingModels && modelSource === 'recommended' && '当前为内置推荐模型，保存前建议点击“刷新模型”。'}
              {!loadingModels && modelSource === 'empty' && '暂无可选模型，请检查 API Key 或 Base URL。'}
            </div>
          </div>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>{testResult.message}</div>
          )}

          <div className="ai-config-actions">
            <button className="btn-test" onClick={handleFetchModels} disabled={loadingModels || !apiKey.trim() || !featureAccess.aiConfig}>
              {loadingModels ? '获取中...' : '获取模型'}
            </button>
            <button className="btn-test" onClick={handleTestConnection} disabled={testing || !apiKey.trim() || !isSupported || !featureAccess.aiConfig}>
              {testing ? '测试中...' : '测试连接'}
            </button>
            <button className="btn-save" onClick={handleSave} disabled={!isSupported || !featureAccess.aiConfig}>
              保存配置
            </button>
          </div>

          <div className="ai-config-tips">
            <h4>提示</h4>
            <ul>
              <li>API Key 当前只保存在浏览器 localStorage。</li>
              <li>DeepSeek 默认使用 https://api.deepseek.com/v1。</li>
              <li>OpenAI-compatible 平台统一调用 /chat/completions。</li>
              <li>Azure、腾讯、华为仍需要单独适配。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
