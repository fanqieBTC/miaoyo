"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WeekStat {
  weekId: string;
  points: number;
  pointCost: number;
  totalVolume: number;
  fee: number;
}

interface Props {
  data: WeekStat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A2235] border border-[#262D3D] rounded-lg px-4 py-3 text-[13px] shadow-xl">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="font-semibold num" style={{ color: p.color }}>
            {p.dataKey === "pointCost"
              ? `$${(p.value as number).toFixed(5)}`
              : (p.value as number).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PointsChart({ data }: Props) {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 50, bottom: 5, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" vertical={false} />
          <XAxis
            dataKey="weekId"
            stroke="#374151"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#1E2535" }}
          />
          <YAxis
            yAxisId="left"
            stroke="#374151"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#374151"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(4)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#9CA3AF", paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="points"
            name="积分"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0B0E14", stroke: "#10B981", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#10B981" }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="pointCost"
            name="积分成本"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0B0E14", stroke: "#F59E0B", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "#F59E0B" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
