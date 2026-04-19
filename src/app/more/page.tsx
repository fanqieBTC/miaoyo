"use client";

import { Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MoreFeaturesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#0B0E14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-gray-500 mb-20 animate-fade-in">
        <div className="text-gray-600 mb-2">
          <Package strokeWidth={1} width={80} height={80} />
        </div>
        <h2 className="text-xl tracking-wider font-light">
          {t("common.comingSoon")}
        </h2>
      </div>
    </div>
  );
}
