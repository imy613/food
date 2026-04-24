# 寻味山河

“寻味山河”是一个面向比赛展示的中国地域美食文化交互网站，基于 Next.js App Router 构建。

## 观众如何使用
1. 打开首页后，首次会自动出现“使用指南”。
2. 在全国地图上悬停并点击省份，进入省级页面。
3. 在省级地图点击分区，查看下方 3 张美食卡。
4. 点击美食卡，右侧展开文化详情。
5. 点击左上角“返回全国地图”回到首页继续探索。

## 本地运行
```bash
npm install
npm run dev
```

默认地址：`http://127.0.0.1:3000`

## 发布与分享（公网可访问）

### 1) 安装依赖
```bash
npm install
```

### 2) 构建检查
```bash
npm run test
npm run build
```
要求：两条命令都通过后再发布。

### 3) 新建 GitHub 仓库并推送（自动部署前提）
1. 在 GitHub 新建公开仓库：`xunwei-shanhe`。
2. 本地仓库执行：
```bash
git init
git add .
git commit -m "feat: initial xunwei-shanhe release"
git branch -M master
git remote add origin <你的仓库URL>
git push -u origin master
```

### 4) 连接 Vercel（Web 控制台）
1. 登录 Vercel，点击 `Add New Project`。
2. 选择并导入 `xunwei-shanhe` GitHub 仓库。
3. Framework 选择 `Next.js`。
4. 构建设置使用默认值（Install: `npm install`，Build: `npm run build`）。
5. 点击 `Deploy`，等待首次发布完成。
6. 记录线上地址：`https://<project>.vercel.app`。

### 5) 后续自动更新
- 只要向 `master` 分支推送代码，Vercel 会自动触发新部署并更新线上站点。

## 线上验收清单（以 `*.vercel.app` 为准）
1. 首页加载正常，无白屏/报错。
2. 全国地图可点击，点击四川可进入 `/province/sichuan`。
3. 省级页可正常打开并可返回首页。
4. 省级页至少一张美食图片可见（非破图占位）。

## 地图合规说明（当前策略）
- 地图来源已标注为：`http://bzdt.ch.mnr.gov.cn/`
- 审图号当前为“提交前补齐”（演示版不填写具体编号，避免误填）。
- 页面已在开屏、首页全国图、省级图统一放置合规信息位。

## 比赛提交前检查项
1. 将 `lib/mapCompliance.ts` 中审图号替换为最终正式编号。
2. 复核地图来源与审图号是否与最终底图一致。
3. 复核南海诸岛示意、国界与行政区表达是否一致。
4. 导出最终展示截图，留存“地图合规标注”页内证据。

## 数据与图片目录
- 省份与分区数据：`data/provinces.json`
- 全国地图路径：`data/chinaMap.ts`
- 省级分区地图：`data/provincePartitions/`
- 美食图片：`public/images/foods/real/<省slug>/<hash>.jpg`

## 常见问题
- 页面未更新：强制刷新（Windows：`Ctrl+F5`）。
- 图片未显示：检查 `public/images/foods/real` 与 `data/provinces.json` 的 `image` 路径是否一致。
- 首次引导未出现：清理 `localStorage` 键 `xunwei.onboarding.seen.v1` 后刷新。
- Vercel 未自动部署：确认推送分支为 `master` 且项目仍绑定该仓库。
