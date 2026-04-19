"use client";

import { useState, useCallback } from "react";
import { ExternalLink, AlertCircle, Activity } from "lucide-react";
import WalletInputBar from "@/components/WalletInputBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalStorageString } from "@/lib/useLocalStorageString";

// ── Types ──────────────────────────────────────────────
interface TradeSummary {
  tradeCount: number;
  totalShares: number;
  totalUsd: number;
  totalFee: number;
}

interface Trade {
  id: string;
  timestamp: string;
  market: string;
  direction: "BUY Yes" | "SELL Yes";
  shares: number;
  priceCents: number;
  amountUsd: number;
  receivedShares: number | null;
  receivedUsd: number | null;
  fee: number;
  counterparty: string;
  txHash: string;
  outcomeName: string;
}

// ── Formatters ─────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const shortAddr = (addr: string) =>
  addr && addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : (addr || "—");

const POLY_TX_BASE = "https://polygonscan.com/tx/";

const PAGE_SIZE = 50;

// ── Main Page ──────────────────────────────────────────
export default function TradesPage() {
  const { t } = useLanguage();
  const [wallet, setWallet] = useLocalStorageString("opinx_wallet_address");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<TradeSummary | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<"time" | "fee">("time");
  const [error, setError] = useState("");

  const fetchTrades = useCallback(
    async (address: string, pageIdx: number, sortKey: "time" | "fee") => {
      setError("");
      setLoading(true);
      try {
        const res = await fetch("/api/trades/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: address.trim(),
            limit: PAGE_SIZE,
            offset: pageIdx * PAGE_SIZE,
            sort: sortKey,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        setSummary(json.summary);
        setTrades(json.transactions);
        setTotal(json.summary.tradeCount);
        setPage(pageIdx);
      } catch (e: any) {
        setError(e.message ?? t("trades.error"));
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const handleQuery = () => {
    if (!wallet.trim()) return;
    setSummary(null);
    setTrades([]);
    setPage(0);
    fetchTrades(wallet, 0, sort);
  };

  const handleSort = (key: "time" | "fee") => {
    if (key === sort) return;
    setSort(key);
    if (wallet.trim() && summary) fetchTrades(wallet, 0, key);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0B0E14] py-6 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-emerald-500 rounded-sm block" />
          <h1 className="text-lg font-semibold text-gray-100">{t("trades.title")}</h1>
        </div>

        {/* ── Input Bar ── */}
        <WalletInputBar
          value={wallet}
          onChange={setWallet}
          onQuery={handleQuery}
          loading={loading}
          extra={
            <div className="flex items-center gap-1 bg-[#18202F] border border-[#262D3D] rounded-lg p-1">
              {(["time", "fee"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => handleSort(k)}
                  className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                    sort === k
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {k === "time" ? t("trades.sort.time") : t("trades.sort.fee")}
                </button>
              ))}
            </div>
          }
        />

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-4 px-1">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* ── Empty State ── */}
        {!summary && !loading && !error && (
          <div className="panel flex flex-col items-center justify-center gap-3 h-56 text-gray-600">
            <Activity size={28} strokeWidth={1.5} />
            <p className="text-sm">{t("trades.empty")}</p>
          </div>
        )}

        {/* ── Results ── */}
        {summary && (
          <div className="fade-in panel overflow-hidden">

            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 bg-[#18202F]/60 border-b border-[#262D3D]">
              <SummaryItem label={t("trades.stat.count")} value={summary.tradeCount.toLocaleString()} color="text-gray-200" />
              <SummaryItem label={t("trades.stat.shares")} value={fmt(summary.totalShares)} color="text-emerald-400" />
              <SummaryItem label={t("trades.stat.usd")} value={`$${fmt(summary.totalUsd)}`} color="text-blue-400" />
              <SummaryItem label={t("trades.stat.fee")} value={`$${fmt(summary.totalFee)}`} color="text-yellow-500" />
              {total > 0 && (
                <span className="ml-auto text-[12px] text-gray-500">
                  {t("trades.stat.page", {
                    start: page * PAGE_SIZE + 1,
                    end: Math.min((page + 1) * PAGE_SIZE, total),
                    total: total
                  })}
                </span>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-[#262D3D] text-[12px] text-gray-500 uppercase tracking-wider">
                    <TH>{t("trades.th.time")}</TH>
                    <TH>{t("trades.th.market")}</TH>
                    <TH>{t("trades.th.dir")}</TH>
                    <TH align="right">{t("trades.th.shares")}</TH>
                    <TH align="right">{t("trades.th.price")}</TH>
                    <TH align="right">{t("trades.th.amount")}</TH>
                    <TH align="right">{t("trades.th.recvShare")}</TH>
                    <TH align="right">{t("trades.th.recvUsd")}</TH>
                    <TH align="right">{t("trades.th.fee")}</TH>
                    <TH align="center">{t("trades.th.cp")}</TH>
                    <TH align="center">{t("trades.th.tx")}</TH>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(PAGE_SIZE)].map((_, i) => (
                        <tr key={i} className="border-b border-[#262D3D]/30 animate-pulse">
                          {[...Array(11)].map((_, j) => (
                            <td key={j} className="py-3 px-4">
                              <div className="h-3 bg-[#18202F] rounded w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : trades.map((tx, idx) => (
                        <tr
                          key={`${tx.id}-${tx.timestamp}-${idx}`}
                          className="border-b border-[#262D3D]/40 hover:bg-white/[0.025] transition-colors"
                        >
                          <td className="py-2.5 px-4 text-gray-500 num whitespace-nowrap">{fmtTime(tx.timestamp)}</td>
                          <td className="py-2.5 px-4 text-gray-300 max-w-[180px]">
                            <div className="flex items-center gap-1">
                              <span className="truncate" title={tx.market}>{tx.market}</span>
                              <ExternalLink size={11} className="shrink-0 text-gray-600" />
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-medium ${
                                tx.direction === "BUY Yes"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-red-500/15 text-red-400"
                              }`}
                            >
                              {tx.direction === "BUY Yes" ? "▲" : "▼"} {tx.direction}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right num text-gray-200">{fmt(tx.shares)}</td>
                          <td className="py-2.5 px-4 text-right num text-gray-400">{tx.priceCents.toFixed(2)}¢</td>
                          <td className="py-2.5 px-4 text-right num text-gray-200">${fmt(tx.amountUsd)}</td>
                          <td className={`py-2.5 px-4 text-right num ${tx.receivedShares != null ? "text-blue-400" : "text-gray-600"}`}>
                            {tx.receivedShares != null ? fmt(tx.receivedShares) : "—"}
                          </td>
                          <td className={`py-2.5 px-4 text-right num ${tx.receivedUsd != null ? "text-emerald-400" : "text-gray-600"}`}>
                            {tx.receivedUsd != null ? `$${fmt(tx.receivedUsd)}` : "—"}
                          </td>
                          <td className="py-2.5 px-4 text-right num text-yellow-500">${fmt(tx.fee)}</td>
                          <td className="py-2.5 px-4 text-center text-gray-500 num">
                            <span title={tx.counterparty}>{shortAddr(tx.counterparty)}</span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <a
                              href={`${POLY_TX_BASE}${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={tx.txHash}
                              className="inline-flex text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-[#262D3D]">
                <button
                  disabled={page === 0 || loading}
                  onClick={() => fetchTrades(wallet, page - 1, sort)}
                  className="px-4 py-1.5 text-sm rounded-lg border border-[#262D3D] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t("trades.btn.prev")}
                </button>
                <span className="text-sm text-gray-500 px-2">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => fetchTrades(wallet, page + 1, sort)}
                  className="px-4 py-1.5 text-sm rounded-lg border border-[#262D3D] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {t("trades.btn.next")}
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────
function TH({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <th className={`py-3 px-4 font-medium text-${align}`}>{children}</th>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <span className="text-gray-500">{label}:</span>
      <span className={`font-semibold num ${color}`}>{value}</span>
    </div>
  );
}
