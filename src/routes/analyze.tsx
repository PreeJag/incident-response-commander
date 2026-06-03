import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analyzeIncident } from "@/lib/incident.functions";
import { toast } from "sonner";
import { Loader2, ArrowRight, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Incident Analysis — Incident Response Commander" },
      { name: "description", content: "Submit incident indicators to generate a structured AI-assisted response plan." },
    ],
  }),
  component: AnalyzePage,
});

const INCIDENT_TYPES = ["Phishing", "Malware", "Ransomware", "Data Breach", "DDoS", "Insider Threat"] as const;
const ORG_SIZES = ["Small", "Medium", "Enterprise"] as const;

function AnalyzePage() {
  const navigate = useNavigate();
  const run = useServerFn(analyzeIncident);
  const [incidentType, setIncidentType] = useState<(typeof INCIDENT_TYPES)[number]>("Phishing");
  const [orgSize, setOrgSize] = useState<(typeof ORG_SIZES)[number]>("Medium");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      toast.error("Provide at least 10 characters describing the incident.");
      return;
    }
    setLoading(true);
    try {
      const result = await run({ data: { incidentType, orgSize, description: description.trim() } });
      sessionStorage.setItem("ir-result", JSON.stringify(result));
      navigate({ to: "/results" });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary">/ New Analysis</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Incident intake</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Submit observed indicators and contextual details. The system will return a structured response plan
          aligned to NIST SP 800-61 incident handling.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="border border-border bg-card">
            <div className="border-b border-border bg-surface-elevated px-5 py-3">
              <h2 className="font-mono text-[11px] uppercase tracking-widest">Classification</h2>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <Field label="Incident Type" htmlFor="incidentType">
                <select
                  id="incidentType"
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as typeof incidentType)}
                  className="h-10 w-full border border-input bg-surface px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Organization Size" htmlFor="orgSize">
                <select
                  id="orgSize"
                  value={orgSize}
                  onChange={(e) => setOrgSize(e.target.value as typeof orgSize)}
                  className="h-10 w-full border border-input bg-surface px-3 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {ORG_SIZES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div className="border border-border bg-card">
            <div className="border-b border-border bg-surface-elevated px-5 py-3">
              <h2 className="font-mono text-[11px] uppercase tracking-widest">Incident Description</h2>
            </div>
            <div className="p-5">
              <Field label="What happened?" htmlFor="description">
                <textarea
                  id="description"
                  rows={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe observed indicators, affected systems, timeline, users involved, and any actions already taken..."
                  maxLength={4000}
                  className="w-full resize-y border border-input bg-surface px-3 py-2.5 font-mono text-sm leading-relaxed focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </Field>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Minimum 10 characters · be specific.</span>
                <span className="font-mono">{description.length} / 4000</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analyzing incident…</>)
              : (<>Analyze Incident <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>)}
          </button>
        </div>

        <aside className="lg:col-span-4">
          <div className="border border-border bg-surface-elevated p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <h3 className="font-mono text-[11px] uppercase tracking-widest">Operator guidance</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="border-l-2 border-primary/60 pl-3">Include affected hostnames, IPs, and user accounts where known.</li>
              <li className="border-l-2 border-primary/60 pl-3">Note any containment actions already taken to avoid duplication.</li>
              <li className="border-l-2 border-primary/60 pl-3">Output is advisory — always validate with your IR policy and legal counsel.</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
