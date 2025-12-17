import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground font-jakarta">
          SubTracker
        </h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
