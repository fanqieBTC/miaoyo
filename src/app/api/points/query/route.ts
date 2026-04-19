import { NextResponse } from 'next/server';

const UPSTREAM = 'https://tool.opinx.app/api/predict';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    const addr = walletAddress.trim().toLowerCase();

    const res = await fetch(`${UPSTREAM}/points/${addr}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Upstream error:', res.status, text);
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();

    // Normalize the response to match our frontend expectations
    const leaderboard = data.leaderboard ?? {};
    const weeks: any[] = data.weeks ?? [];

    const weeklyStats = weeks.map((w: any) => {
      const taker = parseFloat(w.paid_volume_usdt ?? '0');
      const maker = parseFloat(w.free_volume_usdt ?? '0');
      const fee = parseFloat(w.paid_fee_usdt ?? '0');
      const points = w.points ?? 0;
      return {
        weekId: `W${w.week}`,
        periodStart: new Date(w.week_start * 1000).toISOString(),
        periodEnd: new Date(w.week_end * 1000).toISOString(),
        points,
        tradeCount: w.trade_count ?? 0,
        takerVolume: taker,
        makerVolume: maker,
        totalVolume: taker + maker,
        fee,
        pointCost: points > 0 ? fee / points : 0,
        calculated: w.calculated ?? true,
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        walletAddress: data.wallet,
        rank: leaderboard.rank ?? 0,
        totalPoints: leaderboard.total_points ?? 0,
        lastPoint: leaderboard.allocation_round_points ?? 0,
        avgCost: (() => {
          const totalFee = weeklyStats.reduce((s: number, w: any) => s + w.fee, 0);
          const totalPts = weeklyStats.reduce((s: number, w: any) => s + w.points, 0);
          return totalPts > 0 ? totalFee / totalPts : 0;
        })(),
        weeklyStats,
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
