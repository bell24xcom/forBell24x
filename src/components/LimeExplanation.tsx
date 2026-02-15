"use client";
import React from "react";

export default function LimeExplanation({ explanations = [] }: { explanations: { feature: string; text: string }[] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">LIME Explanations</h3>
      <ul className="list-disc pl-5 space-y-1">
        {explanations.map((e, i) => (
          <li key={e.feature} data-testid={`lime-explanation-${i}`}><strong>{e.feature}:</strong> {e.text}</li>
        ))}
      </ul>
    </div>
  );
}
