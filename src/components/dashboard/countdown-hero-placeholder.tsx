export function CountdownHeroPlaceholder() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-6 border border-border/50"
      aria-label="Yaklaşan ödeme sayacı"
    >
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Bir sonraki ödeme
        </p>
        <div className="text-5xl font-extrabold tracking-tight text-foreground tabular-nums font-jakarta">
          --:--:--
        </div>
        <p className="text-lg font-semibold text-foreground/80">
          Henüz abonelik yok
        </p>
        <p className="text-xs text-muted-foreground">
          İlk aboneliğinizi ekleyin ve ödemeleri takip etmeye başlayın
        </p>
      </div>
    </section>
  );
}
