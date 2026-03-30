import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CATEGORIES } from "@/lib/ratios";
import { AppLayout } from "@/components/layout/AppLayout";
import { CategoryPage } from "@/pages/CategoryPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Redirect root to the first category
function Home() {
  return <Redirect to={`/category/${CATEGORIES[0].id}`} />;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/category/:id" component={CategoryPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
