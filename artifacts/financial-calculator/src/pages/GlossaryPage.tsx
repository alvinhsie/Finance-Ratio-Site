import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ArrowUp, ArrowDown, Target, GitCompare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

type Direction = 'higher' | 'lower' | 'range' | 'comparison' | 'context';

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
  items: GlossaryItem[];
}

const directionConfig: Record<Direction, { labelEn: string; labelId: string; className: string; icon: React.ReactNode }> = {
  higher:     { labelEn: 'Higher is Better', labelId: 'Lebih Tinggi Lebih Baik', className: 'bg-green-100 text-green-700',  icon: <ArrowUp className="w-3 h-3" /> },
  lower:      { labelEn: 'Lower is Better',  labelId: 'Lebih Rendah Lebih Baik', className: 'bg-blue-100 text-blue-700',   icon: <ArrowDown className="w-3 h-3" /> },
  range:      { labelEn: 'In Range is Better', labelId: 'Dalam Rentang Terbaik', className: 'bg-yellow-100 text-yellow-700', icon: <Target className="w-3 h-3" /> },
  comparison: { labelEn: 'Compare to Price', labelId: 'Bandingkan ke Harga',    className: 'bg-purple-100 text-purple-700', icon: <GitCompare className="w-3 h-3" /> },
  context:    { labelEn: 'Context Dependent', labelId: 'Tergantung Konteks',    className: 'bg-gray-100 text-gray-600',    icon: <Target className="w-3 h-3" /> },
};

const GLOSSARY: GlossaryCategory[] = [
  {
    id: 'liquidity',
    name: 'Liquidity',
    nameId: 'Likuiditas',
    color: 'text-sky-600 border-sky-200 bg-sky-50',
    items: [
      {
        name: 'Current Ratio',
        nameId: 'Rasio Lancar',
        formula: 'Current Assets ÷ Current Liabilities',
        description: "Measures a company's ability to pay short-term obligations within one year using all current assets.",
        descriptionId: 'Mengukur kemampuan perusahaan membayar kewajiban jangka pendek dalam satu tahun menggunakan semua aset lancar.',
        benchmark: 'Healthy: 1.5× – 3×. Below 1× indicates poor liquidity. Above 3× may signal idle assets.',
        benchmarkId: 'Sehat: 1,5× – 3×. Di bawah 1× menunjukkan likuiditas buruk. Di atas 3× mungkin mengindikasikan aset menganggur.',
        direction: 'range',
      },
      {
        name: 'Quick Ratio',
        nameId: 'Rasio Cepat',
        formula: '(Current Assets − Inventory) ÷ Current Liabilities',
        description: "The acid-test ratio. Measures ability to meet short-term obligations without relying on inventory sales.",
        descriptionId: 'Rasio uji asam. Mengukur kemampuan memenuhi kewajiban jangka pendek tanpa bergantung pada penjualan persediaan.',
        benchmark: 'Good: > 1×. Below 1× means reliance on inventory to cover liabilities.',
        benchmarkId: 'Baik: > 1×. Di bawah 1× berarti ketergantungan pada persediaan untuk menutup liabilitas.',
        direction: 'higher',
      },
      {
        name: 'Cash Ratio',
        nameId: 'Rasio Kas',
        formula: 'Cash & Cash Equivalents ÷ Current Liabilities',
        description: "The most conservative liquidity measure. Only cash and equivalents are used — no receivables or inventory.",
        descriptionId: 'Ukuran likuiditas paling konservatif. Hanya menggunakan kas dan setara kas — tanpa piutang atau persediaan.',
        benchmark: 'Very strong: ≥ 0.5×. Very low: < 0.1×. Most companies operate between 0.1× and 0.5×.',
        benchmarkId: 'Sangat kuat: ≥ 0,5×. Sangat rendah: < 0,1×. Kebanyakan perusahaan beroperasi antara 0,1× hingga 0,5×.',
        direction: 'higher',
      },
      {
        name: 'Working Capital',
        nameId: 'Modal Kerja',
        formula: 'Current Assets − Current Liabilities',
        description: "The net amount of liquid assets available for day-to-day operations. Positive means the company can fund short-term operations.",
        descriptionId: 'Jumlah bersih aset likuid yang tersedia untuk operasional harian. Positif berarti perusahaan dapat mendanai operasi jangka pendek.',
        benchmark: 'Positive: healthy operational buffer. Negative: company may struggle to meet current obligations.',
        benchmarkId: 'Positif: penyangga operasional yang sehat. Negatif: perusahaan mungkin kesulitan memenuhi kewajiban saat ini.',
        direction: 'higher',
      },
      {
        name: 'Operating Cash Flow Ratio',
        nameId: 'Rasio Arus Kas Operasi',
        formula: 'Cash Flow from Operations ÷ Current Liabilities',
        description: "Shows how well operating cash flow can cover current liabilities. Preferred over Current Ratio by analysts.",
        descriptionId: 'Menunjukkan seberapa baik arus kas operasi dapat menutup liabilitas lancar. Lebih disukai analis daripada Rasio Lancar.',
        benchmark: 'Strong: ≥ 1×. Moderate: 0.5× – 1×. Weak: < 0.5×.',
        benchmarkId: 'Kuat: ≥ 1×. Sedang: 0,5× – 1×. Lemah: < 0,5×.',
        direction: 'higher',
      },
      {
        name: 'Interest Coverage Ratio',
        nameId: 'Rasio Perlindungan Bunga',
        formula: 'Operating Income (EBIT) ÷ Interest Expense',
        description: "Indicates how easily a company can pay interest on outstanding debt from operating earnings.",
        descriptionId: 'Menunjukkan seberapa mudah perusahaan membayar bunga utang dari laba operasi.',
        benchmark: 'Safe: > 3×. Adequate: 1.5× – 3×. Risky: < 1.5× (risk of default).',
        benchmarkId: 'Aman: > 3×. Memadai: 1,5× – 3×. Berisiko: < 1,5× (risiko gagal bayar).',
        direction: 'higher',
      },
    ],
  },
  {
    id: 'profitability',
    name: 'Profitability',
    nameId: 'Profitabilitas',
    color: 'text-emerald-600 border-emerald-200 bg-emerald-50',
    items: [
      {
        name: 'Gross Profit Margin',
        nameId: 'Margin Laba Kotor',
        formula: '(Gross Profit ÷ Revenue) × 100',
        description: "The percentage of revenue remaining after deducting the cost of goods sold. Reflects pricing efficiency and production costs.",
        descriptionId: 'Persentase pendapatan yang tersisa setelah dikurangi harga pokok penjualan. Mencerminkan efisiensi penetapan harga dan biaya produksi.',
        benchmark: 'Excellent: > 40%. Good: 20–40%. Weak: < 20%. Varies widely by industry.',
        benchmarkId: 'Sangat baik: > 40%. Baik: 20–40%. Lemah: < 20%. Sangat bervariasi antar industri.',
        direction: 'higher',
      },
      {
        name: 'Net Profit Margin',
        nameId: 'Margin Laba Bersih',
        formula: '(Net Income ÷ Revenue) × 100',
        description: "The bottom-line profitability ratio. Shows what fraction of each dollar of revenue becomes profit after all expenses.",
        descriptionId: 'Rasio profitabilitas laba bersih. Menunjukkan berapa bagian dari setiap rupiah pendapatan yang menjadi laba setelah semua biaya.',
        benchmark: 'Excellent: > 10%. Acceptable: 5–10%. Concerning: < 5%. Retail typically runs 1–3%.',
        benchmarkId: 'Sangat baik: > 10%. Memadai: 5–10%. Mengkhawatirkan: < 5%. Ritel biasanya 1–3%.',
        direction: 'higher',
      },
      {
        name: 'Return on Assets (ROA)',
        nameId: 'Imbal Hasil Aset (ROA)',
        formula: '(Net Income ÷ Total Assets) × 100',
        description: "Shows how efficiently management converts the money used to purchase assets into net income.",
        descriptionId: 'Menunjukkan seberapa efisien manajemen mengubah aset menjadi laba bersih.',
        benchmark: 'Good: > 5%. Average: 2–5%. Poor: < 2%. Asset-heavy industries (utilities, banks) naturally run lower.',
        benchmarkId: 'Baik: > 5%. Rata-rata: 2–5%. Buruk: < 2%. Industri padat aset (utilitas, bank) secara alami lebih rendah.',
        direction: 'higher',
      },
      {
        name: 'Return on Equity (ROE)',
        nameId: 'Imbal Hasil Ekuitas (ROE)',
        formula: '(Net Income ÷ Shareholder\'s Equity) × 100',
        description: "Measures how effectively management uses shareholders' equity to generate profit.",
        descriptionId: 'Mengukur seberapa efektif manajemen menggunakan ekuitas pemegang saham untuk menghasilkan laba.',
        benchmark: 'Good: > 15%. Average: 10–15%. Weak: < 10%. Buffett targets 15%+ consistently.',
        benchmarkId: 'Baik: > 15%. Rata-rata: 10–15%. Lemah: < 10%. Buffett menargetkan > 15% secara konsisten.',
        direction: 'higher',
      },
      {
        name: 'EBITDA Margin',
        nameId: 'Margin EBITDA',
        formula: '(EBITDA ÷ Revenue) × 100',
        description: "Operating profitability before interest, taxes, depreciation, and amortization. Useful for comparing companies across industries.",
        descriptionId: 'Profitabilitas operasi sebelum bunga, pajak, depresiasi, dan amortisasi. Berguna untuk membandingkan perusahaan lintas industri.',
        benchmark: 'Good: > 15%. Average: 8–15%. Weak: < 8%. Software companies often exceed 30%.',
        benchmarkId: 'Baik: > 15%. Rata-rata: 8–15%. Lemah: < 8%. Perusahaan perangkat lunak sering melebihi 30%.',
        direction: 'higher',
      },
    ],
  },
  {
    id: 'leverage',
    name: 'Leverage',
    nameId: 'Leverage',
    color: 'text-orange-600 border-orange-200 bg-orange-50',
    items: [
      {
        name: 'Debt to Equity Ratio',
        nameId: 'Rasio Utang terhadap Ekuitas',
        formula: 'Total Debt ÷ Shareholder\'s Equity',
        description: "Compares total debt to shareholder equity. High values indicate aggressive financing through debt.",
        descriptionId: 'Membandingkan total utang dengan ekuitas pemegang saham. Nilai tinggi menunjukkan pembiayaan agresif melalui utang.',
        benchmark: 'Low risk: < 1×. Moderate: 1× – 2×. High risk: > 2×. Capital-intensive industries may tolerate higher.',
        benchmarkId: 'Risiko rendah: < 1×. Sedang: 1× – 2×. Risiko tinggi: > 2×. Industri padat modal mungkin mentolerir lebih tinggi.',
        direction: 'lower',
      },
      {
        name: 'Debt Ratio',
        nameId: 'Rasio Utang',
        formula: 'Total Debt ÷ Total Assets',
        description: "The proportion of assets financed by debt. A higher ratio means more leverage and higher financial risk.",
        descriptionId: 'Proporsi aset yang dibiayai oleh utang. Rasio yang lebih tinggi berarti leverage lebih besar dan risiko keuangan lebih tinggi.',
        benchmark: 'Conservative: < 40%. Moderate: 40–60%. Aggressive: > 60%.',
        benchmarkId: 'Konservatif: < 40%. Sedang: 40–60%. Agresif: > 60%.',
        direction: 'lower',
      },
      {
        name: 'Interest Coverage Ratio',
        nameId: 'Rasio Perlindungan Bunga',
        formula: 'EBIT ÷ Interest Expense',
        description: "Shows how many times over a company can pay its interest expense with current earnings.",
        descriptionId: 'Menunjukkan berapa kali perusahaan dapat membayar beban bunganya dengan laba saat ini.',
        benchmark: 'Safe: > 3×. Borderline: 1.5× – 3×. Danger zone: < 1.5×.',
        benchmarkId: 'Aman: > 3×. Batas: 1,5× – 3×. Zona berbahaya: < 1,5×.',
        direction: 'higher',
      },
      {
        name: 'Debt Service Coverage Ratio (DSCR)',
        nameId: 'Rasio Kemampuan Bayar Utang (DSCR)',
        formula: 'Net Operating Income ÷ Total Debt Service',
        description: "Measures available cash flow to cover annual debt and interest payments. Critical for lenders.",
        descriptionId: 'Mengukur arus kas yang tersedia untuk menutup pembayaran utang dan bunga tahunan. Kritis bagi pemberi pinjaman.',
        benchmark: 'Lenders require: ≥ 1.25×. < 1× means negative cash flow to service debt.',
        benchmarkId: 'Disyaratkan pemberi pinjaman: ≥ 1,25×. < 1× berarti arus kas negatif untuk membayar utang.',
        direction: 'higher',
      },
    ],
  },
  {
    id: 'efficiency',
    name: 'Efficiency',
    nameId: 'Efisiensi',
    color: 'text-violet-600 border-violet-200 bg-violet-50',
    items: [
      {
        name: 'Asset Turnover',
        nameId: 'Perputaran Aset',
        formula: 'Revenue ÷ Total Assets',
        description: "Measures how efficiently a company uses its assets to generate revenue. Higher is more efficient.",
        descriptionId: 'Mengukur seberapa efisien perusahaan menggunakan asetnya untuk menghasilkan pendapatan. Lebih tinggi berarti lebih efisien.',
        benchmark: 'Highly industry-dependent. Retail: 2× – 4×. Manufacturing: 0.5× – 1×. Always compare within the same sector.',
        benchmarkId: 'Sangat tergantung industri. Ritel: 2× – 4×. Manufaktur: 0,5× – 1×. Selalu bandingkan dalam sektor yang sama.',
        direction: 'higher',
      },
      {
        name: 'Inventory Turnover',
        nameId: 'Perputaran Persediaan',
        formula: 'Cost of Goods Sold ÷ Average Inventory',
        description: "How many times inventory is sold and replaced in a period. Low turnover suggests excess stock or weak sales.",
        descriptionId: 'Berapa kali persediaan terjual dan diganti dalam suatu periode. Perputaran rendah menunjukkan stok berlebih atau penjualan lemah.',
        benchmark: 'Good general range: 4× – 8×. Too high may mean stockouts; too low means dead inventory.',
        benchmarkId: 'Rentang umum yang baik: 4× – 8×. Terlalu tinggi dapat berarti kehabisan stok; terlalu rendah berarti persediaan mati.',
        direction: 'higher',
      },
      {
        name: 'Days Sales Outstanding (DSO)',
        nameId: 'Hari Penjualan Beredar (DSO)',
        formula: '(Accounts Receivable ÷ Net Credit Sales) × 365',
        description: "The average number of days it takes to collect payment after a sale. Lower means faster cash collection.",
        descriptionId: 'Rata-rata hari yang dibutuhkan untuk mengumpulkan pembayaran setelah penjualan. Lebih rendah berarti pengumpulan kas lebih cepat.',
        benchmark: 'Excellent: < 45 days. Acceptable: 45–60 days. Concerning: > 60 days.',
        benchmarkId: 'Sangat baik: < 45 hari. Dapat diterima: 45–60 hari. Mengkhawatirkan: > 60 hari.',
        direction: 'lower',
      },
    ],
  },
  {
    id: 'valuation',
    name: 'Valuation',
    nameId: 'Valuasi',
    color: 'text-rose-600 border-rose-200 bg-rose-50',
    items: [
      {
        name: 'Price-to-Earnings (P/E)',
        nameId: 'Harga terhadap Laba (P/E)',
        formula: 'Stock Price ÷ Earnings Per Share',
        description: "How much investors pay for each dollar of earnings. High P/E suggests growth expectations; low may signal undervaluation.",
        descriptionId: 'Seberapa banyak investor membayar untuk setiap dolar laba. P/E tinggi menunjukkan ekspektasi pertumbuhan; rendah mungkin mengindikasikan undervalue.',
        benchmark: 'Market average ~15–20×. Growth stocks: 30×+. Value stocks: < 15×. Negative P/E = net loss.',
        benchmarkId: 'Rata-rata pasar ~15–20×. Saham pertumbuhan: > 30×. Saham nilai: < 15×. P/E negatif = rugi bersih.',
        direction: 'context',
      },
      {
        name: 'Price-to-Book (P/B)',
        nameId: 'Harga terhadap Nilai Buku (P/B)',
        formula: 'Stock Price ÷ Book Value Per Share',
        description: "Compares stock price to net asset value. P/B < 1 may indicate undervaluation or distress.",
        descriptionId: 'Membandingkan harga saham dengan nilai aset bersih. P/B < 1 dapat mengindikasikan undervalue atau masalah.',
        benchmark: '< 1×: potentially undervalued. 1× – 3×: fair. > 3×: premium — growth stocks often exceed this.',
        benchmarkId: '< 1×: kemungkinan undervalue. 1× – 3×: wajar. > 3×: premium — saham pertumbuhan sering melebihi ini.',
        direction: 'lower',
      },
      {
        name: 'EV/EBITDA',
        nameId: 'EV/EBITDA',
        formula: 'Enterprise Value ÷ EBITDA',
        description: "A capital-structure-neutral valuation multiple. More accurate than P/E for comparing companies with different debt levels.",
        descriptionId: 'Multiple valuasi yang netral terhadap struktur modal. Lebih akurat dari P/E untuk membandingkan perusahaan dengan tingkat utang berbeda.',
        benchmark: '< 10×: healthy / undervalued. 10× – 15×: fair. > 15×: premium. Varies by sector.',
        benchmarkId: '< 10×: sehat / undervalue. 10× – 15×: wajar. > 15×: premium. Bervariasi per sektor.',
        direction: 'lower',
      },
      {
        name: 'Dividend Yield',
        nameId: 'Imbal Hasil Dividen',
        formula: '(Annual Dividend Per Share ÷ Stock Price) × 100',
        description: "The annual dividend as a percentage of the stock price. High yield can be attractive or a sign of a falling stock price.",
        descriptionId: 'Dividen tahunan sebagai persentase harga saham. Yield tinggi bisa menarik atau tanda harga saham yang jatuh.',
        benchmark: 'Attractive income: 2% – 6%. > 6% may signal a dividend cut risk. 0%: growth company.',
        benchmarkId: 'Pendapatan menarik: 2% – 6%. > 6% dapat menandakan risiko pemotongan dividen. 0%: perusahaan pertumbuhan.',
        direction: 'range',
      },
    ],
  },
  {
    id: 'fair-value',
    name: 'Fair Value',
    nameId: 'Nilai Wajar',
    color: 'text-teal-600 border-teal-200 bg-teal-50',
    items: [
      {
        name: 'Graham Number',
        nameId: 'Angka Graham',
        formula: '√(22.5 × EPS × Book Value Per Share)',
        description: "Benjamin Graham's upper-bound fair value. A stock trading below this level is considered conservatively valued.",
        descriptionId: 'Nilai wajar batas atas versi Benjamin Graham. Saham yang diperdagangkan di bawah level ini dianggap bernilai konservatif.',
        benchmark: 'Stock price < Graham Number: potentially undervalued. Stock price > Graham Number: potentially overvalued.',
        benchmarkId: 'Harga saham < Angka Graham: kemungkinan undervalue. Harga saham > Angka Graham: kemungkinan overvalue.',
        direction: 'comparison',
      },
      {
        name: 'Graham Intrinsic Value',
        nameId: 'Nilai Intrinsik Graham',
        formula: 'EPS × (8.5 + 2g) × (4.4 ÷ AAA Bond Yield)',
        description: "Graham's revised formula incorporating expected growth and current bond yields for a more dynamic valuation.",
        descriptionId: 'Formula revisi Graham yang menggabungkan pertumbuhan yang diharapkan dan yield obligasi saat ini untuk valuasi yang lebih dinamis.',
        benchmark: 'Margin of safety if stock trades ≥ 15% below intrinsic value. Premium if > 15% above.',
        benchmarkId: 'Margin of safety jika saham diperdagangkan ≥ 15% di bawah nilai intrinsik. Premium jika > 15% di atas.',
        direction: 'comparison',
      },
      {
        name: 'Peter Lynch Fair Value',
        nameId: 'Nilai Wajar Peter Lynch',
        formula: 'EPS × Earnings Growth Rate (%)',
        description: "Lynch's rule: a fairly valued stock has a P/E equal to its growth rate (PEG = 1). Simple and intuitive.",
        descriptionId: 'Aturan Lynch: saham yang dinilai wajar memiliki P/E setara tingkat pertumbuhannya (PEG = 1). Sederhana dan intuitif.',
        benchmark: 'PEG < 1 (price < fair value): attractive. PEG > 1 (price > fair value): you\'re paying a growth premium.',
        benchmarkId: 'PEG < 1 (harga < nilai wajar): menarik. PEG > 1 (harga > nilai wajar): Anda membayar premi pertumbuhan.',
        direction: 'comparison',
      },
      {
        name: 'Dividend Discount Model (DDM)',
        nameId: 'Model Diskon Dividen (DDM)',
        formula: 'D₁ ÷ (Required Return − Dividend Growth Rate)',
        description: "Values a stock as the present value of all future dividends. Best for stable, dividend-paying companies.",
        descriptionId: 'Menilai saham sebagai nilai sekarang dari semua dividen masa depan. Terbaik untuk perusahaan stabil yang membayar dividen.',
        benchmark: 'Stock price below DDM value: undervalued by the model. Above: overvalued. Highly sensitive to growth and rate assumptions.',
        benchmarkId: 'Harga saham di bawah nilai DDM: undervalue menurut model. Di atas: overvalue. Sangat sensitif terhadap asumsi pertumbuhan dan tingkat.',
        direction: 'comparison',
      },
      {
        name: 'Simple DCF Fair Value',
        nameId: 'Nilai Wajar DCF Sederhana',
        formula: 'Σ [FCF/Share × (1+g)ᵗ ÷ (1+r)ᵗ] + Terminal Value',
        description: "Discounted Cash Flow valuation — projects future free cash flows and discounts them to today's value.",
        descriptionId: 'Valuasi Arus Kas Terdiskon — memproyeksikan arus kas bebas masa depan dan mendiskontokannya ke nilai saat ini.',
        benchmark: 'Stock price ≥ 20% below DCF value: strong buy zone. Price above DCF: overvalued. Sensitive to rate and growth assumptions.',
        benchmarkId: 'Harga saham ≥ 20% di bawah nilai DCF: zona beli kuat. Harga di atas DCF: overvalue. Sensitif terhadap asumsi tingkat dan pertumbuhan.',
        direction: 'comparison',
      },
    ],
  },
];

export function GlossaryPage() {
  const { language, t } = useLanguage();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const toggle = (key: string) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

  const filtered = GLOSSARY.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const q = search.toLowerCase();
      if (!q) return true;
      const name = language === 'id' ? item.nameId : item.name;
      return name.toLowerCase().includes(q) || item.formula.toLowerCase().includes(q);
    }),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground tracking-tight mb-2">
          {language === 'en' ? 'Glossary' : 'Glosarium'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          {language === 'en'
            ? 'Definitions, formulas, and benchmarks for every ratio in the calculator.'
            : 'Definisi, rumus, dan tolok ukur untuk setiap rasio dalam kalkulator.'}
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={language === 'en' ? 'Search ratios…' : 'Cari rasio…'}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div className="space-y-8">
        {filtered.map((cat, ci) => (
          <motion.section
            key={cat.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.06 }}
          >
            <div className={cn('inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mb-4', cat.color)}>
              {language === 'id' ? cat.nameId : cat.name}
            </div>

            <div className="space-y-2">
              {cat.items.map((item, ii) => {
                const key = `${cat.id}-${ii}`;
                const isOpen = !!openItems[key];
                const dir = directionConfig[item.direction];
                const name = language === 'id' ? item.nameId : item.name;
                const description = language === 'id' ? item.descriptionId : item.description;
                const benchmark = language === 'id' ? item.benchmarkId : item.benchmark;

                return (
                  <div key={key} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{name}</span>
                          <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', dir.className)}>
                            {dir.icon}
                            {language === 'id' ? dir.labelId : dir.labelEn}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono mt-0.5 block truncate">{item.formula}</span>
                      </div>
                      <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
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
                          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/50">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                {language === 'en' ? 'What it measures' : 'Apa yang diukur'}
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">{description}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                {language === 'en' ? 'Formula' : 'Rumus'}
                              </p>
                              <code className="text-xs bg-muted px-3 py-1.5 rounded-lg inline-block font-mono text-foreground">{item.formula}</code>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                {language === 'en' ? 'Benchmark' : 'Tolok Ukur'}
                              </p>
                              <p className="text-sm text-foreground leading-relaxed">{benchmark}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
