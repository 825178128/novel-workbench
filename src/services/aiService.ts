import type { AIConfig, AIAnalysisRequest, AIAnalysisResponse, NetworkStatus, ModelInfo, AIPlatform } from '../types/ai';
import { PLATFORM_PRESETS, RECOMMENDED_MODELS } from '../types/ai';

const OPENAI_COMPATIBLE_PLATFORMS = new Set<AIPlatform>([
  'openai',
  'deepseek',
  'aliyun',
  'baidu',
  'moonshot',
  'zhipu',
  'minimax',
  'stepfun',
  'baichuan',
  'sensenova',
  'mistral',
  'groq',
  'custom',
]);

class AIService {
  private static instance: AIService;
  private config: AIConfig | null = null;
  private networkStatus: NetworkStatus = {
    isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
    lastCheck: new Date(),
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateNetworkStatus(true));
      window.addEventListener('offline', () => this.updateNetworkStatus(false));
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  setConfig(config: AIConfig): void {
    this.config = this.normalizeConfig(config);
  }

  clearConfig(): void {
    this.config = null;
  }

  getConfig(): AIConfig | null {
    return this.config;
  }

  async fetchModels(config: AIConfig): Promise<ModelInfo[]> {
    const normalizedConfig = this.normalizeConfig(config);
    const preset = PLATFORM_PRESETS[normalizedConfig.platform];

    if (OPENAI_COMPATIBLE_PLATFORMS.has(normalizedConfig.platform)) {
      if (normalizedConfig.platform === 'deepseek') {
        return this.getRecommendedModels('deepseek');
      }
      return await this.fetchOpenAICompatibleModels(normalizedConfig);
    }

    switch (normalizedConfig.platform) {
      case 'anthropic':
        return await this.fetchAnthropicModels(normalizedConfig);
      case 'google':
        return await this.fetchGoogleModels(normalizedConfig);
      case 'azure':
        return [{ id: preset.defaultModel, name: preset.defaultModel, description: 'Azure requires a deployment name.', source: 'recommended' }];
      case 'cohere':
        return await this.fetchCohereModels(normalizedConfig);
      case 'tencent':
      case 'huawei':
        return this.getRecommendedModels(normalizedConfig.platform);
      default:
        return [];
    }
  }

  getRecommendedModels(platform: AIPlatform): ModelInfo[] {
    const preset = PLATFORM_PRESETS[platform];
    const recommended = RECOMMENDED_MODELS[platform] || [];

    if (recommended.length > 0) {
      return recommended;
    }

    return preset.defaultModel
      ? [{ id: preset.defaultModel, name: preset.defaultModel, description: preset.description, source: 'recommended' }]
      : [];
  }

  async checkNetworkConnection(): Promise<NetworkStatus> {
    this.networkStatus.isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
    this.networkStatus.lastCheck = new Date();
    return this.networkStatus;
  }

  async validateConfig(config: AIConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(
        {
          platform: config.platform,
          prompt: 'Reply with OK only.',
          systemPrompt: 'You are a connection test assistant.',
          temperature: 0.1,
          maxTokens: 16,
        },
        this.normalizeConfig(config),
      );

      return response.content.trim()
        ? { valid: true }
        : { valid: false, error: 'The API returned an empty response.' };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown API error',
      };
    }
  }

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.config) {
      throw new Error('AI API is not configured. Please configure it first.');
    }

    const systemPrompt = [
      request.systemPrompt || '',
      'Return useful, current, structured analysis for web novel writing.',
    ].filter(Boolean).join('\n\n');

    return this.makeRequest({ ...request, systemPrompt }, this.config);
  }

  private normalizeConfig(config: AIConfig): AIConfig {
    const preset = PLATFORM_PRESETS[config.platform];
    return {
      ...config,
      apiKey: config.apiKey.trim(),
      baseUrl: (config.baseUrl || preset.defaultBaseUrl || '').replace(/\/+$/, '') || undefined,
      model: config.model.trim() || preset.defaultModel,
    };
  }

  private updateNetworkStatus(isOnline: boolean): void {
    this.networkStatus.isOnline = isOnline;
    this.networkStatus.lastCheck = new Date();
  }

  private async fetchOpenAICompatibleModels(config: AIConfig): Promise<ModelInfo[]> {
    const response = await this.fetchWithTimeout(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: this.authHeaders(config),
    }, config.timeout || 10000);

    if (!response.ok) {
      throw new Error(`Failed to fetch models (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return (data.data || [])
      .map((model: { id: string; created?: number }) => ({
        id: model.id,
        name: model.created ? `${model.id} (${this.formatDate(model.created)})` : model.id,
        created: model.created,
        source: 'official' as const,
      }))
      .filter((model: ModelInfo) => this.isChatModel(model.id, config.platform))
      .sort((left: ModelInfo, right: ModelInfo) => (right.created || 0) - (left.created || 0));
  }

  private async fetchAnthropicModels(config: AIConfig): Promise<ModelInfo[]> {
    const response = await this.fetchWithTimeout(`${config.baseUrl}/v1/models`, {
      method: 'GET',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
    }, config.timeout || 10000);

    if (!response.ok) {
      throw new Error(`Failed to fetch models (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return (data.data || []).map((model: { id: string; name?: string }) => ({
      id: model.id,
      name: model.name || model.id,
      source: 'official' as const,
    }));
  }

  private async fetchGoogleModels(config: AIConfig): Promise<ModelInfo[]> {
    const response = await this.fetchWithTimeout(`${config.baseUrl}/models?key=${encodeURIComponent(config.apiKey)}`, {
      method: 'GET',
    }, config.timeout || 10000);

    if (!response.ok) {
      throw new Error(`Failed to fetch models (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return (data.models || [])
      .filter((model: { supportedGenerationMethods?: string[] }) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model: { name: string; displayName?: string; description?: string }) => {
        const id = model.name.replace(/^models\//, '');
        return { id, name: model.displayName || id, description: model.description, source: 'official' as const };
      })
      .sort((left: ModelInfo, right: ModelInfo) => left.id.localeCompare(right.id));
  }

  private async fetchCohereModels(config: AIConfig): Promise<ModelInfo[]> {
    const response = await this.fetchWithTimeout(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: this.authHeaders(config),
    }, config.timeout || 10000);

    if (!response.ok) {
      throw new Error(`Failed to fetch models (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return (data.models || [])
      .filter((model: { endpoints?: string[] }) => model.endpoints?.includes('chat'))
      .map((model: { name: string; endpoints?: string[] }) => ({
        id: model.name,
        name: model.name,
        description: model.endpoints?.join(', '),
        source: 'official' as const,
      }));
  }

  private async makeRequest(request: AIAnalysisRequest, config: AIConfig): Promise<AIAnalysisResponse> {
    let response: Response;

    if (OPENAI_COMPATIBLE_PLATFORMS.has(config.platform)) {
      response = await this.callOpenAICompatible(request, config);
    } else {
      switch (config.platform) {
        case 'anthropic':
          response = await this.callAnthropic(request, config);
          break;
        case 'google':
          response = await this.callGoogle(request, config);
          break;
        case 'cohere':
          response = await this.callCohere(request, config);
          break;
        case 'azure':
          throw new Error('Azure OpenAI needs a deployment-specific endpoint and is not enabled yet.');
        case 'tencent':
        case 'huawei':
          throw new Error(`${PLATFORM_PRESETS[config.platform].name} is listed but not implemented yet.`);
        default:
          throw new Error(`Unsupported AI platform: ${config.platform}`);
      }
    }

    if (!response.ok) {
      throw new Error(`API request failed (${response.status}): ${await response.text()}`);
    }

    return this.parseResponse(await response.json(), config);
  }

  private callOpenAICompatible(request: AIAnalysisRequest, config: AIConfig): Promise<Response> {
    const body: Record<string, unknown> = {
      model: config.model,
      messages: [
        { role: 'system', content: request.systemPrompt || 'You are a professional web novel writing assistant.' },
        { role: 'user', content: request.prompt },
      ],
      max_tokens: request.maxTokens ?? config.maxTokens ?? 4000,
    };

    if (config.platform === 'deepseek') {
      body.thinking = { type: 'disabled' };
    } else {
      body.temperature = request.temperature ?? config.temperature ?? 0.7;
    }

    return this.fetchWithTimeout(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.authHeaders(config),
      body: JSON.stringify(body),
    }, config.timeout || 60000);
  }

  private callAnthropic(request: AIAnalysisRequest, config: AIConfig): Promise<Response> {
    return this.fetchWithTimeout(`${config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        system: request.systemPrompt || 'You are a professional web novel writing assistant.',
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4000,
        temperature: request.temperature ?? config.temperature ?? 0.7,
      }),
    }, config.timeout || 60000);
  }

  private callGoogle(request: AIAnalysisRequest, config: AIConfig): Promise<Response> {
    return this.fetchWithTimeout(`${config.baseUrl}/models/${config.model}:generateContent?key=${encodeURIComponent(config.apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${request.systemPrompt || ''}\n\n${request.prompt}` }] }],
        generationConfig: {
          temperature: request.temperature ?? config.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? config.maxTokens ?? 4000,
        },
      }),
    }, config.timeout || 60000);
  }

  private callCohere(request: AIAnalysisRequest, config: AIConfig): Promise<Response> {
    return this.fetchWithTimeout(`${config.baseUrl}/chat`, {
      method: 'POST',
      headers: this.authHeaders(config),
      body: JSON.stringify({
        model: config.model,
        message: request.prompt,
        preamble: request.systemPrompt || 'You are a professional web novel writing assistant.',
        temperature: request.temperature ?? config.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4000,
      }),
    }, config.timeout || 60000);
  }

  private async fetchWithTimeout(url: string, init: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms.`, { cause: error });
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private authHeaders(config: AIConfig): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    };
  }

  private parseResponse(data: unknown, config: AIConfig): AIAnalysisResponse {
    const responseData = data as {
      choices?: Array<{ finish_reason?: string; message?: { content?: string; reasoning_content?: string } }>;
      content?: Array<{ text?: string }>;
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      text?: string;
      message?: { content?: Array<{ text?: string }> };
      usage?: {
        prompt_tokens?: number;
        input_tokens?: number;
        completion_tokens?: number;
        output_tokens?: number;
        total_tokens?: number;
      };
    };
    let content = '';
    let usage;

    if (OPENAI_COMPATIBLE_PLATFORMS.has(config.platform)) {
      content = responseData.choices?.[0]?.message?.content || '';
      usage = responseData.usage;
      if (!content && responseData.choices?.[0]?.finish_reason) {
        content = responseData.choices[0].message?.reasoning_content ? '' : content;
      }
    } else if (config.platform === 'anthropic') {
      content = responseData.content?.[0]?.text || '';
      usage = responseData.usage;
    } else if (config.platform === 'google') {
      content = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (config.platform === 'cohere') {
      content = responseData.text || responseData.message?.content?.[0]?.text || '';
    }

    return {
      content,
      usage: usage ? {
        promptTokens: usage.prompt_tokens || usage.input_tokens || 0,
        completionTokens: usage.completion_tokens || usage.output_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      } : undefined,
      model: config.model,
      timestamp: new Date(),
    };
  }

  private formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private isChatModel(modelId: string, platform: AIPlatform): boolean {
    if (platform !== 'openai') {
      return true;
    }

    const excludedPrefixes = [
      'text-embedding',
      'text-moderation',
      'omni-moderation',
      'tts-',
      'whisper',
      'dall-e',
      'gpt-image',
      'chatgpt-image',
      'sora',
    ];
    const excludedFragments = ['transcribe', 'realtime', 'audio', 'search-preview', 'computer-use'];

    return !excludedPrefixes.some(prefix => modelId.startsWith(prefix))
      && !excludedFragments.some(fragment => modelId.includes(fragment));
  }
}

export const aiService = AIService.getInstance();
