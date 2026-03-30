import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex items-center gap-1 bg-muted rounded-lg p-0.5 text-xs font-semibold", className)}>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all",
          language === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇬🇧 EN
      </button>
      <button
        onClick={() => setLanguage("id")}
        className={cn(
          "px-2.5 py-1 rounded-md transition-all",
          language === "id"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇮🇩 ID
      </button>
    </div>
  );
}
