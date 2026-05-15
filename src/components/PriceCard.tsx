export function PriceCard({ label, price, highlight = false }: { label: string; price: string; highlight?: boolean }) {
  return (
    <div
      className="p-8 rounded-2xl text-center border"
      style={
        highlight
          ? { background: "var(--gradient-hero)", borderColor: "transparent", color: "var(--primary-foreground)", boxShadow: "var(--shadow-elegant)" }
          : { borderColor: "var(--border)", background: "var(--card)" }
      }
    >
      <p className={`text-xs uppercase tracking-[0.25em] mb-3 ${highlight ? "opacity-80" : "text-muted-foreground"}`}>{label}</p>
      <p className="text-5xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
        {price}<span className="text-lg ml-1 opacity-80">FCFA</span>
      </p>
    </div>
  );
}