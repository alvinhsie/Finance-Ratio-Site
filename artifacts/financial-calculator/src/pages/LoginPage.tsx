import { useState } from "react";
import { Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem("finratio_auth", "true");
      localStorage.setItem("finratio_auth_date", today);
      sessionStorage.removeItem("finratio_auth");
      onLogin();
      setIsLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <Calculator className="w-7 h-7" />
          </div>
          <div className="flex flex-col items-center leading-none">
            <h1 className="text-xl font-bold tracking-tight text-foreground">FinRatio</h1>
            <span className="text-xs font-normal italic text-muted-foreground">by SlitherStocks</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t.login.tagline}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? t.login.signingIn : t.login.signIn}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {t.login.footer} &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
