"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart2, TrendingUp, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <BarChart2 size={22} className="text-blue-400" />,
      title: t("home.feat1.title"),
      desc: t("home.feat1.desc"),
      href: "/predict-points",
      color: "from-blue-500/20 to-transparent",
      border: "border-blue-500/20",
    },
    {
      icon: <TrendingUp size={22} className="text-emerald-400" />,
      title: t("home.feat2.title"),
      desc: t("home.feat2.desc"),
      href: "/trades",
      color: "from-emerald-500/20 to-transparent",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-56px)] bg-[#0B0E14] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Badge */}
      <div className="relative mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
        <Zap size={14} />
        {t("home.badge")}
      </div>

      {/* Headline */}
      <h1 className="relative text-center text-4xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
        {t("home.title1")}<br />
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t("home.title2")}
        </span>
      </h1>

      <p className="relative text-center text-gray-400 text-base md:text-lg max-w-xl mb-12 leading-relaxed">
        {t("home.desc")}
      </p>

      {/* CTA */}
      <div className="relative flex flex-wrap gap-3 mb-20">
        <Link
          href="/predict-points"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-full font-medium transition-all shadow-[0_0_24px_rgba(59,130,246,0.3)] hover:shadow-[0_0_36px_rgba(59,130,246,0.45)] hover:-translate-y-0.5"
        >
          {t("home.cta.points")} <ArrowRight size={16} />
        </Link>
        <Link
          href="/trades"
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white px-7 py-3 rounded-full font-medium transition-all hover:-translate-y-0.5"
        >
          {t("home.cta.trades")}
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="relative w-full max-w-3xl grid md:grid-cols-2 gap-5">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`group panel p-6 hover:-translate-y-1 transition-all hover:border-opacity-50 ${f.border}`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 border ${f.border}`}>
              {f.icon}
            </div>
            <h2 className="text-base font-semibold text-gray-100 mb-2 group-hover:text-white transition-colors">
              {f.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            <div className="flex items-center gap-1 mt-4 text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
              {t("home.feat.go")} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Trust badges */}
      <div className="relative flex flex-wrap justify-center gap-8 mt-20 text-xs text-gray-600">
        <span className="flex items-center gap-1.5"><Zap size={13} /> {t("home.trust.realtime")}</span>
        <span className="flex items-center gap-1.5"><Shield size={13} /> {t("home.trust.noauth")}</span>
        <span className="flex items-center gap-1.5"><Star size={13} /> {t("home.trust.free")}</span>
        <span className="flex items-center gap-1.5"><BarChart2 size={13} /> {t("home.trust.chain")}</span>
      </div>
    </div>
  );
}
