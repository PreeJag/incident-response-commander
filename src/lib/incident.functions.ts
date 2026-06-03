import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  incidentType: z.enum(["Phishing", "Malware", "Ransomware", "Data Breach", "DDoS", "Insider Threat"]),
  orgSize: z.enum(["Small", "Medium", "Enterprise"]),
  description: z.string().trim().min(10).max(4000),
});

export type IncidentSections = {
  severityLevel: string;
  riskScore: string;
  incidentClassification: string;
  immediateActions: string;
  containmentPlan: string;
  eradicationPlan: string;
  recoveryPlan: string;
  executiveSummary: string;
  lessonsLearned: string;
};

export type IncidentAnalysis = {
  raw: string;
  sections: IncidentSections;
};

const SECTION_KEYS: Array<{ key: keyof IncidentSections; heading: RegExp }> = [
  { key: "severityLevel", heading: /^severity level/i },
  { key: "riskScore", heading: /^risk score/i },
  { key: "incidentClassification", heading: /^incident classification/i },
  { key: "immediateActions", heading: /^immediate actions/i },
  { key: "containmentPlan", heading: /^containment plan/i },
  { key: "eradicationPlan", heading: /^eradication plan/i },
  { key: "recoveryPlan", heading: /^recovery plan/i },
  { key: "executiveSummary", heading: /^executive summary/i },
  { key: "lessonsLearned", heading: /^lessons learned/i },
];

function parseSections(markdown: string): IncidentSections {
  const lines = markdown.split(/\r?\n/);
  const sections: Partial<Record<keyof IncidentSections, string[]>> = {};
  let current: keyof IncidentSections | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (headingMatch) {
      const title = headingMatch[1].trim();
      const found = SECTION_KEYS.find((s) => s.heading.test(title));
      if (found) {
        current = found.key;
        sections[current] = [];
        continue;
      }
    }
    if (current) {
      (sections[current] ||= []).push(line);
    }
  }

  const out = {} as IncidentSections;
  for (const { key } of SECTION_KEYS) {
    out[key] = (sections[key] ?? []).join("\n").trim();
  }
  return out;
}

export const analyzeIncident = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompt = `You are a senior cybersecurity incident response commander with expertise in NIST 800-61, ISO 27035 and enterprise SOC operations.

Analyze the following incident.

Incident Type:
${data.incidentType}

Organization Size:
${data.orgSize}

Incident Description:
${data.description}

Generate a professional cybersecurity response report.

Return ONLY in the following format:

# Severity Level

# Risk Score (0-100)

# Incident Classification

# Immediate Actions

# Containment Plan

# Eradication Plan

# Recovery Plan

# Executive Summary

# Lessons Learned`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Gemini error:", res.status, t);
      throw new Error(`Gemini API failed (${res.status})`);
    }

    const json = await res.json();
    const text: string | undefined = json?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();

    if (!text) throw new Error("Gemini returned an empty response");

    const sections = parseSections(text);

    return {
      analysis: { raw: text, sections } satisfies IncidentAnalysis,
      meta: {
        incidentType: data.incidentType,
        orgSize: data.orgSize,
        description: data.description,
        generatedAt: new Date().toISOString(),
      },
    };
  });
