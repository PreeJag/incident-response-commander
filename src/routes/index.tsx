import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Activity, ShieldAlert, GitBranch, FileSearch, Lock, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Incident Response Commander — AI-assisted SOC" },
      { name: "description", content: "Triage, contain, and recover from cyber incidents with AI-generated response playbooks." },
    ],
  }),
  component: Home,
});

const capabilities = [
  { icon: ShieldAlert, label: "Severity scoring", desc: "Quantified risk and impact analysis aligned to NIST SP 800-61." },
  { icon: GitBranch, label: "Containment paths", desc: "Stage-by-stage isolation strategy tailored to your environment." },
  { icon: FileSearch, label: "Eradication & recovery", desc: "Root-cause removal and validated return-to-operation plan." },
  { icon: Lock, label: "Executive briefing", desc: "Board-ready summary translating technical findings into business risk." },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="absolute inset-0 ibm-grid-bg opacity-40" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary/8 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-12 lg:py-28">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 border-l-2 border-primary bg-accent/60 px-3 py-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-foreground">
                SOC Platform / AI Co-Pilot
              </span>
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
              Respond to cyber incidents
              <br />
              <span className="text-primary">with operational clarity.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Incident Response Commander turns ambiguous alerts into structured, executive-ready response plans.
              Powered by AI tuned to NIST and SANS incident handling frameworks.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/analyze"
                className="group inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Analysis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#capabilities" className="inline-flex items-center gap-2 border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground hover:bg-accent">
                Platform overview
              </a>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
              {[
                { k: "MTTR", v: "−68%" },
                { k: "Frameworks", v: "NIST · SANS" },
                { k: "Coverage", v: "6 incident classes" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</dt>
                  <dd className="mt-1 text-lg font-semibold tracking-tight">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-severity-critical animate-pulse" />
                    <span className="font-mono text-[11px] uppercase tracking-widest">Incident · INC-4471</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">LIVE</span>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Class</p>
                    <p className="mt-1 text-sm font-medium">Ransomware · Enterprise</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-l-2 border-severity-critical pl-3">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Severity</p>
                      <p className="mt-1 text-base font-semibold">Critical</p>
                    </div>
                    <div className="border-l-2 border-severity-high pl-3">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Risk Score</p>
                      <p className="mt-1 text-base font-semibold">9.2 / 10</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      "Isolate affected file servers from VLAN",
                      "Revoke privileged credentials issued ≤ 72h",
                      "Engage cyber-insurance & legal counsel",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 border-t border-border pt-2 first:border-t-0 first:pt-0">
                        <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
                        <p className="text-xs text-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-border pt-3">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Generated in 4.2s
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 -z-10 h-full w-full border border-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary">/ Capabilities</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                An end-to-end response framework.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Every analysis produces a structured artifact your SOC, legal, and executive teams can act on immediately.
              </p>
            </div>
            <div className="grid gap-px bg-border lg:col-span-8 lg:grid-cols-2">
              {capabilities.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-surface p-6">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-sm font-semibold">{label}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ready to triage an active incident?</h2>
            <p className="mt-2 text-sm text-brand-foreground/80">
              Submit the indicators — receive a complete response plan in seconds.
            </p>
          </div>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 bg-surface px-5 py-3 text-sm font-medium text-foreground hover:bg-surface/90"
          >
            Start Analysis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
