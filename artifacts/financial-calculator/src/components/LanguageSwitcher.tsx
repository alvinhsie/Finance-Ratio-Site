import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const toggle = () => setLanguage(language === "en" ? "id" : "en");

  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background",
        "text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40",
        "transition-all shadow-sm",
        className
      )}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{language === "en" ? "EN" : "ID"}</span>
      <span className="text-muted-foreground/50">·</span>
      <span className="text-muted-foreground/60">{language === "en" ? "ID" : "EN"}</span>
    </button>
  );
}
