import MarketingResearch from "@/components/user/marketing-research/marketing-research";

export default function MarketingResearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden pt-24 md:pt-28 pb-16">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0d1b3e 0%, #1a306e 60%, #0d1b3e 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(245,166,35,0.15), transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <span className="inline-flex items-center justify-center gap-3 text-4xl md:text-5xl font-bold tracking-tight uppercase text-accent mb-3">
            Marketing Research
          </span>

          <p className="text-slate-300 mt-4 text-base md:text-lg">
            Data-backed insights on your market, competitors, and audience.
          </p>
        </div>
      </section>

      <div className="relative z-10">
        <MarketingResearch />
      </div>
    </div>
  );
}
