# RemoveBG Mini

智能图片背景移除工具，基于 Next.js + Tailwind CSS + Cloudflare Edge 构建。

## 技术架构

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   用户前端   │ --> │  Cloudflare Worker │ --> │  Remove.bg  │
│ (Cloudflare │     │   (API 处理)      │     │    API      │
│   Pages)    │     └─────────────────┘     └─────────────┘
└─────────────┘
```

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量配置
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Remove.bg API Key
vim .env.local

# 启动开发服务器
npm run dev
```

### Cloudflare Pages 部署

#### 1. 部署 API Worker

```bash
cd worker

# 安装依赖
npm install

# 本地测试
npm run dev

# 部署到 Cloudflare
npm run deploy
```

部署后你会获得 Worker URL，例如：`https://remove-bg-worker.你的账号.workers.dev`

#### 2. 配置环境变量

在 Cloudflare Dashboard 中为 Worker 设置环境变量：
- `REMOVE_BG_API_KEY`: 你的 Remove.bg API Key

#### 3. 部署前端

连接 GitHub 实现自动化部署：
1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → 创建应用程序 → Pages → 连接 GitHub
3. 选择本仓库
4. 设置构建命令：`npm run pages:build`
5. 设置输出目录：`.vercel/output/static`
6. 添加环境变量：`NEXT_PUBLIC_API_URL` = 你的 Worker URL

## 环境变量

| 变量名 | 说明 | Worker / Pages |
|--------|------|-----------------|
| `REMOVE_BG_API_KEY` | Remove.bg API Key | Worker |
| `NEXT_PUBLIC_API_URL` | Worker 访问地址 | Pages |

## 功能

- ✅ 图片拖拽/点击上传
- ✅ JPG/PNG/WebP 支持，≤10MB
- ✅ 移除背景（调用 Remove.bg API）
- ✅ 原图/结果图对比预览
- ✅ 一键下载 PNG
- ✅ 错误处理

## License

MIT
