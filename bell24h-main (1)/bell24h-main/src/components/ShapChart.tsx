"use client";
import React from "react";

type ShapItem = { feature: string; importance: number; contribution: string };

export default function ShapChart({ items = [] }: { items: ShapItem[] }) {
  const max = Math.max(...items.map(i => i.importance), 0.0001);
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">SHAP Feature Importance</h3>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it.feature} className="flex items-center space-x-4" data-testid={`feature-${i}`}> 
            <div className="w-48 text-sm text-gray-700">{it.feature}</div>
            <div className="flex-1 bg-gray-100 h-4 rounded overflow-hidden">
              <div
                className={`h-4 ${it.contribution === 'positive' ? 'bg-green-500' : it.contribution === 'negative' ? 'bg-red-500' : 'bg-gray-300'}`}
                style={{ width: `${(it.importance / max) * 100}%` }}
                data-testid={`shap-bar-${it.feature}`}
              />
            </div>
            <div className="w-20 text-right text-sm">{it.importance.toFixed(3)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
