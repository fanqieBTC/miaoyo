"use client";

import React, { createContext, useCallback, useContext, useSyncExternalStore, ReactNode } from "react";

type Language = "zh" | "en";

interface Dictionary {
  [key: string]: string;
}

const zhDict: Dictionary = {
  // Common
  "common.comingSoon": "敬请期待",
  "common.moreFeatures": "更多功能",
  "common.home": "首页",
  "common.trades": "交易",
  "common.points": "积分",
  "common.query": "查询",
  "common.loading": "加载中...",
  "common.joinDiscord": "加入 Discord 社区",
  "common.clear": "清空",

  // Homepage
  "home.badge": "实时链上数据 · 无需登录",
  "home.title1": "预测市场",
  "home.title2": "收益分析工具",
  "home.desc": "输入任意钱包地址，即刻查看 Predict.fun 积分排名、历史积分趋势、完整交易流水及手续费分析。",
  "home.cta.points": "查看积分",
  "home.cta.trades": "查看交易",
  "home.feat1.title": "积分追踪",
  "home.feat1.desc": "实时查询任意钱包地址的 Predict 积分排名、每周趋势及积分成本，精确到 5 位小数。",
  "home.feat2.title": "交易流水",
  "home.feat2.desc": "完整的链上交易记录，支持分页浏览与按时间/手续费排序，直链 Polygonscan 区块浏览器。",
  "home.feat.go": "立即前往",
  "home.trust.realtime": "实时数据",
  "home.trust.noauth": "无需授权",
  "home.trust.free": "开源免费",
  "home.trust.chain": "链上溯源",

  // Input Bar
  "input.placeholder": "输入 0x... 钱包地址",
  "input.paste": "粘贴",

  // Points Page
  "points.title": "Predict 积分",
  "points.discount": "推荐折扣",
  "points.discountDesc": "(手续费-10%, 积分+10%)",
  "points.error": "查询失败，请稍后重试",
  "points.empty": "输入钱包地址查询积分记录",
  "points.rank": "全球排名",
  "points.totalPts": "总积分",
  "points.lastPts": "本轮积分",
  "points.avgCost": "平均积分成本",
  "points.chartTitle": "每周积分 & 积分成本趋势",
  "points.chartEmpty": "暂无有效积分数据",
  "points.th.week": "周",
  "points.th.period": "时间段",
  "points.th.points": "积分",
  "points.th.trades": "交易次数",
  "points.th.taker": "Taker 量",
  "points.th.maker": "Maker 量",
  "points.th.total": "总交易量",
  "points.th.fee": "手续费",
  "points.th.cost": "积分成本",
  "points.badge.inProgress": "进行中",
  "points.status.settling": "结算中",

  // Trades Page
  "trades.title": "Predict 交易记录",
  "trades.sort.time": "按时间",
  "trades.sort.fee": "按手续费",
  "trades.error": "查询失败",
  "trades.empty": "输入钱包地址查询交易流水",
  "trades.stat.count": "交易次数",
  "trades.stat.shares": "份额交易量",
  "trades.stat.usd": "USDT 交易量",
  "trades.stat.fee": "总手续费",
  "trades.stat.page": "第 {start}–{end} 条 / 共 {total} 条",
  "trades.th.time": "时间",
  "trades.th.market": "市场",
  "trades.th.dir": "方向",
  "trades.th.shares": "份额",
  "trades.th.price": "价格",
  "trades.th.amount": "金额",
  "trades.th.recvShare": "实收份额",
  "trades.th.recvUsd": "实收 U",
  "trades.th.fee": "手续费",
  "trades.th.cp": "对手方",
  "trades.th.tx": "Tx",
  "trades.btn.prev": "← 上一页",
  "trades.btn.next": "下一页 →",
};

const enDict: Dictionary = {
  // Common
  "common.comingSoon": "Coming Soon",
  "common.moreFeatures": "More",
  "common.home": "Home",
  "common.trades": "Trades",
  "common.points": "Points",
  "common.query": "Query",
  "common.loading": "Loading...",
  "common.joinDiscord": "Join Discord",
  "common.clear": "Clear",

  // Homepage
  "home.badge": "Real-time On-chain Data · No Login",
  "home.title1": "Prediction Market",
  "home.title2": "Analytics Tool",
  "home.desc": "Enter any wallet address to view Predict.fun point rankings, historical trends, complete trade history, and fee breakdown.",
  "home.cta.points": "View Points",
  "home.cta.trades": "View Trades",
  "home.feat1.title": "Point Tracking",
  "home.feat1.desc": "Real-time query of Predict points ranking, weekly trends, and cost per point down to 5 decimals.",
  "home.feat2.title": "Trade History",
  "home.feat2.desc": "Complete on-chain trade records with pagination, sorting, and direct Polygonscan links.",
  "home.feat.go": "Go Now",
  "home.trust.realtime": "Real-time",
  "home.trust.noauth": "No Auth",
  "home.trust.free": "Free & Open",
  "home.trust.chain": "On-chain",

  // Input Bar
  "input.placeholder": "Enter 0x... wallet address",
  "input.paste": "Paste",

  // Points Page
  "points.title": "Predict Points",
  "points.discount": "Referral Discount",
  "points.discountDesc": "(Fee -10%, Points +10%)",
  "points.error": "Query failed, please try again",
  "points.empty": "Enter a wallet address to view points",
  "points.rank": "Global Rank",
  "points.totalPts": "Total Points",
  "points.lastPts": "Current Round",
  "points.avgCost": "Avg. Point Cost",
  "points.chartTitle": "Weekly Points & Cost Trend",
  "points.chartEmpty": "No valid points data",
  "points.th.week": "Week",
  "points.th.period": "Period",
  "points.th.points": "Points",
  "points.th.trades": "Trades",
  "points.th.taker": "Taker Vol",
  "points.th.maker": "Maker Vol",
  "points.th.total": "Total Vol",
  "points.th.fee": "Fee",
  "points.th.cost": "Point Cost",
  "points.badge.inProgress": "Active",
  "points.status.settling": "Settling",

  // Trades Page
  "trades.title": "Predict Trades",
  "trades.sort.time": "Time",
  "trades.sort.fee": "Fee",
  "trades.error": "Query failed",
  "trades.empty": "Enter a wallet address to view trades",
  "trades.stat.count": "Trades",
  "trades.stat.shares": "Shares Vol",
  "trades.stat.usd": "USDT Vol",
  "trades.stat.fee": "Total Fees",
  "trades.stat.page": "Showing {start}–{end} / {total}",
  "trades.th.time": "Time",
  "trades.th.market": "Market",
  "trades.th.dir": "Side",
  "trades.th.shares": "Shares",
  "trades.th.price": "Price",
  "trades.th.amount": "Amount",
  "trades.th.recvShare": "Recv. Shares",
  "trades.th.recvUsd": "Recv. USDT",
  "trades.th.fee": "Fee",
  "trades.th.cp": "Counterparty",
  "trades.th.tx": "Tx",
  "trades.btn.prev": "← Prev",
  "trades.btn.next": "Next →",
};

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "zh",
  toggleLanguage: () => {},
  t: (k) => k,
});

export const useLanguage = () => useContext(LanguageContext);

const LANGUAGE_STORAGE_KEY = "opinx_lang";
const LANGUAGE_STORAGE_EVENT = "local-storage:opinx_lang";

const emptySubscribe = () => () => {};

const getMountedSnapshot = () => true;

const getServerMountedSnapshot = () => false;

const readStoredLanguage = (): Language => {
  if (typeof window === "undefined") return "zh";
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === "zh" || saved === "en" ? saved : "zh";
};

const subscribeToLanguage = (onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};

  const handleChange = (event: Event) => {
    if (event instanceof StorageEvent && event.key !== LANGUAGE_STORAGE_KEY) return;
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(LANGUAGE_STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LANGUAGE_STORAGE_EVENT, handleChange);
  };
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore<boolean>(
    emptySubscribe,
    getMountedSnapshot,
    getServerMountedSnapshot
  );
  const lang = useSyncExternalStore<Language>(subscribeToLanguage, readStoredLanguage, () => "zh");

  const toggleLanguage = useCallback(() => {
    const newLang = lang === "zh" ? "en" : "zh";
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    window.dispatchEvent(new Event(LANGUAGE_STORAGE_EVENT));
  }, [lang]);

  const t = (key: string, params?: Record<string, string | number>) => {
    const dict = lang === "zh" ? zhDict : enDict;
    let str = dict[key] || key;
    if (params) {
      Object.keys(params).forEach((k) => {
        str = str.replace(`{${k}}`, params[k].toString());
      });
    }
    return str;
  };

  if (!mounted) {
    // Return an invisible wrapper during SSR to prevent hydration mismatch on text
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
