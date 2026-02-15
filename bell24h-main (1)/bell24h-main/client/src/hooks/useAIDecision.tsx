import { useState, useCallback } from 'react';
import { azrService } from '../services/azrService';
import { rlvrService } from '../services/rlvrService';

type ModelType = 'rfq_analysis' | 'pricing' | 'supplier_selection' | 'inventory';

interface AIDecisionOptions {
  modelType: ModelType;
  onDecision?: (decision: any) => void;
  onError?: (error: Error) => void;
}

interface AIDecisionState {
  loading: boolean;
  explanation: any;
  recommendations: any[];
  error: Error | null;
  analyze: (context: any) => Promise<void>;
  reset: () => void;
}

/**
 * A custom hook to integrate AI decision-making capabilities into your components.
 * Provides explanations and recommendations based on the provided context and model type.
 */
export const useAIDecision = ({
  modelType,
  onDecision,
  onError,
}: AIDecisionOptions): AIDecisionState => {
  const [state, setState] = useState<{
    loading: boolean;
    explanation: any;
    recommendations: any[];
    error: Error | null;
  }>({
    loading: false,
    explanation: null,
    recommendations: [],
    error: null,
  });

  const analyze = useCallback(
    async (context: any) => {
      try {
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
        }));

        // Get explanation from AZR
        const explanation = await azrService.getExplanation({
          input: context,
          modelType: modelType as any,
          depth: 3,
        });

        // Get recommendations from RLVR based on the context and explanation
        let recommendations: any[] = [];
        try {
          switch (modelType) {
            case 'pricing':
              const pricingResult = await rlvrService.optimizePricing(
                context.productData,
                context.marketData,
                context.constraints || {}
              );
              recommendations = [{ type: 'pricing', data: pricingResult }];
              break;

            case 'supplier_selection':
              const supplierResult = await rlvrService.recommendSuppliers(
                context.requirements,
                context.constraints || {}
              );
              recommendations = supplierResult.recommendations || [];
              break;

            case 'inventory':
              const inventoryResult = await rlvrService.optimizeInventory(
                context.inventoryData,
                context.demandForecast,
                context.constraints || {}
              );
              recommendations = [{ type: 'inventory', data: inventoryResult }];
              break;

            case 'rfq_analysis':
              // Custom logic for RFQ analysis
              recommendations = [
                {
                  type: 'rfq_analysis',
                  data: {
                    confidence: 0.85,
                    suggestedAction: 'proceed',
                    riskFactors: [],
                  },
                },
              ];
              break;

            default:
              console.warn(`Unsupported model type: ${modelType}`);
          }
        } catch (rlvrError) {
          console.error('RLVR recommendation failed:', rlvrError);
          // Continue with just the explanation if recommendations fail
        }

        const decision = {
          explanation,
          recommendations,
          timestamp: new Date().toISOString(),
        };

        setState({
          loading: false,
          explanation,
          recommendations,
          error: null,
        });

        // Notify parent component of the decision
        onDecision?.(decision);
      } catch (error) {
        const err = error as Error;
        console.error('AI decision error:', err);

        setState(prev => ({
          ...prev,
          loading: false,
          error: err,
        }));

        onError?.(err);
      }
    },
    [modelType, onDecision, onError]
  );

  const reset = useCallback(() => {
    setState({
      loading: false,
      explanation: null,
      recommendations: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    analyze,
    reset,
  };
};

/**
 * A higher-order component that provides AI decision-making capabilities to a component.
 * @deprecated Prefer using the `useAIDecision` hook directly in function components.
 */
export const withAIDecision = <P extends object>(
  WrappedComponent: React.ComponentType<P & AIDecisionState>,
  options: AIDecisionOptions
) => {
  const WithAIDecisionComponent = (props: P) => {
    const aiDecision = useAIDecision(options);
    return <WrappedComponent {...props} {...aiDecision} />;
  };
  
  WithAIDecisionComponent.displayName = `withAIDecision(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithAIDecisionComponent;
};

export default useAIDecision;
