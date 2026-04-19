# MIAOYO (原 OpinX Predict Proxy) 项目交接指南

你好，接手本项目的代理人/工程师：

这是一个基于 Next.js (App Router) 开发的 Web3 预测市场数据分析引擎，前端品牌现命名为 **MIAOYO**。
为了确保你能快速接手并继续往上迭代，以下是该项目最新的技术快照和开发约定原则。

---

## 1. 核心架构与请求链路

> [!IMPORTANT]
> **绝对不要再使用本地数据库（SQLite/Prisma）。**

项目早期版本（你可能会在根目录下看到 `prisma/`，`test-prisma.js` 等遗留文件）依赖于拉取数据后存入本地数据库进而查询。**这套逻辑已经被彻底废除！** 因为在 Serverless 部署（如 Vercel）时，本地持久化 SQLite 会因冷启动或只读文件系统而全面崩溃。

**目前的正式链路：纯无状态请求透传**
- 前端页面 (`/predict-points`, `/trades`) 发起请求到 Next.js 内部的 API Route 发送 JSON payload。
- 后端中间件 (`src/app/api/trades/query/route.ts` 和 `src/app/api/points/query/route.ts`) 接收请求。
- 中间件直接通过 `fetch` 无缓存 (`cache: 'no-store'`) 向官方私有服务 `https://tool.opinx.app` 发起请求拉取最新数据。
- 中间件只负责将数据格式化，直接吐回前端。

> **你要做的是：** 保持 API 层的这种"透明代理"机制，任何新增加的预测数据模块，都直接去对接到外部 API。

---

## 2. 核心技术栈与缓存机制

| 技术项 | 说明 |
|----|----|
| **框架** | Next.js 14+ (App Router), React Server Components 兼容 |
| **样式** | Tailwind CSS + Lucide React (纯类名覆盖) |
| **图表** | Recharts (在客户端组件中必须通过 `next/dynamic` ssr: false 动态引入，解决 Hydration 无宽度报错) |
| **上下文** | `useState`, `useContext`, `localStorage` 进行极致轻量的状态管理 |

### 关键的 LocalStorage 持久化
目前我们有两个非常重要且体验极佳的本地缓存：
1. **`opinx_wallet_address`**: 记录用户查询过的钱包地址。因为用户常在“积分页”和“交易页”来回切，地址被双向绑定并实时读取/写入此字段，保证输入框永不丢失。
2. **`opinx_lang`**: 记录用户的语言偏好（`zh` 或 `en`）。

---

## 3. 全局定制化功能介绍

### 轻量级跨站多语言引擎 (i18n) 🌐
我们弃用了沉重的第三方国际化包，自己实现了一套纯享版的本地语言库。
- **文件位置：** `src/contexts/LanguageContext.tsx`
- **使用方法：** 将你需要翻译的内容以 Key-Value 的形式分别写在 `zhDict` 和 `enDict` 内。在目标组件中 `const { t } = useLanguage()`，并将字符串替换为 `{t('your.key')}` 即可。

### 交易系统 React Key 保护机制
- **已知痛点：** 区块链里一笔巨大的 `tx_hash` 里可以包含非常多的碎单。如果使用 hash + 时间戳作为 React Map 渲染时的唯一 Key 就会报错。
- **处理方式：** 已经在 `/src/app/trades/page.tsx` 里的 Table 渲染通过加入数组 index 作为天然屏障隔离了脏数据 (`${tx.id}-${tx.timestamp}-${idx}`)。后续如果写任何区块交易明细相关的 DOM 列表，**必须用 index 兜底**。

---

## 4. 后续开发路线图建议 (Roadmap)

如果用户下达了继续完善的任务，推荐按照以下优先级切入：

1. **废弃依赖清理：** 放心大胆地把项目里的 `@prisma/client`, `prisma/` 目录, `dev.db` 和那几个 Node 层面的 mock 导入数据脚本（`clear-users.js`, `test-seed.js`）给删除干净。卸载包能为项目减负。
2. **移动端适配优化：** 目前的 Table 在极大列数时采用的是 `overflow-x-auto` 滑动机制。若要在移动端展示更优，可能需要为交易页引入卡片流式布局。
3. **“更多功能”(More) 页面开发：** 目前路径 `/more` 展示的是一个高冷的“敬请期待”页面。随时可以在这里介入新的模块接入（比如新增用户的钱包持仓概览、盈利占比饼图等）。
4. **统一数字格式化：** 目前对于金钱 ($) 及数量等统一采用了 `.toLocaleString` 和指定小数位数，如果新增功能，请继续调用我们封装好的全局 `fmt()` 和 `fmtDate()` 函数。

*Happy Coding！期待你在 MIAOYO 这个清爽干净架构上的出色表现。* 🚀
