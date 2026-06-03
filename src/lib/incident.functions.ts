import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  incidentType: z.enum(["Phishing", "Malware", "Ransomware", "Data Breach", "DDoS", "Insider Threat"]),
  orgSize: z.enum(["Small", "Medium", "Enterprise"]),
  description: z.string().trim().min(10).max(4000),
});

export type IncidentAnalysis = {
  severityLevel: "Low" | "Medium" | "High" | "Critical";
  riskScore: number;
  immediateActions: string[];
  containmentPlan: string[];
  eradicationPlan: string[];
  recoveryPlan: string[];
  executiveSummary: string;
  lessonsLearned: string[];
};

export const analyzeIncident = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service is not configured");

    const system = `You are a senior cyber incident response commander trained on NIST SP 800-61 r2 and SANS PICERL. Produce concise, operationally specific guidance for an enterprise SOC. Avoid filler. Return strictly valid JSON matching the requested tool schema.`;

    const user = `Incident Type: ${data.incidentType}
Organization Size: ${data.orgSize}
Description:
${data.description}

Produce a complete incident response plan.`;

    const body = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "incident_response_plan",
            description: "Structured incident response plan",
            parameters: {
              type: "object",
              properties: {
                severityLevel: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
                riskScore: { type: "number" },
                immediateActions: { type: "array", items: { type: "string" } },
                containmentPlan: { type: "array", items: { type: "string" } },
                eradicationPlan: { type: "array", items: { type: "string" } },
                recoveryPlan: { type: "array", items: { type: "string" } },
                executiveSummary: { type: "string" },
                lessonsLearned: { type: "array", items: { type: "string" } },
              },
              required: [
                "severityLevel", "riskScore", "immediateActions", "containmentPlan",
                "eradicationPlan", "recoveryPlan", "executiveSummary", "lessonsLearned",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "incident_response_plan" } },
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("AI analysis failed");
    }

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = call?.function?.arguments;
    if (!argsStr) throw new Error("AI returned no structured response");
    const parsed = JSON.parse(argsStr) as IncidentAnalysis;
    return {
      analysis: parsed,
      meta: {
        incidentType: data.incidentType,
        orgSize: data.orgSize,
        description: data.description,
        generatedAt: new Date().toISOString(),
      },
    };
  });
