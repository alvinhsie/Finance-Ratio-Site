import { Link } from "wouter";
import { CATEGORIES } from "@/lib/ratios";
import { ArrowRight, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  liquidity:    { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  profitability:{ bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100" },
  leverage:     { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
  efficiency:   { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  valuation:    { bg: "bg-rose-50",   text: "text-rose-600",   border: "border-rose-100" },
};

export function HomePage() {
  const totalRatios = CATEGORIES.reduce((sum, c) => sum + c.ratios.length, 0);

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <BarChart2 className="w-3.5 h-3.5" />
          {totalRatios} Ratios across {CATEGORIES.length} categories
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-3">
          Financial Ratio<br />Calculator
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
          Instantly calculate and interpret key financial ratios for liquidity, profitability, leverage, efficiency, and valuation analysis.
        </p>
      </motion.div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map((category, i) => {
          const Icon = category.icon;
          const colors = categoryColors[category.id] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link href={`/category/${category.id}`}>
                <div className={`group cursor-pointer bg-card border ${colors.border} rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h2 className="font-semibold text-foreground text-base mb-1">{category.name}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{category.description}</p>
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{category.ratios.length} ratio{category.ratios.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-muted-foreground text-center mt-10"
      >
        Select a category above to start calculating
      </motion.p>
    </div>
  );
}
