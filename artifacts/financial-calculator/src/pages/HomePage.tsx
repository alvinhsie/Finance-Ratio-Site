import { Link } from "wouter";
import { CATEGORIES } from "@/lib/ratios";
import { ArrowRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  liquidity:    { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  profitability:{ bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100" },
  leverage:     { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
  efficiency:   { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  valuation:    { bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100" },
  "fair-value": { bg: "bg-teal-50",   text: "text-teal-600",   border: "border-teal-100" },
};

export function HomePage() {
  const { t } = useLanguage();
  const titleLines = t.home.title.split("\n");

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >

        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-tight mb-3">
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed">
          {t.home.subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:[grid-auto-rows:1fr]">
        {CATEGORIES.map((category, i) => {
          const Icon = category.icon;
          const colors = categoryColors[category.id] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };
          const catT = t.categories[category.id as keyof typeof t.categories] ?? { name: category.name, description: category.description };

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="h-full"
            >
              <Link href={`/category/${category.id}`} className="h-full block">
                <div className={`group cursor-pointer h-full bg-card border ${colors.border} rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col min-h-[120px]`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h2 className="font-semibold text-foreground text-base mb-1">{catT.name}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{(catT as any).shortDescription ?? catT.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4"
      >
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">{t.home.infoBox}</p>
      </motion.div>
    </div>
  );
}
