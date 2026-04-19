import { NextResponse } from "next/server";

const UPSTREAM = "https://tool.opinx.app/api/predict";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, limit = 50, offset = 0, sort = "time" } = body;

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }

    const addr = walletAddress.trim().toLowerCase();

    const [summaryRes, historyRes] = await Promise.all([
      fetch(`${UPSTREAM}/trades/${addr}`, { cache: "no-store" }),
      fetch(
        `${UPSTREAM}/trades/${addr}/history?limit=${limit}&offset=${offset}&sort=${sort}`,
        { cache: "no-store" }
      ),
    ]);

    if (!summaryRes.ok) {
      return NextResponse.json(
        { error: `上游错误: ${summaryRes.status}` },
        { status: summaryRes.status }
      );
    }

    const summaryData = await summaryRes.json();
    const historyData = historyRes.ok ? await historyRes.json() : { trades: [] };
    const rawTrades: any[] = historyData.trades ?? [];

    const transactions = rawTrades.map((t: any) => {
      const isSell = t.side === "SELL";
      const shares = parseFloat(t.maker_amount ?? "0");
      const amountUsd = parseFloat(t.taker_amount ?? "0");
      const fee = parseFloat(t.fee_usdt ?? t.fee_net ?? "0");
      const netReceived = parseFloat(t.net_received ?? "0");
      const priceCents = shares > 0 ? (amountUsd / shares) * 100 : 0;

      return {
        id: t.tx_hash,
        timestamp: new Date(t.block_timestamp * 1000).toISOString(),
        market: `${t.category_slug ?? ""}  ${t.market_title ?? ""}`.trim(),
        direction: isSell ? "SELL Yes" : "BUY Yes",
        shares,
        priceCents,
        amountUsd,
        receivedShares: isSell ? null : netReceived,
        receivedUsd: isSell ? netReceived : null,
        fee,
        counterparty: isSell ? (t.taker ?? "") : (t.maker ?? ""),
        txHash: t.tx_hash ?? "",
        outcomeName: t.outcome_name ?? "Yes",
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        tradeCount: summaryData.trade_count ?? 0,
        totalShares: parseFloat(summaryData.total_volume_shares ?? "0"),
        totalUsd: parseFloat(summaryData.total_volume_usdt ?? "0"),
        totalFee: parseFloat(summaryData.total_fee_usdt ?? "0"),
      },
      transactions,
    });
  } catch (error) {
    console.error("Trades API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
