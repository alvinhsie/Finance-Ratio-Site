import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown, Target, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import { categoryColors } from '@/lib/categoryColors';

type Direction = 'higher' | 'lower' | 'range' | 'context';

interface GlossaryItem {
  name: string;
  nameId: string;
  formula: string;
  description: string;
  descriptionId: string;
  benchmark: string;
  benchmarkId: string;
  direction: Direction;
}

interface GlossaryCategory {
  id: string;
  name: string;
  nameId: string;
  color: string;
  badgeClass: string;
  items: GlossaryItem[];
}

const directionConfig: Record<Direction, { labelEn: string; labelId: string; icon: React.ReactNode }> = {
  higher:  { labelEn: 'Higher is better', labelId: 'Lebih tinggi lebih baik', icon: <ArrowUp className="w-3 h-3 text-green-500" /> },
  lower:   { labelEn: 'Lower is better',  labelId: 'Lebih rendah lebih baik', icon: <ArrowDown className="w-3 h-3 text-blue-500" /> },
  range:   { labelEn: 'In range is better', labelId: 'Dalam rentang terbaik',  icon: <Target className="w-3 h-3 text-yellow-500" /> },
  context: { labelEn: 'Context dependent', labelId: 'Tergantung konteks',      icon: <Target className="w-3 h-3 text-gray-400" /> },
};

const GLOSSARY: GlossaryCategory[] = [
  {
    id: 'liquidity',
    name: 'Liquidity',
    nameId: 'Likuiditas',
    color: 'text-sky-600',
    badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200',
    items: [
      {
        name: 'Current Ratio',
        nameId: 'Rasio Lancar',
        formula: 'Current Assets ÷ Current Liabilities',
        description: "Measures a company's ability to pay short-term obligations with short-term assets.",
        descriptionId: 'Mengukur kemampuan perusahaan membayar kewajiban jangka pendek menggunakan aset lancar.',
        benchmark: '1.5–3× is generally healthy',
        benchmarkId: '1,5–3× umumnya dianggap sehat',
        direction: 'range',
      },
      {
        name: 'Quick Ratio (Acid-Test)',
        nameId: 'Rasio Cepat (Uji Asam)',
        formula: '(Current Assets − Inventory) ÷ Current Liabilities',
        description: 'A more conservative liquidity measure excluding less-liquid assets like inventory.',
        descriptionId: 'Ukuran likuiditas yang lebih konservatif, mengecualikan aset kurang likuid seperti persediaan.',
        benchmark: '≥ 1.0× is generally considered healthy',
        benchmarkId: '≥ 1,0× umumnya dianggap sehat',
        direction: 'higher',
      },
      {
        name: 'Cash Ratio',
        nameId: 'Rasio Kas',
        formula: 'Cash & Equivalents ÷ Current Liabilities',
        description: 'The most conservative liquidity measure. Only cash and equivalents are used.',
        descriptionId: 'Ukuran likuiditas paling konservatif. Hanya menggunakan kas dan setara kas.',
        benchmark: 'Very strong: ≥ 0.5×. Most companies operate between 0.1× – 0.5×',
        benchmarkId: 'Sangat kuat: ≥ 0,5×. Kebanyakan perusahaan beroperasi antara 0,1× – 0,5×',
        direction: 'higher',
      },
      {
        name: 'Working Capital',
        nameId: 'Modal Kerja',
        formula: 'Current Assets − Current Liabilities',
        description: 'Net liquid assets available for day-to-day operations. Positive means the company can fund short-term operations.',
        descriptionId: 'Aset likuid bersih yang tersedia untuk operasional harian. Positif berarti perusahaan dapat mendanai operasi jangka pendek.',
        benchmark: 'Positive: healthy buffer. Negative: may struggle to meet current obligations',
        benchmarkId: 'Positif: penyangga sehat. Negatif: mungkin kesulitan memenuhi kewajiban saat ini',
        direction: 'higher',
      },
      {
        name: 'Operating Cash Flow Ratio',
        nameId: 'Rasio Arus Kas Operasi',
        formula: 'Cash Flow from Operations ÷ Current Liabilities',
        description: 'Shows how well operating cash flow can cover current liabilities.',
        descriptionId: 'Menunjukkan seberapa baik arus kas operasi dapat menutup liabilitas lancar.',
        benchmark: 'Strong: ≥ 1×. Moderate: 0.5× – 1×. Weak: < 0.5×',
        benchmarkId: 'Kuat: ≥ 1×. Sedang: 0,5× – 1×. Lemah: < 0,5×',
        direction: 'higher',
      },
      {
        name: 'Interest Coverage Ratio',
        nameId: 'Rasio Perlindungan Bunga',
        formula: 'Operating Income (EBIT) ÷ Interest Expense',
        description: 'Indicates how easily a company can pay interest on outstanding debt from operating earnings.',
        descriptionId: 'Menunjukkan seberapa mudah perusahaan membayar bunga utang dari laba operasi.',
        benchmark: 'Safe: > 3×. Adequate: 1.5× – 3×. Risky: < 1.5×',
        benchmarkId: 'Aman: > 3×. Memadai: 1,5× – 3×. Berisiko: < 1,5×',
        direction: 'higher',
      },
    ],
  },
  {
    id: 'profitability',
    name: 'Profitability',
    nameId: 'Profitabilitas',
    color: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    items: [
      {
        name: 'Gross Profit Margin',
        nameId: 'Margin Laba Kotor',
        formula: '(Gross Profit ÷ Revenue) × 100',
        description: 'Percentage of revenue remaining after deducting cost of goods sold. Reflects pricing efficiency.',
        descriptionId: 'Persentase pendapatan setelah dikurangi harga pokok penjualan. Mencerminkan efisiensi penetapan harga.',
        benchmark: 'Excellent: > 40%. Good: 20–40%. Weak: < 20%. Varies by industry',
        benchmarkId: 'Sangat baik: > 40%. Baik: 20–40%. Lemah: < 20%. Bervariasi per industri',
        direction: 'higher',
      },
      {
        name: 'Net Profit Margin',
        nameId: 'Margin Laba Bersih',
        formula: '(Net Income ÷ Revenue) × 100',
        description: 'The bottom-line profitability ratio. Shows what fraction of revenue becomes profit after all expenses.',
        descriptionId: 'Rasio profitabilitas laba bersih. Menunjukkan berapa bagian pendapatan yang menjadi laba setelah semua biaya.',
        benchmark: 'Excellent: > 10%. Acceptable: 5–10%. Concerning: < 5%',
        benchmarkId: 'Sangat baik: > 10%. Memadai: 5–10%. Mengkhawatirkan: < 5%',
        direction: 'higher',
      },
      {
        name: 'Return on Assets (ROA)',
        nameId: 'Imbal Hasil Aset (ROA)',
        formula: '(Net Income ÷ Total Assets) × 100',
        description: 'Shows how efficiently management converts assets into net income.',
        descriptionId: 'Menunjukkan seberapa efisien manajemen mengubah aset menjadi laba bersih.',
        benchmark: 'Good: > 5%. Average: 2–5%. Poor: < 2%',
        benchmarkId: 'Baik: > 5%. Rata-rata: 2–5%. Buruk: < 2%',
        direction: 'higher',
      },
      {
        name: 'Return on Equity (ROE)',
        nameId: 'Imbal Hasil Ekuitas (ROE)',
        formula: "(Net Income ÷ Shareholder's Equity) × 100",
        description: "Measures how effectively management uses shareholders' equity to generate profit.",
        descriptionId: 'Mengukur seberapa efektif manajemen menggunakan ekuitas pemegang saham untuk menghasilkan laba.',
        benchmark: 'Good: > 15%. Average: 10–15%. Weak: < 10%',
        benchmarkId: 'Baik: > 15%. Rata-rata: 10–15%. Lemah: < 10%',
        direction: 'higher',
      },
      {
        name: 'EBITDA Margin',
        nameId: 'Margin EBITDA',
        formula: '(EBITDA ÷ Revenue) × 100',
        description: 'Operating profitability before interest, taxes, depreciation, and amortization.',
        descriptionId: 'Profitabilitas operasi sebelum bunga, pajak, depresiasi, dan amortisasi.',
        benchmark: 'Good: > 15%. Average: 8–15%. Weak: < 8%',
        benchmarkId: 'Baik: > 15%. Rata-rata: 8–15%. Lemah: < 8%',
        direction: 'higher',
      },
    ],
  },
  {
    id: 'leverage',
    name: 'Leverage',
    nameId: 'Leverage',
    color: 'text-orange-600',
    badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200',
    items: [
      {
        name: 'Debt to Equity Ratio',
        nameId: 'Rasio Utang terhadap Ekuitas',
        formula: "Total Debt ÷ Shareholder's Equity",
        description: 'Compares total debt to shareholder equity. High values indicate aggressive financing through debt.',
        descriptionId: 'Membandingkan total utang dengan ekuitas pemegang saham. Nilai tinggi menunjukkan pembiayaan agresif.',
        benchmark: 'Low risk: < 1×. Moderate: 1× – 2×. High risk: > 2×',
        benchmarkId: 'Risiko rendah: < 1×. Sedang: 1× – 2×. Risiko tinggi: > 2×',
        direction: 'lower',
      },
      {
        name: 'Debt Ratio',
        nameId: 'Rasio Utang',
        formula: 'Total Debt ÷ Total Assets',
        description: 'The proportion of assets financed by debt. A higher ratio means more leverage and financial risk.',
        descriptionId: 'Proporsi aset yang dibiayai utang. Rasio lebih tinggi berarti leverage dan risiko keuangan lebih besar.',
        benchmark: 'Conservative: < 40%. Moderate: 40–60%. Aggressive: > 60%',
        benchmarkId: 'Konservatif: < 40%. Sedang: 40–60%. Agresif: > 60%',
        direction: 'lower',
      },
      {
        name: 'Interest Coverage Ratio',
        nameId: 'Rasio Perlindungan Bunga',
        formula: 'EBIT ÷ Interest Expense',
        description: 'Shows how many times a company can pay its interest expense with current earnings.',
        descriptionId: 'Menunjukkan berapa kali perusahaan dapat membayar beban bunganya dengan laba saat ini.',
        benchmark: 'Safe: > 3×. Borderline: 1.5× – 3×. Danger zone: < 1.5×',
        benchmarkId: 'Aman: > 3×. Batas: 1,5× – 3×. Zona berbahaya: < 1,5×',
        direction: 'higher',
      },
      {
        name: 'Debt Service Coverage (DSCR)',
        nameId: 'Kemampuan Bayar Utang (DSCR)',
        formula: 'Net Operating Income ÷ Total Debt Service',
        description: 'Measures cash flow available to cover annual debt and interest payments. Critical for lenders.',
        descriptionId: 'Mengukur arus kas untuk menutup pembayaran utang dan bunga tahunan. Kritis bagi pemberi pinjaman.',
        benchmark: 'Lenders require: ≥ 1.25×. < 1× means negative cash flow to service debt',
        benchmarkId: 'Disyaratkan pemberi pinjaman: ≥ 1,25×. < 1× berarti arus kas negatif',
        direction: 'higher',
      },
    ],
  },
  {
    id: 'efficiency',
    name: 'Efficiency',
    nameId: 'Efisiensi',
    color: 'text-violet-600',
    badgeClass: 'bg-violet-50 text-violet-700 border border-violet-200',
    items: [
      {
        name: 'Asset Turnover',
        nameId: 'Perputaran Aset',
        formula: 'Revenue ÷ Total Assets',
        description: 'Measures how efficiently a company uses its assets to generate revenue.',
        descriptionId: 'Mengukur seberapa efisien perusahaan menggunakan asetnya untuk menghasilkan pendapatan.',
        benchmark: 'Highly industry-dependent. Retail: 2× – 4×. Manufacturing: 0.5× – 1×',
        benchmarkId: 'Sangat tergantung industri. Ritel: 2× – 4×. Manufaktur: 0,5× – 1×',
        direction: 'higher',
      },
      {
        name: 'Inventory Turnover',
        nameId: 'Perputaran Persediaan',
        formula: 'Cost of Goods Sold ÷ Average Inventory',
        description: 'How many times inventory is sold and replaced in a period. Low turnover suggests excess stock.',
        descriptionId: 'Berapa kali persediaan terjual dan diganti dalam suatu periode. Perputaran rendah menunjukkan stok berlebih.',
        benchmark: 'Good general range: 4× – 8×. Too high may mean stockouts; too low means dead inventory',
        benchmarkId: 'Rentang umum baik: 4× – 8×. Terlalu tinggi berarti kehabisan stok; terlalu rendah berarti persediaan mati',
        direction: 'higher',
      },
      {
        name: 'Days Sales Outstanding (DSO)',
        nameId: 'Hari Penjualan Beredar (DSO)',
        formula: '(Accounts Receivable ÷ Net Credit Sales) × 365',
        description: 'The average days to collect payment after a sale. Lower means faster cash collection.',
        descriptionId: 'Rata-rata hari untuk mengumpulkan pembayaran setelah penjualan. Lebih rendah berarti pengumpulan kas lebih cepat.',
        benchmark: 'Excellent: < 45 days. Acceptable: 45–60 days. Concerning: > 60 days',
        benchmarkId: 'Sangat baik: < 45 hari. Dapat diterima: 45–60 hari. Mengkhawatirkan: > 60 hari',
        direction: 'lower',
      },
    ],
  },
  {
    id: 'valuation',
    name: 'Valuation',
    nameId: 'Valuasi',
    color: 'text-rose-600',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
    items: [
      {
        name: 'Price-to-Earnings (P/E)',
        nameId: 'Harga terhadap Laba (P/E)',
        formula: 'Stock Price ÷ Earnings Per Share',
        description: 'How much investors pay for each dollar of earnings. High P/E suggests growth expectations.',
        descriptionId: 'Seberapa banyak investor membayar untuk setiap dolar laba. P/E tinggi menunjukkan ekspektasi pertumbuhan.',
        benchmark: 'Market average ~15–20×. Growth stocks: 30×+. Value stocks: < 15×',
        benchmarkId: 'Rata-rata pasar ~15–20×. Saham pertumbuhan: > 30×. Saham nilai: < 15×',
        direction: 'context',
      },
      {
        name: 'Price-to-Book (P/B)',
        nameId: 'Harga terhadap Nilai Buku (P/B)',
        formula: 'Stock Price ÷ Book Value Per Share',
        description: 'Compares stock price to net asset value. P/B < 1 may indicate undervaluation.',
        descriptionId: 'Membandingkan harga saham dengan nilai aset bersih. P/B < 1 dapat mengindikasikan undervalue.',
        benchmark: '< 1×: potentially undervalued. 1× – 3×: fair. > 3×: premium',
        benchmarkId: '< 1×: kemungkinan undervalue. 1× – 3×: wajar. > 3×: premium',
        direction: 'lower',
      },
      {
        name: 'EV/EBITDA',
        nameId: 'EV/EBITDA',
        formula: 'Enterprise Value ÷ EBITDA',
        description: 'A capital-structure-neutral valuation multiple. More accurate than P/E for comparing companies.',
        descriptionId: 'Multiple valuasi yang netral terhadap struktur modal. Lebih akurat dari P/E untuk membandingkan perusahaan.',
        benchmark: '< 10×: healthy/undervalued. 10× – 15×: fair. > 15×: premium',
        benchmarkId: '< 10×: sehat/undervalue. 10× – 15×: wajar. > 15×: premium',
        direction: 'lower',
      },
      {
        name: 'Dividend Yield',
        nameId: 'Imbal Hasil Dividen',
        formula: '(Annual Dividend Per Share ÷ Stock Price) × 100',
        description: 'The annual dividend as a percentage of stock price. High yield can be attractive or signal risk.',
        descriptionId: 'Dividen tahunan sebagai persentase harga saham. Yield tinggi bisa menarik atau menandakan risiko.',
        benchmark: 'Attractive income: 2% – 6%. > 6% may signal dividend cut risk',
        benchmarkId: 'Pendapatan menarik: 2% – 6%. > 6% dapat menandakan risiko pemotongan dividen',
        direction: 'range',
      },
    ],
  },
];

const ALL_CATEGORIES = GLOSSARY.map(c => ({ id: c.id, name: c.name, nameId: c.nameId }));

export function GlossaryPage() {
  const { language } = useLanguage();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const toggle = (key: string) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

  const filtered = GLOSSARY
    .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
    .map(cat => ({
      ...cat,
      items: cat.items.filter(item => {
        const q = search.toLowerCase();
        if (!q) return true;
        const name = language === 'id' ? item.nameId : item.name;
        return name.toLowerCase().includes(q) || item.formula.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q);
      }),
    }))
    .filter(cat => cat.items.length > 0);

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-5">
        {language === 'en' ? 'Glossary' : 'Glosarium'}
      </h1>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={language === 'en' ? 'Search ratios...' : 'Cari rasio...'}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
        {[{ id: 'all', name: 'All', nameId: 'Semua' }, ...ALL_CATEGORIES].map(cat => {
          const isActive = activeCategory === cat.id;
          const colors = cat.id !== 'all' ? categoryColors[cat.id] : null;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "shrink-0 text-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap font-medium",
                isActive
                  ? cat.id === 'all'
                    ? "bg-slate-200 border-slate-300 text-slate-700"
                    : `${colors!.bg} ${colors!.text} ${colors!.border}`
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
              )}
            >
              {language === 'id' ? cat.nameId : cat.name}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.flatMap(cat =>
          cat.items.map((item, ii) => {
            const key = `${cat.id}-${ii}`;
            const isOpen = !!openItems[key];
            const dir = directionConfig[item.direction];
            const name = language === 'id' ? item.nameId : item.name;
            const description = language === 'id' ? item.descriptionId : item.description;
            const benchmark = language === 'id' ? item.benchmarkId : item.benchmark;
            const catName = language === 'id' ? cat.nameId : cat.name;

            return (
              <div key={key} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggle(key)}
                  className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground leading-snug">{name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.formula}</p>
                  </div>
                  <span className="mt-0.5 shrink-0 text-muted-foreground">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-3 space-y-3 border-t border-border/50">
                        <span className={cn('inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full', cat.badgeClass)}>
                          {catName}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{description}</p>
                        <div className="flex items-start gap-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl px-3.5 py-2.5">
                          <Target className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-sky-700 dark:text-sky-400 font-medium leading-relaxed">
                            {language === 'en' ? 'Benchmark: ' : 'Tolok ukur: '}{benchmark}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {dir.icon}
                          <span className="text-xs text-muted-foreground">
                            {language === 'id' ? dir.labelId : dir.labelEn}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            {language === 'en' ? 'No ratios found.' : 'Tidak ada rasio ditemukan.'}
          </div>
        )}
      </div>
    </div>
  );
}
