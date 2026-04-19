"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Check, Trophy, Star, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import WalletInputBar from "@/components/WalletInputBar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalStorageString } from "@/lib/useLocalStorageString";

// Dynamically import Recharts to avoid SSR issues (fixes width:-1 warning)
const PointsChart = dynamic(() => import("@/components/PointsChart"), { ssr: false });

// ── Types ──────────────────────────────────────────────
interface WeekStat {
  weekId: string;
  periodStart: string;
  periodEnd: string;
  points: number;
  tradeCount: number;
  takerVolume: number;
  makerVolume: number;
  totalVolume: number;
  fee: number;
  pointCost: number;
  calculated: boolean;
}

interface UserData {
  walletAddress: string;
  rank: number;
  totalPoints: number;
  lastPoint: number;
  avgCost: number;
  weeklyStats: WeekStat[];
}

// ── Formatters ─────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const fmtDate = (iso: string) =>
  new Date(iso).toISOString().substring(0, 10);

// ── Stat Card ──────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-[#18202F] border border-[#262D3D] rounded-lg px-4 py-2.5">
      <span className={color}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500 leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-bold num ${color}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function PredictPointsPage() {
  const { t } = useLanguage();
  const [wallet, setWallet] = useLocalStorageString("opinx_wallet_address");
  const [discountChecked, setDiscountChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState("");

  const handleQuery = useCallback(async () => {
    if (!wallet.trim()) return;
    setError("");
    setLoading(true);
    setUserData(null);
    try {
      const res = await fetch("/api/points/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: wallet.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setUserData(json.user);
    } catch (e: any) {
      setError(e.message ?? t("points.error"));
    } finally {
      setLoading(false);
    }
  }, [wallet, t]);

  // Stats shown in chart (only weeks with activity)
  const activeWeeks = userData?.weeklyStats.filter((w) => w.points > 0 || w.tradeCount > 0) ?? [];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0B0E14] py-6 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1 h-5 bg-purple-500 rounded-sm block" />
          <h1 className="text-lg font-semibold text-gray-100">{t("points.title")}</h1>
        </div>

        {/* ── Input Bar ── */}
        <WalletInputBar
          value={wallet}
          onChange={setWallet}
          onQuery={handleQuery}
          loading={loading}
          extra={
            <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                className="hidden"
                checked={discountChecked}
                onChange={(e) => setDiscountChecked(e.target.checked)}
              />
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  discountChecked
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-600"
                }`}
              >
                <Check
                  size={11}
                  className={`text-white transition-opacity ${discountChecked ? "opacity-100" : "opacity-0"}`}
                />
              </span>
              <span className="text-[13px] text-gray-400 border-b border-dashed border-gray-600">
                {t("points.discount")} <span className="text-gray-500">{t("points.discountDesc")}</span>
              </span>
            </label>
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
        {!userData && !loading && !error && (
          <div className="panel flex flex-col items-center justify-center gap-3 h-56 text-gray-600">
            <Star size={28} strokeWidth={1.5} />
            <p className="text-sm">{t("points.empty")}</p>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="panel p-6 space-y-4 animate-pulse">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 flex-1 bg-[#18202F] rounded-lg" />
              ))}
            </div>
            <div className="h-64 bg-[#18202F] rounded-lg" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-[#18202F] rounded" />
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {userData && !loading && (
          <div className="fade-in space-y-4">

            {/* Stat cards */}
            <div className="flex flex-wrap gap-3">
              <StatCard
                icon={<Trophy size={16} />}
                label={t("points.rank")}
                value={`#${userData.rank.toLocaleString()}`}
                color="text-yellow-500"
              />
              <StatCard
                icon={<Star size={16} />}
                label={t("points.totalPts")}
                value={fmt(userData.totalPoints, 4)}
                color="text-emerald-400"
              />
              <StatCard
                icon={<TrendingUp size={16} />}
                label={t("points.lastPts")}
                value={fmt(userData.lastPoint, 4)}
                color="text-purple-400"
              />
              <StatCard
                icon={<DollarSign size={16} />}
                label={t("points.avgCost")}
                value={`$${userData.avgCost.toFixed(5)}`}
                color="text-orange-400"
              />
            </div>

            {/* Chart */}
            <div className="panel p-5">
              <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
                {t("points.chartTitle")}
              </p>
              {activeWeeks.length > 0 ? (
                <PointsChart data={userData.weeklyStats} />
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-gray-600">
                  {t("points.chartEmpty")}
                </div>
              )}
            </div>

            {/* Weekly table */}
            <div className="panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#262D3D] text-gray-500 text-[12px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-medium">{t("points.th.week")}</th>
                      <th className="py-3 px-4 font-medium">{t("points.th.period")}</th>
                      <th className="py-3 px-4 font-medium text-right">{t("points.th.points")}</th>
                      <th className="py-3 px-4 font-medium text-right">{t("points.th.trades")}</th>
                      <th className="py-3 px-4 font-medium text-right">{t("points.th.taker")}</th>
                      <th className="py-3 px-4 font-medium text-right">{t("points.th.maker")}</th>
                      <th className="py-3 px-4 font-medium text-right">{t("points.th.total")}</th>
                      <th className="py-3 px-4 font-medium text-right">{t("points.th.fee")}</th>
                      <th className="py-3 px-4 font-medium text-right">{t("points.th.cost")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.weeklyStats.map((w) => {
                      // 3 states:
                      // active    = settled week with points
                      // inProgress = current unsettled week (calculated=false) that has volume
                      // empty     = genuinely no data
                      const hasVolume = w.totalVolume > 0 || w.tradeCount > 0;
                      const inProgress = !w.calculated && hasVolume;
                      const active = w.points > 0;
                      const isEmpty = !active && !inProgress;

                      return (
                        <tr
                          key={w.weekId}
                          className={`border-b border-[#262D3D]/40 transition-colors ${
                            isEmpty
                              ? "opacity-40"
                              : inProgress
                              ? "bg-blue-500/[0.04] hover:bg-blue-500/[0.07]"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >
                          <td className="py-3 px-4 font-semibold text-gray-300 whitespace-nowrap">
                            {w.weekId}
                            {inProgress && (
                              <span className="ml-2 text-[10px] font-medium text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">
                                {t("points.badge.inProgress")}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-500 num text-[12px]">
                            {fmtDate(w.periodStart)} ~ {fmtDate(w.periodEnd)}
                          </td>
                          <td className={`py-3 px-4 text-right num font-semibold ${
                            active ? "text-emerald-400" : inProgress ? "text-blue-400/60" : "text-gray-600"
                          }`}>
                            {inProgress ? t("points.status.settling") : fmt(w.points, 2)}
                          </td>
                          <td className="py-3 px-4 text-right num text-gray-300">{w.tradeCount}</td>
                          <td className={`py-3 px-4 text-right num ${w.takerVolume > 0 ? "text-blue-400" : "text-gray-600"}`}>
                            ${fmt(w.takerVolume)}
                          </td>
                          <td className={`py-3 px-4 text-right num ${w.makerVolume > 0 ? "text-blue-400" : "text-gray-600"}`}>
                            ${fmt(w.makerVolume)}
                          </td>
                          <td className={`py-3 px-4 text-right num ${w.totalVolume > 0 ? "text-blue-400" : "text-gray-600"}`}>
                            ${fmt(w.totalVolume)}
                          </td>
                          <td className={`py-3 px-4 text-right num ${w.fee > 0 ? "text-yellow-500" : "text-gray-600"}`}>
                            ${fmt(w.fee)}
                          </td>
                          <td className="py-3 px-4 text-right num text-gray-500">
                            {w.pointCost > 0 ? `$${w.pointCost.toFixed(5)}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
