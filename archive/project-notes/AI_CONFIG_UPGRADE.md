# AI API配置功能升级说明

## 🎉 新功能概览

AI配置面板已完全重新设计,现在支持**8个主流AI平台**和**动态模型获取**功能!

---

## ✨ 核心改进

### 1. **平台覆盖范围扩大** (4个 → 9个)

#### 国际平台 (4个)
- ✅ **OpenAI** - GPT-4o, GPT-4 Turbo等
- ✅ **Anthropic** - Claude 3.5 Sonnet, Opus等
- ✅ **Google** - Gemini 2.0, Pro等
- ✅ **Microsoft Azure OpenAI** - 微软Azure托管的OpenAI模型

#### 国内平台 (4个)
- ✅ **阿里云百炼** - 通义千问Qwen系列
- ✅ **百度千帆** - 文心一言ERNIE系列
- ✅ **腾讯混元** - 混元Standard, Pro等
- ✅ **华为盘古** - 盘古大模型系列

#### 其他
- ✅ **自定义** - 兼容OpenAI格式的其他API

---

### 2. **平台选择方式优化**

**旧版**: 按钮网格选择 (占用空间大)  
**新版**: 下拉选择菜单 (简洁高效)

- 📋 下拉框显示: `图标 + 平台名称 + 描述`
- 💡 选择后下方显示平台详细描述
- 🎨 更紧凑的布局,更多空间用于配置

---

### 3. **🔑 获取API按钮** (新增!)

每个平台旁边都有**"获取API"**按钮:

```
[选择AI平台 ▼]  [🔑 获取API]
```

**点击后**:
- 自动在**新标签页**打开该平台的官方API申请页面
- 方便用户快速注册和获取API Key
- 无需手动搜索和记住申请链接

**各平台申请地址**:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google: https://aistudio.google.com/apikey
- Azure: https://azure.microsoft.com/products/ai-services/openai-service
- 阿里云: https://bailian.console.aliyun.com/
- 百度: https://console.bce.baidu.com/qianfan/...
- 腾讯: https://cloud.tencent.com/product/hunyuan
- 华为: https://www.huaweicloud.com/product/pangu.html

---

### 4. **🔄 动态获取模型列表** (核心新功能!)

#### 工作流程:
```
1. 选择平台
2. 输入API Key
3. 点击"获取可用模型列表"按钮
4. 系统实时联网获取该平台的最新模型
5. 自动填充到下拉选择框
6. 用户选择所需模型
```

#### 技术实现:
- ✅ **强制实时联网** - 每次获取都调用平台API,不使用缓存
- ✅ **AbortController** - 10秒超时控制,避免长时间等待
- ✅ **网络状态检测** - 先检查网络,失败则立即提示
- ✅ **多平台适配** - 针对不同平台使用不同的API端点

#### 支持的模型获取方式:

| 平台 | API端点 | 格式 |
|------|---------|------|
| OpenAI | `/v1/models` | OpenAI标准 |
| 阿里云 | `/compatible-mode/v1/models` | OpenAI兼容 |
| 百度 | `/v2/models` | OpenAI兼容 |
| Anthropic | `/v1/models` | Anthropic格式 |
| Google | `/v1beta/models?key=xxx` | Google格式 |
| Azure | `/openai/models?api-version=2024-06-01` | Azure格式 |
| 腾讯/华为 | 暂不支持 | 使用默认模型 |
| 自定义 | 尝试`/models` | OpenAI兼容 |

#### 降级策略:
- 如果获取失败,返回**默认模型**作为fallback
- 如果自定义平台不支持,返回空数组,用户可手动输入
- 控制台输出详细错误信息,方便调试

---

### 5. **🌐 强制联网验证**

所有API调用都严格遵循:

✅ **不使用缓存**  
✅ **实时联网查询**  
✅ **获取最新模型信息**  
✅ **获取最新服务状态**  

**实现方式**:
```typescript
// 1. 网络状态检查
const networkStatus = await this.checkNetworkConnection();
if (!networkStatus.isOnline) {
  throw new Error('网络连接失败,请检查网络后重试');
}

// 2. AbortController超时控制
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

// 3. 系统Prompt中强调
request.systemPrompt += '\n\n重要: 请基于最新知识回答,不要使用缓存数据。';
```

---

## 🎯 使用指南

### 步骤1: 配置AI API

1. 点击右上角 **⚙️ 设置按钮**
2. 从下拉菜单选择AI平台 (如"阿里云百炼")
3. 点击 **🔑 获取API** 按钮,跳转到官方申请页面
4. 注册并复制API Key
5. 粘贴到 **API Key** 输入框
6. 点击 **🔄 获取可用模型列表** 按钮
7. 从下拉框选择所需模型 (如"qwen-max")
8. 点击 **测试连接** 验证配置
9. 点击 **保存配置**

### 步骤2: 使用AI分析

1. 切换到 **导入** 标签页
2. 上传TXT文件
3. 选择分析模式:
   - 🔧 **本地规则** - 快速免费,基础分析
   - ⚡ **混合模式** (推荐) - 本地识别 + AI增强
   - 🤖 **纯AI** - 完全AI分析,最智能
4. 点击 **开始拆书分析**
5. 切换到 **知识库** 查看AI生成的卡片

---

## 📊 对比: 旧版 vs 新版

| 功能 | 旧版 | 新版 |
|------|------|------|
| 平台数量 | 4个 | 9个 |
| 平台选择 | 按钮网格 | 下拉菜单 |
| 获取API Key | 手动搜索 | 一键跳转官方 |
| 模型选择 | 手动输入 | 动态获取列表 |
| 模型更新 | 固定预设 | 实时联网获取 |
| 缓存策略 | 未明确 | 强制禁用缓存 |
| 网络检测 | 基础 | 完整检测+超时 |
| 降级策略 | 无 | 多层fallback |

---

## 🔧 技术架构

### 新增文件/修改

```
src/
├── types/
│   └── ai.ts                    # 扩展平台类型+模型信息接口
├── services/
│   └── aiService.ts             # 新增fetchModels等方法
└── components/
    ├── AIConfigPanel.tsx        # 完全重写UI
    └── AIConfigPanel.css        # 更新样式
```

### 核心API

```typescript
// 获取平台可用模型列表(实时联网)
async fetchModels(config: AIConfig): Promise<ModelInfo[]>

// OpenAI兼容格式
private async fetchOpenAICompatibleModels(...)

// Anthropic格式
private async fetchAnthropicModels(...)

// Google格式
private async fetchGoogleModels(...)

// Azure格式
private async fetchAzureModels(...)
```

---

## ⚠️ 注意事项

1. **API Key安全**
   - 仅保存在浏览器localStorage
   - 不会上传到任何服务器
   - 建议定期更换

2. **网络要求**
   - 必须保持联网状态
   - 国内平台访问速度更快
   - 国际平台可能需要代理

3. **模型获取限制**
   - 腾讯混元/华为盘古暂不支持动态获取
   - 自定义平台尝试OpenAI兼容格式
   - 获取失败可手动输入模型名

4. **费用提醒**
   - API调用会产生费用
   - 建议先用免费额度测试
   - 混合模式可降低成本

---

## 🚀 下一步计划

- [ ] 支持腾讯混元动态获取模型
- [ ] 支持华为盘古动态获取模型
- [ ] 添加模型收藏功能
- [ ] 添加模型使用统计
- [ ] 支持批量测试多个模型

---

**更新时间**: 2026-05-22  
**版本**: v2.0  
**状态**: ✅ 已完成并测试
