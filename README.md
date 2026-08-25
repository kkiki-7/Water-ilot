# 水质巡检车 Web 仪表盘

基于 **React + Node.js** 的水质实时监测与远程控制仪表盘，对接中国移动 **OneNET 物联网平台**，实时展示巡检车采集的水质数据，并支持远程控制设备与智能分析。

## ✨ 功能特性

- **实时监测**：电导率（EC）、PH 值、浊度（NTU）、水浸（IMM）四项核心指标
- **实时推送**：后端每 10 秒轮询 OneNET，并通过 WebSocket 向前端推送最新数据
- **远程控制**：电机（正转 / 停止 / 反转）、推杆（伸出 / 停止 / 缩回）
- **智能分析**：水质等级判定（优 / 良 / 轻度污染 / 中度污染 / 重度污染）、异常诊断、处理建议
- **可视化**：仪表盘、趋势图、状态栏、快速数据概览

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · Vite 5 · Recharts |
| 后端 | Node.js · Express · ws（WebSocket） |
| 数据源 | OneNET 物联网平台（4G MQTT 设备上报） |

## 📁 目录结构

```
web-dashboard/
├── client/                 # React 前端
│   ├── src/
│   │   ├── api/            # API 请求封装
│   │   ├── components/     # UI 组件（仪表盘、控制面板、AI 分析等）
│   │   ├── data/           # 阈值配置
│   │   ├── hooks/          # 轮询 Hook
│   │   ├── App.jsx         # 主界面
│   │   └── main.jsx        # 入口
│   ├── index.html
│   └── vite.config.js      # 开发代理（/api → localhost:3001）
├── server/                 # Node.js 后端
│   ├── routes/             # API 路由（sensors / control / analysis / onenet）
│   ├── services/           # OneNET、设备状态、AI 分析服务
│   ├── index.js            # 服务入口（Express + WebSocket）
│   ├── init.js             # 加载环境变量
│   └── .env.example        # 环境变量模板
├── render.yaml             # Render 部署配置
└── package.json            # 根脚本
```

## 🚀 快速开始

### 环境要求

- Node.js 18 及以上（推荐 20+）
- npm

### 1. 安装依赖

项目包含三个独立的 `package.json`（根目录、`client`、`server`），需分别安装：

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. 配置环境变量

复制模板并填入真实的 OneNET 凭据：

```bash
cp server/.env.example server/.env
```

编辑 `server/.env`：

```ini
ONENET_PRODUCT_ID=你的产品ID
ONENET_DEVICE_ID=你的设备ID
ONENET_TOKEN=你的鉴权Token
PORT=3001
```

### 3. 启动开发环境

```bash
npm run dev
```

- 前端开发服务器：http://localhost:5173
- 后端 API + WebSocket：http://localhost:3001

前端开发时通过 Vite 代理将 `/api` 请求转发到后端 3001 端口。

## 🔧 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `ONENET_PRODUCT_ID` | OneNET 产品 ID | 是 |
| `ONENET_DEVICE_ID` | OneNET 设备 ID | 是 |
| `ONENET_TOKEN` | OneNET API 鉴权 Token | 是 |
| `PORT` | 后端服务端口，默认 `3001` | 否 |

> ⚠️ **注意**：`.env` 含真实密钥，已被 `.gitignore` 忽略，**切勿提交到仓库**。部署时通过托管平台的环境变量注入。

## 📊 数据指标

| 指标 | 单位 | 说明 |
|------|------|------|
| EC | μS/cm | 电导率，反映水中溶解性盐类含量 |
| PH | pH | 酸碱度 |
| NTU | NTU | 浊度，反映水体悬浮物含量 |
| IMM | — | 水浸状态（0 = 正常，1 = 异常） |

## ☁️ 部署

本项目为前后端一体应用，后端需要能运行 Node.js 的托管平台（GitHub Pages 仅支持静态文件，无法运行后端）。

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "init: water quality dashboard"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. 部署到 Render

仓库已包含 `render.yaml` 蓝图，可直接一键部署：

1. 登录 [Render](https://render.com)，连接 GitHub 账号
2. **New → Blueprint**，选择本仓库
3. 在环境变量中填入三个 OneNET 密钥（`ONENET_PRODUCT_ID`、`ONENET_DEVICE_ID`、`ONENET_TOKEN`）
4. 等待构建完成，访问 Render 分配的 `*.onrender.com` 域名

也可以手动创建 Web Service，使用以下配置：

- **Build Command**：`npm install && npm --prefix server install && npm --prefix client install && npm run build`
- **Start Command**：`npm start`

## 🔒 安全说明

- `.env` 及含私有网络 ID 的 ZeroTier 脚本已通过 `.gitignore` 排除，不进入版本库
- 所有密钥通过部署平台的环境变量注入，绝不以明文写入仓库
- 远程控制接口（电机 / 推杆）当前无鉴权，若部署到公网，建议自行添加访问控制
