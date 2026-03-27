"use client";
import { useEffect, useState } from "react";
import ShapChart from "@/components/ShapChart";
import LimeExplanation from "@/components/LimeExplanation";

export default function AIInsightsPage() {
  const [shap, setShap] = useState([]);
  const [lime, setLime] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/ai/explain-match/1", { method: "POST" });
        if (!res.ok) throw new Error((await res.json()).detail || "API error");
        const data = await res.json();
        setShap(data);
        setLime(
          data.slice(0, 4).map((d: any) => ({
            feature: d.feature,
            text: `${d.feature} contributed ${d.importance.toFixed(3)} (${d.contribution})`,
          }))
        );
      } catch (e: any) {
        setError(e.message || "Failed to load insights");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Insights (SHAP / LIME)</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="bg-red-900 text-red-300 border border-red-500 rounded-lg px-4 py-2 mb-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShapChart items={shap} />
          <LimeExplanation explanations={lime} />
        </div>
      )}
    </div>
  );
}
