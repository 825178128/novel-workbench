import type { AIConfig } from '../types/ai';
import { PLATFORM_PRESETS } from '../types/ai';

const AI_CONFIG_KEY = 'ai_config';

export function loadAIConfig(): AIConfig | null {
  const rawConfig = localStorage.getItem(AI_CONFIG_KEY);
  if (!rawConfig) {
    return null;
  }

  try {
    const config = JSON.parse(rawConfig) as Partial<AIConfig>;
    if (!config.platform || !config.apiKey || !config.model) {
      throw new Error('Incomplete AI config');
    }

    if (!PLATFORM_PRESETS[config.platform]) {
      throw new Error('Unsupported AI platform');
    }

    return {
      platform: config.platform,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      timeout: config.timeout,
    };
  } catch (error) {
    console.error('加载 AI 配置失败:', error);
    clearAIConfig();
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

export function clearAIConfig(): void {
  localStorage.removeItem(AI_CONFIG_KEY);
}

export function hasAIConfig(): boolean {
  return loadAIConfig() !== null;
}
