export type Language = "en" | "id";

export const translations = {
  en: {
    // Login
    login: {
      tagline: "Sign in to access the calculator",
      username: "Username",
      password: "Password",
      usernamePlaceholder: "Enter your username",
      passwordPlaceholder: "Enter your password",
      signIn: "Sign In",
      signingIn: "Signing in...",
      error: "Incorrect username or password. Please try again.",
      footer: "Financial Ratio Calculator",
    },
    // Layout
    layout: {
      categories: "Categories",
      home: "Home",
      proTip: "Pro tip",
      proTipText: "Ratios are most useful when compared against industry averages or historical data.",
    },
    // Home page
    home: {
      badge: (total: number, cats: number) => `${total} Ratios across ${cats} categories`,
      title: "Financial Ratio\nCalculator",
      subtitle: "Accurate ratio analysis for investment decisions.",
      ratios: (n: number) => `${n} ratio${n !== 1 ? "s" : ""}`,
      cta: "Select a category above to start calculating",
    },
    // Category page
    category: {
      calculators: "Calculators",
    },
    // Ratio card
    card: {
      calculate: "Calculate",
      reset: "Reset values",
      result: "Result",
      good: "Good",
      average: "Average",
      poor: "Poor",
      neutral: "Neutral",
    },
    // Categories
    categories: {
      liquidity: {
        name: "Liquidity",
        description: "Measure a company's ability to pay off its short-term debt obligations.",
      },
      profitability: {
        name: "Profitability",
        description: "Evaluate a company's ability to generate earnings relative to revenue, assets, or equity.",
      },
      leverage: {
        name: "Leverage & Solvency",
        description: "Determine the extent to which a company uses debt to finance its assets and its ability to meet long-term obligations.",
      },
      efficiency: {
        name: "Efficiency",
        description: "Measure how well a company uses its assets and liabilities internally.",
      },
      valuation: {
        name: "Valuation",
        description: "Assess the attractiveness of a stock or investment.",
      },
    },
    // Ratio definitions
    ratios: {
      "current-ratio": {
        name: "Current Ratio",
        description: "Measures a company's ability to pay short-term obligations or those due within one year.",
        formulaDisplay: "Current Assets ÷ Current Liabilities",
        inputs: {
          currentAssets: "Current Assets ($)",
          currentLiabilities: "Current Liabilities ($)",
        },
        interpretations: {
          good: "Strong liquidity position. Generally, a ratio between 1.5 and 3 is considered healthy.",
          neutral: "Very high liquidity. Might indicate inefficient use of assets.",
          poor: "Poor liquidity. Company may struggle to meet short-term obligations.",
          average: "Adequate liquidity.",
        },
      },
      "quick-ratio": {
        name: "Quick Ratio (Acid Test)",
        description: "Measures a company's capacity to pay its current liabilities without needing to sell its inventory.",
        formulaDisplay: "(Current Assets - Inventory) ÷ Current Liabilities",
        inputs: {
          currentAssets: "Current Assets ($)",
          inventory: "Inventory ($)",
          currentLiabilities: "Current Liabilities ($)",
        },
        interpretations: {
          good: "Strong ability to meet short-term obligations without selling inventory.",
          poor: "May rely too heavily on inventory to meet short-term obligations.",
          average: "Acceptable quick liquidity.",
        },
      },
      "cash-ratio": {
        name: "Cash Ratio",
        description: "The most conservative liquidity ratio. It measures a firm's ability to pay off current liabilities with only cash and cash equivalents.",
        formulaDisplay: "Cash & Equivalents ÷ Current Liabilities",
        inputs: {
          cash: "Cash & Equivalents ($)",
          currentLiabilities: "Current Liabilities ($)",
        },
        interpretations: {
          good: "Very strong cash position.",
          poor: "Very low cash reserves, high reliance on receivables/inventory.",
          neutral: "Ratio generally below 1 is common, as companies rarely keep enough cash to cover all current liabilities.",
        },
      },
      "gross-margin": {
        name: "Gross Profit Margin",
        description: "The proportion of money left over from revenues after accounting for the cost of goods sold (COGS).",
        formulaDisplay: "(Gross Profit ÷ Revenue) × 100",
        inputs: {
          grossProfit: "Gross Profit ($)",
          revenue: "Revenue ($)",
        },
        interpretations: {
          any: "Highly dependent on industry. Higher is always better, showing efficient production/pricing.",
        },
      },
      "net-margin": {
        name: "Net Profit Margin",
        description: "Shows how much of each dollar collected by a company as revenue translates into profit.",
        formulaDisplay: "(Net Income ÷ Revenue) × 100",
        inputs: {
          netIncome: "Net Income ($)",
          revenue: "Revenue ($)",
        },
        interpretations: {
          any: ">10% is generally considered excellent for most industries, though retail operates lower.",
        },
      },
      roa: {
        name: "Return on Assets (ROA)",
        description: "Indicates how profitable a company is relative to its total assets.",
        formulaDisplay: "(Net Income ÷ Total Assets) × 100",
        inputs: {
          netIncome: "Net Income ($)",
          totalAssets: "Total Assets ($)",
        },
        interpretations: {
          any: "Over 5% is generally good. Shows how efficiently management uses assets to generate earnings.",
        },
      },
      roe: {
        name: "Return on Equity (ROE)",
        description: "Measure of financial performance calculated by dividing net income by shareholders' equity.",
        formulaDisplay: "(Net Income ÷ Shareholder's Equity) × 100",
        inputs: {
          netIncome: "Net Income ($)",
          equity: "Shareholder's Equity ($)",
        },
        interpretations: {
          any: "15-20% is widely considered good. Measures how effectively management uses investors' money.",
        },
      },
      "ebitda-margin": {
        name: "EBITDA Margin",
        description: "Measures a company's operating profitability as a percentage of its revenue.",
        formulaDisplay: "(EBITDA ÷ Revenue) × 100",
        inputs: {
          ebitda: "EBITDA ($)",
          revenue: "Revenue ($)",
        },
        interpretations: {
          any: "Provides a clear view of core operational profitability by stripping out non-operating expenses.",
        },
      },
      "debt-to-equity": {
        name: "Debt to Equity Ratio",
        description: "Evaluates a company's financial leverage by comparing its total liabilities to shareholder equity.",
        formulaDisplay: "Total Debt ÷ Shareholder's Equity",
        inputs: {
          totalDebt: "Total Debt ($)",
          equity: "Shareholder's Equity ($)",
        },
        interpretations: {
          any: "A ratio > 2 is generally considered risky (highly leveraged), though acceptable in capital-intensive industries.",
        },
      },
      "debt-ratio": {
        name: "Debt Ratio",
        description: "Measures the proportion of a company's assets that are financed by debt.",
        formulaDisplay: "Total Debt ÷ Total Assets",
        inputs: {
          totalDebt: "Total Debt ($)",
          totalAssets: "Total Assets ($)",
        },
        interpretations: {
          any: "A ratio greater than 0.5 (50%) indicates that most of the company's assets are financed through debt.",
        },
      },
      "interest-coverage": {
        name: "Interest Coverage Ratio",
        description: "Determines how easily a company can pay interest on its outstanding debt.",
        formulaDisplay: "EBIT ÷ Interest Expense",
        inputs: {
          ebit: "EBIT ($)",
          interestExpense: "Interest Expense ($)",
        },
        interpretations: {
          any: "A ratio above 3 is generally considered safe. Below 1.5 warns of potential default risk.",
        },
      },
      dscr: {
        name: "Debt Service Coverage Ratio (DSCR)",
        description: "Measures cash flow available to pay current debt obligations.",
        formulaDisplay: "Net Operating Income ÷ Total Debt Service",
        inputs: {
          noi: "Net Operating Income ($)",
          debtService: "Total Debt Service ($)",
        },
        interpretations: {
          any: "A DSCR less than 1 means negative cash flow. Lenders usually require a DSCR of at least 1.2x to 1.25x.",
        },
      },
      "asset-turnover": {
        name: "Asset Turnover",
        description: "Measures the efficiency of a company's use of its assets in generating sales revenue.",
        formulaDisplay: "Revenue ÷ Total Assets",
        inputs: {
          revenue: "Revenue ($)",
          totalAssets: "Total Assets ($)",
        },
        interpretations: {
          any: "Highly industry dependent. Retailers have high turnover, utilities have low. Higher is better within peers.",
        },
      },
      "inventory-turnover": {
        name: "Inventory Turnover",
        description: "Shows how many times a company has sold and replaced inventory during a given period.",
        formulaDisplay: "Cost of Goods Sold ÷ Average Inventory",
        inputs: {
          cogs: "Cost of Goods Sold (COGS) ($)",
          avgInventory: "Average Inventory ($)",
        },
        interpretations: {
          any: "A high ratio implies strong sales or insufficient inventory. A low ratio implies weak sales or excess inventory.",
        },
      },
      dso: {
        name: "Days Sales Outstanding (DSO)",
        description: "The average number of days that it takes a company to collect payment after a sale has been made.",
        formulaDisplay: "(Accounts Receivable ÷ Net Credit Sales) × 365",
        inputs: {
          ar: "Accounts Receivable ($)",
          sales: "Net Credit Sales ($)",
        },
        interpretations: {
          any: "Under 45 days is generally considered excellent. Over 60 days may indicate collection issues.",
        },
      },
      "pe-ratio": {
        name: "Price-to-Earnings (P/E)",
        description: "Relates a company's share price to its earnings per share.",
        formulaDisplay: "Stock Price ÷ Earnings Per Share",
        inputs: {
          price: "Stock Price ($)",
          eps: "Earnings Per Share ($)",
        },
        interpretations: {
          any: "A high P/E could mean the stock is overvalued, or that investors expect high growth. Compare to industry average.",
        },
      },
      "pb-ratio": {
        name: "Price-to-Book (P/B)",
        description: "Compares a firm's market capitalization to its book value.",
        formulaDisplay: "Stock Price ÷ Book Value Per Share",
        inputs: {
          price: "Stock Price ($)",
          bvps: "Book Value Per Share ($)",
        },
        interpretations: {
          any: "P/B < 1 may indicate an undervalued stock, or something is fundamentally wrong with the company.",
        },
      },
      "ev-ebitda": {
        name: "EV/EBITDA",
        description: "A valuation multiple that is often used in addition to, or as an alternative to, the P/E ratio.",
        formulaDisplay: "Enterprise Value ÷ EBITDA",
        inputs: {
          ev: "Enterprise Value ($)",
          ebitda: "EBITDA ($)",
        },
        interpretations: {
          any: "A ratio under 10x is generally viewed as healthy and below average (potentially undervalued). Highly industry-dependent.",
        },
      },
      "dividend-yield": {
        name: "Dividend Yield",
        description: "The amount of money a company pays shareholders for owning a share of its stock divided by its current stock price.",
        formulaDisplay: "(Annual Dividend Per Share ÷ Stock Price) × 100",
        inputs: {
          dividend: "Annual Dividend Per Share ($)",
          price: "Stock Price ($)",
        },
        interpretations: {
          any: "2-6% is typical for mature companies. Yields > 6% might signal risk that the dividend will be cut.",
        },
      },
    },
  },

  id: {
    login: {
      tagline: "Masuk untuk mengakses kalkulator",
      username: "Nama Pengguna",
      password: "Kata Sandi",
      usernamePlaceholder: "Masukkan nama pengguna",
      passwordPlaceholder: "Masukkan kata sandi",
      signIn: "Masuk",
      signingIn: "Sedang masuk...",
      error: "Nama pengguna atau kata sandi salah. Silakan coba lagi.",
      footer: "Kalkulator Rasio Keuangan",
    },
    layout: {
      categories: "Kategori",
      home: "Beranda",
      proTip: "Tips",
      proTipText: "Rasio paling berguna bila dibandingkan dengan rata-rata industri atau data historis.",
    },
    home: {
      badge: (total: number, cats: number) => `${total} Rasio dalam ${cats} kategori`,
      title: "Kalkulator\nRasio Keuangan",
      subtitle: "Analisis rasio yang akurat untuk keputusan investasi.",
      ratios: (n: number) => `${n} rasio`,
      cta: "Pilih kategori di atas untuk mulai menghitung",
    },
    category: {
      calculators: "Kalkulator",
    },
    card: {
      calculate: "Hitung",
      reset: "Reset nilai",
      result: "Hasil",
      good: "Baik",
      average: "Cukup",
      poor: "Buruk",
      neutral: "Netral",
    },
    categories: {
      liquidity: {
        name: "Likuiditas",
        description: "Mengukur kemampuan perusahaan untuk membayar kewajiban utang jangka pendeknya.",
      },
      profitability: {
        name: "Profitabilitas",
        description: "Mengevaluasi kemampuan perusahaan menghasilkan laba relatif terhadap pendapatan, aset, atau ekuitas.",
      },
      leverage: {
        name: "Leverage & Solvabilitas",
        description: "Menentukan sejauh mana perusahaan menggunakan utang untuk membiayai aset dan kemampuannya memenuhi kewajiban jangka panjang.",
      },
      efficiency: {
        name: "Efisiensi",
        description: "Mengukur seberapa baik perusahaan menggunakan aset dan kewajibannya secara internal.",
      },
      valuation: {
        name: "Valuasi",
        description: "Menilai daya tarik suatu saham atau investasi.",
      },
    },
    ratios: {
      "current-ratio": {
        name: "Rasio Lancar",
        description: "Mengukur kemampuan perusahaan membayar kewajiban jangka pendek atau yang jatuh tempo dalam satu tahun.",
        formulaDisplay: "Aset Lancar ÷ Liabilitas Lancar",
        inputs: {
          currentAssets: "Aset Lancar (Rp)",
          currentLiabilities: "Liabilitas Lancar (Rp)",
        },
        interpretations: {
          good: "Posisi likuiditas kuat. Umumnya, rasio antara 1,5 dan 3 dianggap sehat.",
          neutral: "Likuiditas sangat tinggi. Mungkin menunjukkan penggunaan aset yang tidak efisien.",
          poor: "Likuiditas buruk. Perusahaan mungkin kesulitan memenuhi kewajiban jangka pendek.",
          average: "Likuiditas yang memadai.",
        },
      },
      "quick-ratio": {
        name: "Rasio Cepat (Acid Test)",
        description: "Mengukur kapasitas perusahaan membayar liabilitas lancar tanpa perlu menjual persediaan.",
        formulaDisplay: "(Aset Lancar - Persediaan) ÷ Liabilitas Lancar",
        inputs: {
          currentAssets: "Aset Lancar (Rp)",
          inventory: "Persediaan (Rp)",
          currentLiabilities: "Liabilitas Lancar (Rp)",
        },
        interpretations: {
          good: "Kemampuan kuat memenuhi kewajiban jangka pendek tanpa menjual persediaan.",
          poor: "Mungkin terlalu bergantung pada persediaan untuk memenuhi kewajiban jangka pendek.",
          average: "Likuiditas cepat yang memadai.",
        },
      },
      "cash-ratio": {
        name: "Rasio Kas",
        description: "Rasio likuiditas paling konservatif. Mengukur kemampuan perusahaan membayar liabilitas lancar hanya dengan kas dan setara kas.",
        formulaDisplay: "Kas & Setara Kas ÷ Liabilitas Lancar",
        inputs: {
          cash: "Kas & Setara Kas (Rp)",
          currentLiabilities: "Liabilitas Lancar (Rp)",
        },
        interpretations: {
          good: "Posisi kas sangat kuat.",
          poor: "Cadangan kas sangat rendah, ketergantungan tinggi pada piutang/persediaan.",
          neutral: "Rasio umumnya di bawah 1 adalah hal biasa, karena perusahaan jarang menyimpan kas cukup untuk menutup semua liabilitas lancar.",
        },
      },
      "gross-margin": {
        name: "Margin Laba Kotor",
        description: "Proporsi uang yang tersisa dari pendapatan setelah memperhitungkan harga pokok penjualan (HPP).",
        formulaDisplay: "(Laba Kotor ÷ Pendapatan) × 100",
        inputs: {
          grossProfit: "Laba Kotor (Rp)",
          revenue: "Pendapatan (Rp)",
        },
        interpretations: {
          any: "Sangat bergantung pada industri. Semakin tinggi semakin baik, menunjukkan produksi/penetapan harga yang efisien.",
        },
      },
      "net-margin": {
        name: "Margin Laba Bersih",
        description: "Menunjukkan berapa banyak dari setiap rupiah yang dikumpulkan perusahaan sebagai pendapatan yang menjadi laba.",
        formulaDisplay: "(Laba Bersih ÷ Pendapatan) × 100",
        inputs: {
          netIncome: "Laba Bersih (Rp)",
          revenue: "Pendapatan (Rp)",
        },
        interpretations: {
          any: ">10% umumnya dianggap sangat baik untuk sebagian besar industri, meskipun ritel beroperasi lebih rendah.",
        },
      },
      roa: {
        name: "Imbal Hasil Aset (ROA)",
        description: "Menunjukkan seberapa menguntungkan perusahaan relatif terhadap total asetnya.",
        formulaDisplay: "(Laba Bersih ÷ Total Aset) × 100",
        inputs: {
          netIncome: "Laba Bersih (Rp)",
          totalAssets: "Total Aset (Rp)",
        },
        interpretations: {
          any: "Di atas 5% umumnya baik. Menunjukkan seberapa efisien manajemen menggunakan aset untuk menghasilkan laba.",
        },
      },
      roe: {
        name: "Imbal Hasil Ekuitas (ROE)",
        description: "Ukuran kinerja keuangan yang dihitung dengan membagi laba bersih dengan ekuitas pemegang saham.",
        formulaDisplay: "(Laba Bersih ÷ Ekuitas Pemegang Saham) × 100",
        inputs: {
          netIncome: "Laba Bersih (Rp)",
          equity: "Ekuitas Pemegang Saham (Rp)",
        },
        interpretations: {
          any: "15-20% secara luas dianggap baik. Mengukur seberapa efektif manajemen menggunakan uang investor.",
        },
      },
      "ebitda-margin": {
        name: "Margin EBITDA",
        description: "Mengukur profitabilitas operasional perusahaan sebagai persentase dari pendapatannya.",
        formulaDisplay: "(EBITDA ÷ Pendapatan) × 100",
        inputs: {
          ebitda: "EBITDA (Rp)",
          revenue: "Pendapatan (Rp)",
        },
        interpretations: {
          any: "Memberikan gambaran jelas tentang profitabilitas operasional inti dengan menghilangkan biaya non-operasional.",
        },
      },
      "debt-to-equity": {
        name: "Rasio Utang terhadap Ekuitas",
        description: "Mengevaluasi leverage keuangan perusahaan dengan membandingkan total liabilitas dengan ekuitas pemegang saham.",
        formulaDisplay: "Total Utang ÷ Ekuitas Pemegang Saham",
        inputs: {
          totalDebt: "Total Utang (Rp)",
          equity: "Ekuitas Pemegang Saham (Rp)",
        },
        interpretations: {
          any: "Rasio > 2 umumnya dianggap berisiko (leverage tinggi), meskipun dapat diterima di industri padat modal.",
        },
      },
      "debt-ratio": {
        name: "Rasio Utang",
        description: "Mengukur proporsi aset perusahaan yang dibiayai oleh utang.",
        formulaDisplay: "Total Utang ÷ Total Aset",
        inputs: {
          totalDebt: "Total Utang (Rp)",
          totalAssets: "Total Aset (Rp)",
        },
        interpretations: {
          any: "Rasio lebih dari 0,5 (50%) menunjukkan bahwa sebagian besar aset perusahaan dibiayai melalui utang.",
        },
      },
      "interest-coverage": {
        name: "Rasio Cakupan Bunga",
        description: "Menentukan seberapa mudah perusahaan dapat membayar bunga atas utang yang beredar.",
        formulaDisplay: "EBIT ÷ Beban Bunga",
        inputs: {
          ebit: "EBIT (Rp)",
          interestExpense: "Beban Bunga (Rp)",
        },
        interpretations: {
          any: "Rasio di atas 3 umumnya dianggap aman. Di bawah 1,5 memperingatkan potensi risiko gagal bayar.",
        },
      },
      dscr: {
        name: "Rasio Cakupan Layanan Utang (DSCR)",
        description: "Mengukur arus kas yang tersedia untuk membayar kewajiban utang saat ini.",
        formulaDisplay: "Laba Operasional Bersih ÷ Total Layanan Utang",
        inputs: {
          noi: "Laba Operasional Bersih (Rp)",
          debtService: "Total Layanan Utang (Rp)",
        },
        interpretations: {
          any: "DSCR kurang dari 1 berarti arus kas negatif. Pemberi pinjaman biasanya mensyaratkan DSCR minimal 1,2x hingga 1,25x.",
        },
      },
      "asset-turnover": {
        name: "Perputaran Aset",
        description: "Mengukur efisiensi penggunaan aset perusahaan dalam menghasilkan pendapatan penjualan.",
        formulaDisplay: "Pendapatan ÷ Total Aset",
        inputs: {
          revenue: "Pendapatan (Rp)",
          totalAssets: "Total Aset (Rp)",
        },
        interpretations: {
          any: "Sangat bergantung pada industri. Ritel memiliki perputaran tinggi, utilitas rendah. Lebih tinggi lebih baik dalam kelompok sejenis.",
        },
      },
      "inventory-turnover": {
        name: "Perputaran Persediaan",
        description: "Menunjukkan berapa kali perusahaan telah menjual dan mengganti persediaan selama periode tertentu.",
        formulaDisplay: "Harga Pokok Penjualan ÷ Rata-rata Persediaan",
        inputs: {
          cogs: "Harga Pokok Penjualan (HPP) (Rp)",
          avgInventory: "Rata-rata Persediaan (Rp)",
        },
        interpretations: {
          any: "Rasio tinggi menunjukkan penjualan kuat atau persediaan tidak cukup. Rasio rendah menunjukkan penjualan lemah atau kelebihan persediaan.",
        },
      },
      dso: {
        name: "Hari Penjualan Beredar (DSO)",
        description: "Rata-rata jumlah hari yang diperlukan perusahaan untuk mengumpulkan pembayaran setelah penjualan dilakukan.",
        formulaDisplay: "(Piutang Usaha ÷ Penjualan Kredit Bersih) × 365",
        inputs: {
          ar: "Piutang Usaha (Rp)",
          sales: "Penjualan Kredit Bersih (Rp)",
        },
        interpretations: {
          any: "Di bawah 45 hari umumnya dianggap sangat baik. Di atas 60 hari mungkin menunjukkan masalah penagihan.",
        },
      },
      "pe-ratio": {
        name: "Harga terhadap Laba (P/E)",
        description: "Menghubungkan harga saham perusahaan dengan laba per sahamnya.",
        formulaDisplay: "Harga Saham ÷ Laba Per Saham",
        inputs: {
          price: "Harga Saham (Rp)",
          eps: "Laba Per Saham (Rp)",
        },
        interpretations: {
          any: "P/E tinggi bisa berarti saham dinilai terlalu tinggi, atau investor mengharapkan pertumbuhan tinggi. Bandingkan dengan rata-rata industri.",
        },
      },
      "pb-ratio": {
        name: "Harga terhadap Nilai Buku (P/B)",
        description: "Membandingkan kapitalisasi pasar perusahaan dengan nilai bukunya.",
        formulaDisplay: "Harga Saham ÷ Nilai Buku Per Saham",
        inputs: {
          price: "Harga Saham (Rp)",
          bvps: "Nilai Buku Per Saham (Rp)",
        },
        interpretations: {
          any: "P/B < 1 mungkin menunjukkan saham yang undervalued, atau ada sesuatu yang salah secara fundamental pada perusahaan.",
        },
      },
      "ev-ebitda": {
        name: "EV/EBITDA",
        description: "Kelipatan valuasi yang sering digunakan sebagai tambahan atau alternatif dari rasio P/E.",
        formulaDisplay: "Nilai Perusahaan ÷ EBITDA",
        inputs: {
          ev: "Nilai Perusahaan (Rp)",
          ebitda: "EBITDA (Rp)",
        },
        interpretations: {
          any: "Rasio di bawah 10x umumnya dipandang sehat dan di bawah rata-rata (berpotensi undervalued). Sangat bergantung pada industri.",
        },
      },
      "dividend-yield": {
        name: "Imbal Hasil Dividen",
        description: "Jumlah uang yang dibayarkan perusahaan kepada pemegang saham untuk setiap saham dibagi harga saham saat ini.",
        formulaDisplay: "(Dividen Per Saham Tahunan ÷ Harga Saham) × 100",
        inputs: {
          dividend: "Dividen Per Saham Tahunan (Rp)",
          price: "Harga Saham (Rp)",
        },
        interpretations: {
          any: "2-6% adalah tipikal untuk perusahaan matang. Imbal hasil > 6% mungkin menandakan risiko pemotongan dividen.",
        },
      },
    },
  },
};

export type Translations = typeof translations.en;
