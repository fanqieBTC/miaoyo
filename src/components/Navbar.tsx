"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Star, MoreHorizontal, MessageCircle, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, toggleLanguage, t } = useLanguage();

  const navItems = [
    { href: "/", label: t("common.home"), icon: <Home size={16} /> },
    { href: "/trades", label: t("common.trades"), icon: <Activity size={16} /> },
    { href: "/predict-points", label: t("common.points"), icon: <Star size={16} /> }
  ];

  return (
    <nav className="flex justify-between items-center px-6 h-14 bg-[#0B0E14]/90 border-b border-[#262D3D] backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_14px_rgba(37,99,235,0.55)] ring-1 ring-blue-300/40">
            <span className="text-[15px] font-black leading-none text-white">M</span>
          </div>
          <span>MIAOYO</span>
        </Link>
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? 'text-gray-100 bg-white/10 border border-white/5'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
          <Link href="/more" className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-300 px-3 py-1.5 ml-2 transition-colors">
            <MoreHorizontal size={16} /> {t("common.moreFeatures")}
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <a 
          href="https://discord.gg/gDyTJ37x" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#5865F2] transition-colors flex items-center justify-center p-1"
          title={t("common.joinDiscord")}
        >
          <MessageCircle size={18} />
        </a>
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-400 hover:text-white transition-colors"
        >
          <Languages size={18}/> {lang === "zh" ? "EN" : "中"}
        </button>
      </div>
    </nav>
  );
}
