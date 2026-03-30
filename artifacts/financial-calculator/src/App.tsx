import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/lib/LanguageContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryPage } from "@/pages/CategoryPage";
import { LiquidityCalculator } from "@/pages/LiquidityCalculator";
import { ProfitabilityCalculator } from "@/pages/ProfitabilityCalculator";
import { LeverageCalculator } from "@/pages/LeverageCalculator";
import { EfficiencyCalculator } from "@/pages/EfficiencyCalculator";
import { ValuationCalculator } from "@/pages/ValuationCalculator";
import { GlossaryPage } from "@/pages/GlossaryPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/category/liquidity" component={LiquidityCalculator} />
        <Route path="/category/profitability" component={ProfitabilityCalculator} />
        <Route path="/category/leverage" component={LeverageCalculator} />
        <Route path="/category/efficiency" component={EfficiencyCalculator} />
        <Route path="/category/valuation" component={ValuationCalculator} />
        <Route path="/category/:id" component={CategoryPage} />
        <Route path="/glossary" component={GlossaryPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("finratio_auth") === "true"
  );

  if (!isAuthenticated) {
    return (
      <LanguageProvider>
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
