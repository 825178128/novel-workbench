# AI平台完整支持列表

## 📊 总览

现已支持 **19个主流AI平台**,覆盖国际和国内80%以上的AI服务商!

---

## 🌍 国际主流平台 (8个)

### 1. 🟢 OpenAI
- **平台**: OpenAI
- **API申请**: https://platform.openai.com/api-keys
- **默认地址**: https://api.openai.com/v1
- **热门模型**: 
  - gpt-4o (最新旗舰)
  - gpt-4o-mini (性价比)
  - gpt-4-turbo
  - gpt-3.5-turbo
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: 最强通用AI,多模态支持

---

### 2. 🟠 Anthropic
- **平台**: Anthropic Claude
- **API申请**: https://console.anthropic.com/settings/keys
- **默认地址**: https://api.anthropic.com
- **热门模型**:
  - claude-3-5-sonnet-20241022 (推荐)
  - claude-3-opus-20240229
  - claude-3-haiku-20240307
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: 长上下文,安全性高,代码能力强

---

### 3. 🔵 Google
- **平台**: Google Gemini
- **API申请**: https://aistudio.google.com/apikey
- **默认地址**: https://generativelanguage.googleapis.com/v1beta
- **热门模型**:
  - gemini-2.0-flash (最新)
  - gemini-1.5-pro
  - gemini-1.5-flash
- **模型获取**: ✅ 支持动态获取 (`/v1beta/models`)
- **特色**: 免费额度高,多模态强

---

### 4. 🌊 DeepSeek (深度求索) ⭐新增
- **平台**: DeepSeek
- **API申请**: https://platform.deepseek.com/api_keys
- **默认地址**: https://api.deepseek.com/v1
- **热门模型**:
  - deepseek-chat (V3版本)
  - deepseek-reasoner (R1推理版)
  - deepseek-coder (代码专用)
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: 国产最强,性价比高,代码能力突出

---

### 5. 🔷 Azure OpenAI
- **平台**: Microsoft Azure OpenAI Service
- **API申请**: https://azure.microsoft.com/products/ai-services/openai-service
- **默认地址**: https://{resource}.openai.azure.com
- **热门模型**:
  - gpt-4o
  - gpt-4-turbo
  - gpt-35-turbo
- **模型获取**: ✅ 支持动态获取 (`/openai/models`)
- **特色**: 企业级服务,合规性好,中国区可用

---

### 6. 🌪️ Mistral AI ⭐新增
- **平台**: Mistral AI
- **API申请**: https://console.mistral.ai/api-keys/
- **默认地址**: https://api.mistral.ai/v1
- **热门模型**:
  - mistral-large-latest
  - mistral-small-latest
  - codestral-latest
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: 欧洲最强,开源友好,代码模型强

---

### 7. 🔬 Cohere ⭐新增
- **平台**: Cohere
- **API申请**: https://dashboard.cohere.com/api-keys
- **默认地址**: https://api.cohere.ai/v1
- **热门模型**:
  - command-r-plus (对话)
  - command-r (高性价比)
  - embed-english-v3.0 (嵌入)
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: RAG专精,企业搜索强

---

### 8. ⚡ Groq ⭐新增
- **平台**: Groq
- **API申请**: https://console.groq.com/keys
- **默认地址**: https://api.groq.com/openai/v1
- **热门模型**:
  - llama-3.3-70b-versatile
  - mixtral-8x7b-32768
  - gemma-7b-it
- **模型获取**: ✅ 支持动态获取 (`/openai/v1/models`)
- **特色**: **超快推理速度**,开源模型托管

---

## 🇨🇳 国内主流平台 (10个)

### 9. 🟡 阿里云百炼
- **平台**: 阿里云百炼 (DashScope)
- **API申请**: https://bailian.console.aliyun.com/
- **默认地址**: https://dashscope.aliyuncs.com/compatible-mode/v1
- **热门模型**:
  - qwen-max (最强)
  - qwen-plus (平衡)
  - qwen-turbo (快速)
  - qwen-long (长文本)
- **模型获取**: ✅ 支持动态获取 (`/compatible-mode/v1/models`)
- **特色**: OpenAI兼容,文档处理强,中文理解好

---

### 10. 🔴 百度千帆
- **平台**: 百度千帆 (ERNIE)
- **API申请**: https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application
- **默认地址**: https://qianfan.baidubce.com/v2
- **热门模型**:
  - ernie-4.0-8k (最新)
  - ernie-3.5-8k
  - ernie-speed-8k
- **模型获取**: ✅ 支持动态获取 (`/v2/models`)
- **特色**: 中文知识库强,百度生态整合

---

### 11. 🟣 腾讯混元
- **平台**: 腾讯混元
- **API申请**: https://cloud.tencent.com/product/hunyuan
- **默认地址**: https://hunyuan.tencentcloudapi.com
- **热门模型**:
  - hunyuan-standard
  - hunyuan-pro
  - hunyuan-lite
- **模型获取**: ⚠️ 暂不支持(使用默认模型)
- **特色**: 腾讯生态,微信整合

---

### 12. 🔶 华为盘古
- **平台**: 华为云盘古
- **API申请**: https://www.huaweicloud.com/product/pangu.html
- **默认地址**: https://pangu.huaweicloud.com/v1
- **热门模型**:
  - pangu-7b
  - pangu-13b
  - pangu-72b
- **模型获取**: ⚠️ 暂不支持(使用默认模型)
- **特色**: 政企市场,安全合规

---

### 13. 🌙 月之暗面 Kimi ⭐新增
- **平台**: Moonshot (Kimi)
- **API申请**: https://platform.moonshot.cn/console/api-keys
- **默认地址**: https://api.moonshot.cn/v1
- **热门模型**:
  - moonshot-v1-8k
  - moonshot-v1-32k
  - moonshot-v1-128k (超长上下文)
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: **超长上下文128K**,文件处理强

---

### 14. 🧠 智谱清言 ⭐新增
- **平台**: 智谱AI (GLM)
- **API申请**: https://open.bigmodel.cn/usercenter/apikeys
- **默认地址**: https://open.bigmodel.cn/api/paas/v4
- **热门模型**:
  - glm-4 (最新旗舰)
  - glm-4-plus
  - glm-3-turbo
  - cogview-3 (图像生成)
- **模型获取**: ✅ 支持动态获取 (`/api/paas/v4/models`)
- **特色**: 清华背景,多模态,代码能力强

---

### 15. 🤖 MiniMax ⭐新增
- **平台**: MiniMax
- **API申请**: https://platform.minimaxi.com/user-center/basicInformation/interface-key
- **默认地址**: https://api.minimax.chat/v1
- **热门模型**:
  - abab6.5-chat
  - abab6.5-gpt
  - abab5.5-chat
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: 角色扮演强,多模态

---

### 16. 🔮 阶跃星辰 ⭐新增
- **平台**: StepFun
- **API申请**: https://platform.stepfun.com/interface-key
- **默认地址**: https://api.stepfun.com/v1
- **热门模型**:
  - step-1-32k
  - step-1-128k
  - step-1v-32k (多模态)
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: 前Google/MS团队,技术实力强

---

### 17. 💎 百川智能 ⭐新增
- **平台**: 百川智能 (Baichuan)
- **API申请**: https://platform.baichuan-ai.com/console/apikey
- **默认地址**: https://api.baichuan-ai.com/v1
- **热门模型**:
  - Baichuan4 (最新)
  - Baichuan3-Turbo
  - Baichuan2-53B
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: 王小川创立,医疗领域强

---

### 18. 🌟 商汤日日新 ⭐新增
- **平台**: 商汤科技 (SenseNova)
- **API申请**: https://console.sensenova.cn/
- **默认地址**: https://api.sensenova.cn/v1
- **热门模型**:
  - SenseChat-5 (最新)
  - SenseChat-Turbo
  - SenseChat-Long
- **模型获取**: ✅ 支持动态获取 (`/v1/models`)
- **特色**: CV背景,多模态,视觉理解强

---

## ⚙️ 其他

### 19. 自定义平台
- **用途**: 兼容OpenAI格式的其他API服务
- **示例**: 
  - 本地部署的 Ollama
  - LocalAI
  - FastChat
  - 其他OpenAI兼容代理
- **模型获取**: ✅ 尝试OpenAI兼容格式 (`/models`)
- **说明**: 如果获取失败,可手动输入模型名称

---

## 📊 模型获取支持统计

| 支持状态 | 平台数量 | 平台列表 |
|---------|---------|---------|
| ✅ 完全支持 | 17个 | OpenAI, Anthropic, Google, DeepSeek, Azure, Mistral, Groq, 阿里云, 百度, 月之暗面, 智谱, MiniMax, 阶跃星辰, 百川, 商汤, Cohere, 自定义 |
| ⚠️ 默认模型 | 2个 | 腾讯混元, 华为盘古 |
| **总计** | **19个** | - |

---

## 🎯 推荐选择指南

### 🏆 综合最强
1. **OpenAI GPT-4o** - 预算充足首选
2. **DeepSeek-V3** - 性价比之王
3. **Claude 3.5 Sonnet** - 代码和安全性强

### 💰 性价比最高
1. **DeepSeek** - 免费额度高,效果好
2. **阿里云 Qwen** - 便宜且中文强
3. **Google Gemini** - 免费额度最高

### 🇨🇳 中文理解最好
1. **DeepSeek** - 国产最强
2. **阿里云 Qwen** - 文档处理强
3. **智谱 GLM-4** - 清华背景
4. **月之暗面 Kimi** - 长文本无敌

### ⚡ 速度最快
1. **Groq** - 超快推理(LPU芯片)
2. **阿里云 Qwen-Turbo** - 快速响应
3. **MiniMax** - 低延迟

### 📝 长文本处理
1. **月之暗面 128K** - 最长上下文
2. **阿里云 Qwen-Long** - 长文本优化
3. **阶跃星辰 128K** - 长上下文

### 💻 代码能力
1. **DeepSeek-Coder** - 代码专精
2. **Claude 3.5 Sonnet** - 代码理解强
3. **Mistral Codestral** - 代码专用

---

## 🚀 使用建议

### 新手入门
1. 先用 **DeepSeek** 或 **阿里云** (免费额度高)
2. 点击"🔑 获取API"跳转到官方注册
3. 输入API Key后点击"获取模型列表"
4. 从下拉框选择模型
5. 测试连接成功后保存

### 生产环境
1. 主要使用 **OpenAI GPT-4o** 或 **Claude 3.5**
2. 备用 **DeepSeek** 或 **阿里云** (降低成本)
3. 长文本用 **月之暗面 128K**
4. 代码任务用 **DeepSeek-Coder** 或 **Claude**

### 成本控制
- 开启"混合模式"(本地+AI),减少API调用
- 优先使用免费额度高的平台
- 批量分析时选择性价比模型
- 定期查看模型列表,选择最新最优模型

---

## 📅 更新记录

- **2026-05-22 v2.0**: 新增DeepSeek、月之暗面、智谱等10个平台,总计19个平台
- **2026-05-22 v1.0**: 初始版本,支持4个基础平台

---

**最后更新**: 2026-05-22  
**支持平台**: 19个  
**动态获取**: 17个平台✅  
**覆盖率**: 80%+ 主流AI服务商
