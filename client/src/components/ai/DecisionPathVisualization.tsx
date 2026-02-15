'use client';
import { useState, useMemo } from 'react';
import { AIExplanation, ExplanationDetail } from '@/types/aiExplanation';

interface DecisionPathVisualizationProps {
  explanation: AIExplanation;
  height?: number;
}

interface TreeNode {
  id: string;
  label: string;
  value: string | number;
  impact: string;
  weight: number;
  description: string;
  evidence: string[];
  children?: TreeNode[];
  isExpanded?: boolean;
}

export function DecisionPathVisualization({
  explanation,
  height = 500,
}: DecisionPathVisualizationProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const decisionTree = useMemo(() => {
    const rootNode: TreeNode = {
      id: 'root',
      label: 'Decision Start',
      value:
        typeof explanation.outputDecision.value === 'boolean'
          ? String(explanation.outputDecision.value)
          : explanation.outputDecision.value,
      impact: 'neutral',
      weight: 1,
      description: `AI decision for ${explanation.decisionType}`,
      evidence: [],
      children: explanation.explanation.map((detail, index) => ({
        id: `factor-${index}`,
        label: detail.factor,
        value: detail.weight,
        impact: detail.impact,
        weight: detail.weight,
        description: detail.description,
        evidence: detail.evidence,
        children: detail.evidence.map((evidence, evIndex) => ({
          id: `evidence-${index}-${evIndex}`,
          label: 'Evidence',
          value: evidence,
          impact: detail.impact,
          weight: 0.1,
          description: evidence,
          evidence: [],
        })),
      })),
    };

    return rootNode;
  }, [explanation]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-400 border-green-400 bg-green-400/10';
      case 'negative':
        return 'text-red-400 border-red-400 bg-red-400/10';
      case 'neutral':
        return 'text-gray-400 border-gray-400 bg-gray-400/10';
      default:
        return 'text-blue-400 border-blue-400 bg-blue-400/10';
    }
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 0.7) return 'bg-red-500';
    if (weight >= 0.4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode === node.id;

    return (
      <div key={node.id} className='relative'>
        <div
          className={`
            flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all
            ${getImpactColor(node.impact)}
            ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
            hover:scale-105
          `}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedNode(node.id)}
        >
          {/* Weight indicator */}
          <div className='flex items-center space-x-2'>
            <div className={`w-3 h-3 rounded-full ${getWeightColor(node.weight)}`} />
            <span className='text-xs font-medium'>
              {typeof node.value === 'number' ? node.value.toFixed(2) : node.value}
            </span>
          </div>

          {/* Node content */}
          <div className='flex-1'>
            <h4 className='font-semibold text-sm'>{node.label}</h4>
            <p className='text-xs opacity-80'>{node.description}</p>
          </div>

          {/* Expand/collapse button */}
          {hasChildren && (
            <button
              onClick={e => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className='p-1 rounded hover:bg-white/10 transition-colors'
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className='mt-2 space-y-2'>
            {node.children?.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderAlternativePaths = () => {
    if (!explanation.alternativeOptions || explanation.alternativeOptions.length === 0) {
      return (
        <div className='text-slate-400 text-center py-4'>No alternative options available</div>
      );
    }

    return (
      <div className='space-y-3'>
        {explanation.alternativeOptions.map((alternative, index) => (
          <div key={alternative.id} className='bg-slate-800 border border-slate-600 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h4 className='font-semibold text-white'>Alternative {index + 1}</h4>
              <span className='text-sm text-slate-400'>Confidence: {alternative.confidence}%</span>
            </div>
            <p className='text-slate-300 mb-2'>{alternative.reasoning}</p>
            <div className='space-y-1'>
              <p className='text-sm text-slate-400'>Trade-offs:</p>
              {alternative.tradeoffs.map((tradeoff, tIndex) => (
                <p key={tIndex} className='text-sm text-slate-300'>
                  • {tradeoff}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-white'>Decision Path Visualization</h3>
          <p className='text-sm text-slate-400'>
            Step-by-step breakdown of the AI decision process
          </p>
        </div>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showAlternatives
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {showAlternatives ? 'Hide' : 'Show'} Alternatives
          </button>
        </div>
      </div>

      {/* Decision Tree */}
      <div className='bg-slate-900 rounded-lg p-6 border border-slate-700'>
        <div className='space-y-3' style={{ height: `${height}px`, overflowY: 'auto' }}>
          {renderNode(decisionTree)}
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className='bg-slate-800 rounded-lg p-4 border border-slate-600'>
          <h4 className='font-semibold text-white mb-3'>Node Details</h4>
          {(() => {
            const node = findNode(decisionTree, selectedNode);
            if (!node) return null;

            return (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-slate-400'>Label</p>
                  <p className='text-white font-medium'>{node.label}</p>
                </div>
                <div>
                  <p className='text-slate-400'>Value</p>
                  <p className='text-white font-medium'>
                    {typeof node.value === 'number' ? node.value.toFixed(2) : node.value}
                  </p>
                </div>
                <div>
                  <p className='text-slate-400'>Impact</p>
                  <p className='text-white font-medium capitalize'>{node.impact}</p>
                </div>
                <div>
                  <p className='text-slate-400'>Weight</p>
                  <p className='text-white font-medium'>{node.weight.toFixed(2)}</p>
                </div>
                <div className='md:col-span-2'>
                  <p className='text-slate-400'>Description</p>
                  <p className='text-white'>{node.description}</p>
                </div>
                {node.evidence.length > 0 && (
                  <div className='md:col-span-2'>
                    <p className='text-slate-400 mb-2'>Evidence</p>
                    <div className='space-y-1'>
                      {node.evidence.map((evidence, index) => (
                        <p key={index} className='text-sm text-slate-300'>
                          • {evidence}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Alternative Paths */}
      {showAlternatives && (
        <div className='bg-slate-800 rounded-lg p-4 border border-slate-600'>
          <h4 className='font-semibold text-white mb-3'>Alternative Decision Paths</h4>
          {renderAlternativePaths()}
        </div>
      )}

      {/* Legend */}
      <div className='bg-slate-800 rounded-lg p-4 border border-slate-600'>
        <h4 className='font-semibold text-white mb-3'>Legend</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span className='text-slate-400'>Low Weight (0-0.3)</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
              <span className='text-slate-400'>Medium Weight (0.3-0.7)</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <span className='text-slate-400'>High Weight (0.7-1.0)</span>
            </div>
          </div>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 border-2 border-green-400 bg-green-400/10 rounded'></div>
              <span className='text-slate-400'>Positive Impact</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 border-2 border-red-400 bg-red-400/10 rounded'></div>
              <span className='text-slate-400'>Negative Impact</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 border-2 border-gray-400 bg-gray-400/10 rounded'></div>
              <span className='text-slate-400'>Neutral Impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to find a node by ID
function findNode(node: TreeNode, id: string): TreeNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}
