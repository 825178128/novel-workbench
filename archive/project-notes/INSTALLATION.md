# 安装指南

## 依赖安装

由于网络原因,npm install 可能较慢。建议使用国内镜像:

### 方法 1: 使用淘宝镜像

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### 方法 2: 使用 CNPM

```bash
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### 方法 3: 分批次安装

如果一次性安装失败,可以分批次:

```bash
# 1. 先安装核心依赖
npm install react react-dom typescript @types/react @types/react-dom

# 2. 安装构建工具
npm install vite @vitejs/plugin-react

# 3. 安装 Electron 相关
npm install electron electron-builder concurrently wait-on cross-env

# 4. 安装 UI 库
npm install lucide-react zustand

# 5. 安装数据库 (可选,如果编译失败可以先跳过)
npm install better-sqlite3 @types/better-sqlite3
```

## 运行项目

### 开发模式 (仅 React 前端)

```bash
npm run dev
```

然后在浏览器访问: http://localhost:5173

### Electron 桌面应用

需要先安装所有依赖,然后:

```bash
npm run electron:dev
```

## 常见问题

### better-sqlite3 编译失败

Windows 系统需要安装 build tools:

```bash
npm install --global windows-build-tools
```

或者使用预编译版本:

```bash
npm install better-sqlite3 --save-dev
```

### Electron 下载失败

使用国内镜像:

```bash
npm config set ELECTRON_MIRROR https://npmmirror.com/mirrors/electron/
```

## 项目已创建的文件

✅ 项目配置文件:
- package.json
- vite.config.ts
- tsconfig.json
- tsconfig.node.json

✅ Electron 主进程:
- electron/main.ts
- electron/preload.ts

✅ React 应用:
- index.html
- src/main.tsx
- src/App.tsx
- src/index.css
- src/App.css

✅ UI 组件:
- src/components/TopBar.tsx + CSS
- src/components/Sidebar.tsx + CSS
- src/components/Workspace.tsx + CSS
- src/components/StatusBar.tsx + CSS

✅ 文档:
- README.md
- INSTALLATION.md (本文件)

## 下一步

依赖安装完成后,你需要:

1. 实现文件解析器 (TXT/EPUB/DOCX)
2. 集成 SQLite 数据库
3. 实现内容分析功能
4. 集成 AI API
5. 完善编辑器功能

详见 README.md 中的开发计划。
