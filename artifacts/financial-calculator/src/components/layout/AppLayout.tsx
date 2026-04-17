import React, { useState } from 'react';
import { CATEGORIES } from '@/lib/ratios';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Calculator, Menu, X, ChevronRight, Home, BookOpen, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

function NavContent({ location, t, language }: { location: string; t: any; language: string }) {
  return (
    <nav className="flex flex-col gap-1 px-4 py-4 overflow-y-auto">
      <Link
        href="/"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group',
          location === '/'
            ? 'bg-primary/10 text-primary'
            : 'text-foreground hover:bg-muted'
        )}
      >
        <Home className={cn('w-5 h-5 transition-colors', location === '/' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1">{t.layout.home}</span>
        {location === '/' && <ChevronRight className="w-4 h-4" />}
      </Link>

      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = location.includes(`/category/${category.id}`);
        const catT = t.categories[category.id as keyof typeof t.categories] ?? { name: category.name, description: '' };
        return (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group',
              isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
            )}
          >
            <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
            <span className="flex-1">{catT.name}</span>
            {isActive && <ChevronRight className="w-4 h-4" />}
          </Link>
        );
      })}

      <Link
        href="/summary"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group',
          location === '/summary' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        )}
      >
        <LayoutDashboard className={cn('w-5 h-5 transition-colors', location === '/summary' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1">{language === 'id' ? 'Ringkasan' : 'Summary'}</span>
        {location === '/summary' && <ChevronRight className="w-4 h-4" />}
      </Link>

      <div className="border-t border-border/60" />

      <Link
        href="/glossary"
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group',
          location === '/glossary' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
        )}
      >
        <BookOpen className={cn('w-5 h-5 transition-colors', location === '/glossary' ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1">{language === 'id' ? 'Glosarium' : 'Glossary'}</span>
        {location === '/glossary' && <ChevronRight className="w-4 h-4" />}
      </Link>
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">

      {/* ── Mobile Header ── */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold font-display text-lg tracking-tight">FinRatio</span>
            <span className="text-xs font-normal italic text-muted-foreground">by SlitherStocks</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="p-2 -mr-2 text-foreground relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <Menu
              className={cn(
                'w-6 h-6 absolute transition-all duration-200',
                mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
              )}
            />
            <X
              className={cn(
                'w-6 h-6 absolute transition-all duration-200',
                mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
              )}
            />
          </button>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex sticky top-0 h-screen w-72 bg-card border-r border-border flex-col">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold font-display text-xl tracking-tight">FinRatio</span>
              <span className="text-xs font-normal italic text-muted-foreground">by SlitherStocks</span>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
        <NavContent location={location} t={t} language={language} />
      </aside>

      {/* ── Mobile Backdrop (always in DOM, CSS transition) ── */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-20 bg-black/50 transition-opacity duration-250',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ── Mobile Drawer (always in DOM, CSS transition) ── */}
      <aside
        className={cn(
          'md:hidden fixed top-[65px] bottom-0 left-0 z-30 w-72 bg-card border-r border-border flex flex-col',
          'transition-transform duration-250 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent location={location} t={t} language={language} />
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-65px)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
