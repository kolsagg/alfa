import { ThemeProvider } from "./components/providers/theme-provider";
import { IOSInstallGuidance } from "./components/ui/ios-install-guidance";
import { DashboardLayout } from "./components/layout/dashboard-layout";
import { CountdownHeroPlaceholder } from "./components/dashboard/countdown-hero-placeholder";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <IOSInstallGuidance />
      <DashboardLayout>
        <div className="space-y-6">
          <CountdownHeroPlaceholder />

          {/* Subscription List Placeholder */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground font-jakarta">
              Aboneliklerim
            </h2>

            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/50 bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Henüz abonelik eklenmedi
              </p>
              <p className="text-xs text-muted-foreground/70">
                Alt menüden "Ekle" butonuna dokunarak başlayın
              </p>
            </div>
          </section>
        </div>
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
