export type AIPlatform =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'deepseek'
  | 'azure'
  | 'mistral'
  | 'cohere'
  | 'groq'
  | 'aliyun'
  | 'baidu'
  | 'tencent'
  | 'huawei'
  | 'moonshot'
  | 'zhipu'
  | 'minimax'
  | 'stepfun'
  | 'baichuan'
  | 'sensenova'
  | 'custom';

export interface PlatformInfo {
  name: string;
  icon: string;
  apiApplyUrl: string;
  defaultBaseUrl: string;
  defaultModel: string;
  modelListEndpoint?: string;
  description: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  created?: number;
  source?: 'official' | 'recommended';
}

export interface AIConfig {
  platform: AIPlatform;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export const PLATFORM_PRESETS: Record<AIPlatform, PlatformInfo> = {
  openai: {
    name: 'OpenAI',
    icon: '●',
    apiApplyUrl: 'https://platform.openai.com/api-keys',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    modelListEndpoint: '/models',
    description: 'OpenAI chat models such as GPT-4o.',
  },
  anthropic: {
    name: 'Anthropic',
    icon: '◆',
    apiApplyUrl: 'https://console.anthropic.com/settings/keys',
    defaultBaseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    modelListEndpoint: '/v1/models',
    description: 'Claude models using the Anthropic Messages API.',
  },
  google: {
    name: 'Google Gemini',
    icon: 'G',
    apiApplyUrl: 'https://aistudio.google.com/apikey',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.0-flash',
    modelListEndpoint: '/models',
    description: 'Gemini models using the Google Generative Language API.',
  },
  deepseek: {
    name: 'DeepSeek',
    icon: 'D',
    apiApplyUrl: 'https://platform.deepseek.com/api_keys',
    defaultBaseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-v4-flash',
    modelListEndpoint: '/models',
    description: 'DeepSeek V4 models with OpenAI-compatible endpoints.',
  },
  azure: {
    name: 'Azure OpenAI',
    icon: 'A',
    apiApplyUrl: 'https://azure.microsoft.com/products/ai-services/openai-service',
    defaultBaseUrl: 'https://{resource}.openai.azure.com',
    defaultModel: 'gpt-4o',
    modelListEndpoint: '/openai/models?api-version=2024-06-01',
    description: 'Azure-hosted OpenAI models. Requires deployment-specific support.',
  },
  mistral: {
    name: 'Mistral AI',
    icon: 'M',
    apiApplyUrl: 'https://console.mistral.ai/api-keys/',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    modelListEndpoint: '/models',
    description: 'Mistral chat models with OpenAI-compatible endpoints.',
  },
  cohere: {
    name: 'Cohere',
    icon: 'C',
    apiApplyUrl: 'https://dashboard.cohere.com/api-keys',
    defaultBaseUrl: 'https://api.cohere.ai/v1',
    defaultModel: 'command-r-plus',
    modelListEndpoint: '/models',
    description: 'Cohere chat models.',
  },
  groq: {
    name: 'Groq',
    icon: 'Q',
    apiApplyUrl: 'https://console.groq.com/keys',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    modelListEndpoint: '/models',
    description: 'Fast OpenAI-compatible inference for supported open models.',
  },
  aliyun: {
    name: '阿里云百炼',
    icon: 'Ali',
    apiApplyUrl: 'https://bailian.console.aliyun.com/',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-max',
    modelListEndpoint: '/models',
    description: '通义千问 Qwen 系列，OpenAI-compatible 模式。',
  },
  baidu: {
    name: '百度千帆',
    icon: 'Baidu',
    apiApplyUrl: 'https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application',
    defaultBaseUrl: 'https://qianfan.baidubce.com/v2',
    defaultModel: 'ernie-4.0-8k',
    modelListEndpoint: '/models',
    description: '文心 ERNIE 系列，部分接口兼容 OpenAI 格式。',
  },
  tencent: {
    name: '腾讯混元',
    icon: 'T',
    apiApplyUrl: 'https://cloud.tencent.com/product/hunyuan',
    defaultBaseUrl: 'https://hunyuan.tencentcloudapi.com',
    defaultModel: 'hunyuan-standard',
    description: '腾讯混元模型，需要独立适配。',
  },
  huawei: {
    name: '华为盘古',
    icon: 'H',
    apiApplyUrl: 'https://www.huaweicloud.com/product/pangu.html',
    defaultBaseUrl: 'https://pangu.huaweicloud.com/v1',
    defaultModel: 'pangu-7b',
    description: '华为盘古模型，需要独立适配。',
  },
  moonshot: {
    name: '月之暗面 Kimi',
    icon: 'K',
    apiApplyUrl: 'https://platform.moonshot.cn/console/api-keys',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    modelListEndpoint: '/models',
    description: 'Kimi Moonshot models with OpenAI-compatible endpoints.',
  },
  zhipu: {
    name: '智谱清言',
    icon: 'Z',
    apiApplyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
    modelListEndpoint: '/models',
    description: 'GLM 系列模型，OpenAI-compatible 接口。',
  },
  minimax: {
    name: 'MiniMax',
    icon: 'Min',
    apiApplyUrl: 'https://platform.minimaxi.com/user-center/basicInformation/interface-key',
    defaultBaseUrl: 'https://api.minimax.chat/v1',
    defaultModel: 'abab6.5-chat',
    modelListEndpoint: '/models',
    description: 'MiniMax chat models.',
  },
  stepfun: {
    name: '阶跃星辰',
    icon: 'Step',
    apiApplyUrl: 'https://platform.stepfun.com/interface-key',
    defaultBaseUrl: 'https://api.stepfun.com/v1',
    defaultModel: 'step-1-32k',
    modelListEndpoint: '/models',
    description: 'Step 系列模型，OpenAI-compatible 接口。',
  },
  baichuan: {
    name: '百川智能',
    icon: 'BC',
    apiApplyUrl: 'https://platform.baichuan-ai.com/console/apikey',
    defaultBaseUrl: 'https://api.baichuan-ai.com/v1',
    defaultModel: 'Baichuan4',
    modelListEndpoint: '/models',
    description: 'Baichuan chat models.',
  },
  sensenova: {
    name: '商汤日日新',
    icon: 'SN',
    apiApplyUrl: 'https://console.sensenova.cn/',
    defaultBaseUrl: 'https://api.sensenova.cn/v1',
    defaultModel: 'SenseChat-5',
    modelListEndpoint: '/models',
    description: 'SenseNova chat models.',
  },
  custom: {
    name: '自定义',
    icon: '*',
    apiApplyUrl: '',
    defaultBaseUrl: '',
    defaultModel: '',
    description: '兼容 OpenAI chat/completions 格式的自定义 API。',
  },
};

export const RECOMMENDED_MODELS: Partial<Record<AIPlatform, ModelInfo[]>> = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: '稳定通用模型，适合网文拆解。', source: 'recommended' },
    { id: 'gpt-4o-mini', name: 'GPT-4o mini', description: '低成本快速模型。', source: 'recommended' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: '强文本理解模型。', source: 'recommended' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 mini', description: '速度和成本更均衡。', source: 'recommended' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: '适合长文本理解和结构化分析。', source: 'recommended' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: '稳定通用 Claude 模型。', source: 'recommended' },
  ],
  google: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: '快速通用模型。', source: 'recommended' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '长上下文模型。', source: 'recommended' },
  ],
  deepseek: [
    { id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', description: '当前官方模型，支持非思考与思考模式，适合高性价比拆书。', source: 'recommended' },
    { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', description: '当前官方模型，适合复杂剧情结构分析。', source: 'recommended' },
  ],
  moonshot: [
    { id: 'moonshot-v1-8k', name: 'moonshot-v1-8k', source: 'recommended' },
    { id: 'moonshot-v1-32k', name: 'moonshot-v1-32k', source: 'recommended' },
    { id: 'moonshot-v1-128k', name: 'moonshot-v1-128k', source: 'recommended' },
  ],
  zhipu: [
    { id: 'glm-4', name: 'GLM-4', source: 'recommended' },
    { id: 'glm-4-flash', name: 'GLM-4 Flash', source: 'recommended' },
  ],
  aliyun: [
    { id: 'qwen-max', name: 'Qwen Max', source: 'recommended' },
    { id: 'qwen-plus', name: 'Qwen Plus', source: 'recommended' },
    { id: 'qwen-turbo', name: 'Qwen Turbo', source: 'recommended' },
  ],
  baidu: [
    { id: 'ernie-4.0-8k', name: 'ERNIE 4.0 8K', source: 'recommended' },
  ],
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large Latest', source: 'recommended' },
    { id: 'mistral-small-latest', name: 'Mistral Small Latest', source: 'recommended' },
  ],
  cohere: [
    { id: 'command-r-plus', name: 'Command R+', source: 'recommended' },
    { id: 'command-r', name: 'Command R', source: 'recommended' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', source: 'recommended' },
  ],
};

export type AnalysisMode = 'local' | 'ai' | 'hybrid';

export interface AIAnalysisRequest {
  platform: AIPlatform;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIAnalysisResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  timestamp: Date;
}

export interface NetworkStatus {
  isOnline: boolean;
  latency?: number;
  lastCheck: Date;
}
