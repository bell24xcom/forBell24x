'use client';
import { useState, useEffect } from 'react';
import { AIExplanation, DecisionType, ExplanationFilter } from '@/types/aiExplanation';
import { aiExplanationService } from '@/services/aiExplanation';

interface ExplanationHistoryProps {
  explanations: AIExplanation[];
  onExplanationSelect: (explanation: AIExplanation) => void;
  filters?: ExplanationFilter;
  onFiltersChange?: (filters: ExplanationFilter) => void;
}

interface SortConfig {
  key: keyof AIExplanation;
  direction: 'asc' | 'desc';
}

export function ExplanationHistory({
  explanations,
  onExplanationSelect,
  filters,
  onFiltersChange,
}: ExplanationHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [localFilters, setLocalFilters] = useState<ExplanationFilter>({
    decisionType: [],
    dateRange: undefined,
    confidenceMin: 0,
    ...filters,
  });

  useEffect(() => {
    loadExplanationHistory();
  }, [currentPage, pageSize, localFilters, sortConfig]);

  const loadExplanationHistory = async () => {
    try {
      setLoading(true);
      const result = await aiExplanationService.getExplanationHistory(currentPage, pageSize, {
        ...localFilters,
        searchTerm,
        sortBy: sortConfig.key,
        sortDirection: sortConfig.direction,
      });

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load explanation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof AIExplanation) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleRowExpansion = (explanationId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(explanationId)) {
      newExpanded.delete(explanationId);
    } else {
      newExpanded.add(explanationId);
    }
    setExpandedRows(newExpanded);
  };

  const handleFilterChange = (newFilters: Partial<ExplanationFilter>) => {
    const updatedFilters = { ...localFilters, ...newFilters };
    setLocalFilters(updatedFilters);
    setCurrentPage(1); // Reset to first page
    onFiltersChange?.(updatedFilters);
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/ai/explanations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...localFilters,
          searchTerm,
          sortBy: sortConfig.key,
          sortDirection: sortConfig.direction,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `explanation-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getDecisionTypeColor = (type: DecisionType) => {
    switch (type) {
      case 'supplier_recommendation':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'price_optimization':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rfq_matching':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'risk_assessment':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'quality_prediction':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredExplanations = explanations.filter(explanation => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        explanation.decisionType.toLowerCase().includes(searchLower) ||
        explanation.explanation.some(
          exp =>
            exp.factor.toLowerCase().includes(searchLower) ||
            exp.description.toLowerCase().includes(searchLower)
        );
      if (!matchesSearch) return false;
    }

    if (
      localFilters.decisionType &&
      localFilters.decisionType.length > 0 &&
      !localFilters.decisionType.includes(explanation.decisionType)
    ) {
      return false;
    }

    if (localFilters.confidenceMin && explanation.confidence < localFilters.confidenceMin) {
      return false;
    }

    if (localFilters.dateRange) {
      const explanationDate = new Date(explanation.timestamp);
      if (
        explanationDate < localFilters.dateRange.start ||
        explanationDate > localFilters.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-white'>Explanation History</h3>
          <p className='text-sm text-slate-400'>{totalCount} explanations found</p>
        </div>
        <button
          onClick={handleExport}
          className='flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors'
        >
          <span>⬇️</span>
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className='bg-slate-800 rounded-lg p-4 border border-slate-600'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Search */}
          <div className='relative'>
            <span>🔍</span>
            <input
              type='text'
              placeholder='Search explanations...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Decision Type Filter */}
          <select
            value={(localFilters.decisionType ?? []).join(',')}
            onChange={e => {
              const value = e.target.value;
              handleFilterChange({
                decisionType: value ? (value.split(',') as DecisionType[]) : [],
              });
            }}
            className='px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>All Decision Types</option>
            <option value='supplier_recommendation'>Supplier Recommendation</option>
            <option value='price_optimization'>Price Optimization</option>
            <option value='rfq_matching'>RFQ Matching</option>
            <option value='risk_assessment'>Risk Assessment</option>
            <option value='quality_prediction'>Quality Prediction</option>
          </select>

          {/* Confidence Filter */}
          <input
            type='number'
            placeholder='Min Confidence %'
            value={localFilters.confidenceMin || ''}
            onChange={e => handleFilterChange({ confidenceMin: Number(e.target.value) || 0 })}
            className='px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className='px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='bg-slate-800 rounded-lg border border-slate-600 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-slate-700'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>
                  Decision
                </th>
                <th
                  className='px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600'
                  onClick={() => handleSort('decisionType')}
                >
                  Type
                  {sortConfig.key === 'decisionType' && (
                    <span className='ml-1'>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className='px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600'
                  onClick={() => handleSort('confidence')}
                >
                  Confidence
                  {sortConfig.key === 'confidence' && (
                    <span className='ml-1'>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  className='px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-600'
                  onClick={() => handleSort('timestamp')}
                >
                  Date
                  {sortConfig.key === 'timestamp' && (
                    <span className='ml-1'>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-600'>
              {loading ? (
                <tr>
                  <td colSpan={5} className='px-4 py-8 text-center text-slate-400'>
                    Loading explanations...
                  </td>
                </tr>
              ) : filteredExplanations.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-4 py-8 text-center text-slate-400'>
                    No explanations found
                  </td>
                </tr>
              ) : (
                filteredExplanations.map(explanation => {
                  const isExpanded = expandedRows.has(explanation.id);

                  return (
                    <>
                      <tr
                        key={explanation.id}
                        className='hover:bg-slate-700/50 cursor-pointer'
                        onClick={() => onExplanationSelect(explanation)}
                      >
                        <td className='px-4 py-4'>
                          <div className='flex items-center space-x-3'>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleRowExpansion(explanation.id);
                              }}
                              className='p-1 hover:bg-slate-600 rounded'
                            >
                              {isExpanded ? (
                                <ChevronDown className='h-4 w-4 text-slate-400' />
                              ) : (
                                <span>▶️</span>
                              )}
                            </button>
                            <div>
                              <p className='text-sm font-medium text-white'>
                                {typeof explanation.outputDecision.value === 'string'
                                  ? explanation.outputDecision.value
                                  : explanation.outputDecision.value.toString()}
                              </p>
                              <p className='text-xs text-slate-400'>
                                {explanation.explanation.length} factors considered
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getDecisionTypeColor(
                              explanation.decisionType
                            )}`}
                          >
                            {explanation.decisionType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <span
                            className={`text-sm font-medium ${getConfidenceColor(
                              explanation.confidence
                            )}`}
                          >
                            {explanation.confidence}%
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          <div className='flex items-center space-x-1 text-sm text-slate-400'>
                            <span>📅</span>
                            <span>{formatDate(explanation.timestamp)}</span>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onExplanationSelect(explanation);
                            }}
                            className='text-blue-400 hover:text-blue-300 text-sm font-medium'
                          >
                            View Details
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className='px-4 py-4 bg-slate-700/30'>
                            <div className='space-y-4'>
                              <h4 className='font-semibold text-white'>Decision Factors</h4>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {explanation.explanation.map((detail, index) => (
                                  <div
                                    key={index}
                                    className='bg-slate-800 rounded-lg p-3 border border-slate-600'
                                  >
                                    <div className='flex items-center justify-between mb-2'>
                                      <h5 className='font-medium text-white'>{detail.factor}</h5>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          detail.impact === 'positive'
                                            ? 'bg-green-500/20 text-green-400'
                                            : detail.impact === 'negative'
                                            ? 'bg-red-500/20 text-red-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                        }`}
                                      >
                                        {detail.impact}
                                      </span>
                                    </div>
                                    <p className='text-sm text-slate-300 mb-2'>
                                      {detail.description}
                                    </p>
                                    <div className='text-xs text-slate-400'>
                                      <p>Weight: {detail.weight.toFixed(2)}</p>
                                      {detail.evidence.length > 0 && (
                                        <div className='mt-1'>
                                          <p>Evidence:</p>
                                          <ul className='list-disc list-inside space-y-1'>
                                            {detail.evidence.map((evidence, evIndex) => (
                                              <li key={evIndex}>{evidence}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-slate-400'>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className='px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded text-sm transition-colors'
          >
            Previous
          </button>
          <span className='text-sm text-slate-400'>
            Page {currentPage} of {Math.ceil(totalCount / pageSize)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasMore}
            className='px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded text-sm transition-colors'
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
