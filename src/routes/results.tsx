import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { IncidentAnalysis } from "@/lib/incident.functions";
import {
  ArrowLeft, AlertOctagon, Activity, Zap, Shield, Wrench, RotateCw,
  FileText, BookOpen, Tag as TagIcon, type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Response Plan — Incident Response Commander" },
      { name: "description", content: "AI-generated incident response plan with severity, containment, eradication and recovery." },
    ],
  }),
  component: ResultsPage,
});

type StoredResult = {
  analysis: IncidentAnalysis;
  meta: { incidentType: string; orgSize: string; description: string; generatedAt: string };
};

type SeverityKey = "low" | "medium" | "high" | "critical" | "unknown";

const severityClass: Record<SeverityKey, string> = {
  low: "bg-severity-low/15 text-severity-low border-severity-low/40",
  medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/40",
  high: "bg-severity-high/15 text-severity-high border-severity-high/40",
  critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/40",
  unknown: "bg-muted text-muted-foreground border-border",
};

function detectSeverity(text: string): SeverityKey {
  const t = text.toLowerCase();
  if (t.includes("critical")) return "critical";
  if (t.includes("high")) return "high";
  if (t.includes("medium") || t.includes("moderate")) return "medium";
  if (t.includes("low")) return "low";
  return "unknown";
}

function extractScore(text: string): number | null {
  const m = text.match(/\b(\d{1,3})(?:\s*\/\s*100)?\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}

function parseListItems(text: string): string[] {
  const items: string[] = [];
  const lines = text.split(/\r?\n/);
  let buffer: string[] = [];
  const flush = () => {
    const v = buffer.join(" ").trim();
    if (v) items.push(v);
    buffer = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const m = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) {
      flush();
      buffer.push(m[1]);
    } else if (buffer.length) {
      buffer.push(line);
    } else {
      // paragraph-style — split sentences as fallback later
      buffer.push(line);
      flush();
    }
  }
  flush();
  return items;
}

function ResultsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<StoredResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("ir-result");
    if (!raw) { navigate({ to: "/analyze" }); return; }
    try { setData(JSON.parse(raw)); } catch { navigate({ to: "/analyze" }); }
  }, [navigate]);

  const parsed = useMemo(() => {
    if (!data) return null;
    const s = data.analysis.sections;
    return {
      severityKey: detectSeverity(s.severityLevel),
      severityText: s.severityLevel.replace(/\n+/g, " ").trim() || "Unknown",
      score: extractScore(s.riskScore),
      classification: s.incidentClassification.trim(),
      immediate: parseListItems(s.immediateActions),
      containment: parseListItems(s.containmentPlan),
      eradication: parseListItems(s.eradicationPlan),
      recovery: parseListItems(s.recoveryPlan),
      summary: s.executiveSummary.trim(),
      lessons: parseListItems(s.lessonsLearned),
    };
  }, [data]);

  if (!data || !parsed) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-20 text-sm text-muted-foreground">Loading response plan…</div>
    );
  }

  const { meta } = data;
  const score = parsed.score;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link to="/analyze" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to intake
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Response Plan</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <MetaTag label="Type" value={meta.incidentType} />
            <MetaTag label="Org" value={meta.orgSize} />
            <MetaTag label="Generated" value={new Date(meta.generatedAt).toLocaleString()} />
          </div>
        </div>
        <Link to="/analyze" className="border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-accent">
          New analysis
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Severity Level</span>
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className={`mt-4 inline-flex items-center gap-2 border px-3 py-1.5 ${severityClass[parsed.severityKey]}`}>
            <span className="h-2 w-2 rounded-full bg-current" />
            <span className="text-lg font-semibold tracking-tight">{parsed.severityText}</span>
          </div>
        </div>

        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Risk Score</span>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">{score ?? "—"}</span>
            <span className="font-mono text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${score ?? 0}%` }} />
          </div>
        </div>

        <div className="border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Classification</span>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground whitespace-pre-line">
            {parsed.classification || "—"}
          </p>
        </div>
      </div>

      <Section title="Executive Summary" icon={FileText} className="mt-4">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{parsed.summary || "—"}</p>
      </Section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ListSection title="Immediate Actions" icon={Zap} items={parsed.immediate} accent="severity-critical" />
        <ListSection title="Containment Plan" icon={Shield} items={parsed.containment} accent="severity-high" />
        <ListSection title="Eradication Plan" icon={Wrench} items={parsed.eradication} accent="severity-medium" />
        <ListSection title="Recovery Plan" icon={RotateCw} items={parsed.recovery} accent="severity-low" />
      </div>

      <Section title="Lessons Learned" icon={BookOpen} className="mt-4">
        {parsed.lessons.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {parsed.lessons.map((l, i) => (
              <li key={i} className="flex gap-3 border-l-2 border-primary/60 pl-3 text-sm">
                <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </Section>
    </div>
  );
}

function MetaTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

function Section({ title, icon: Icon, children, className = "" }: { title: string; icon: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-border bg-card ${className}`}>
      <header className="flex items-center justify-between border-b border-border bg-surface-elevated px-5 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <h2 className="font-mono text-[11px] uppercase tracking-widest">{title}</h2>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ListSection({ title, icon, items, accent }: { title: string; icon: LucideIcon; items: string[]; accent: string }) {
  return (
    <Section title={title} icon={icon}>
      {items.length ? (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[10px]"
                style={{ borderColor: `var(--${accent})`, color: `var(--${accent})` }}
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed">{item}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </Section>
  );
}
