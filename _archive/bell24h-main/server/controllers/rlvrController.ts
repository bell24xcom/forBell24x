import { Request, Response } from 'express';
import { RLVRModel } from '../models/rlvrModel';

// In-memory storage for models (in production, use a database)
const models: Record<string, RLVRModel> = {};

// Default model configuration
const DEFAULT_CONFIG = {
  gamma: 0.99,
  alpha: 0.001,
  epsilon: 1.0,
  epsilonMin: 0.01,
  epsilonDecay: 0.995,
  batchSize: 32,
  memorySize: 10000,
  updateTargetEvery: 1000,
};

export const rlvrController = {
  // Create a new RLVR model
  createModel: async (req: Request, res: Response) => {
    try {
      const { modelId = 'default', config = {} } = req.body;
      
      if (models[modelId]) {
        return res.status(400).json({ error: 'Model with this ID already exists' });
      }

      const modelConfig = { ...DEFAULT_CONFIG, ...config };
      models[modelId] = new RLVRModel(modelConfig);
      
      res.status(201).json({
        status: 'success',
        modelId,
        config: modelConfig,
      });
    } catch (error) {
      console.error('Error creating RLVR model:', error);
      res.status(500).json({ error: 'Failed to create RLVR model' });
    }
  },

  // Get model information
  getModelInfo: (req: Request, res: Response) => {
    try {
      const { modelId = 'default' } = req.params;
      const model = models[modelId];
      
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      res.json({
        modelType: model.getModelType(),
        numParameters: model.getNumParameters(),
        trainingSteps: model.getTrainingSteps(),
        lastTrained: model.getLastTrained(),
        metrics: model.getMetrics(),
      });
    } catch (error) {
      console.error('Error getting model info:', error);
      res.status(500).json({ error: 'Failed to get model info' });
    }
  },

  // Save model to disk
  saveModel: async (req: Request, res: Response) => {
    try {
      const { modelId = 'default' } = req.params;
      const { path } = req.body;
      
      const model = models[modelId];
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      await model.save(path);
      res.json({ status: 'success', path });
    } catch (error) {
      console.error('Error saving model:', error);
      res.status(500).json({ error: 'Failed to save model' });
    }
  },

  // Load model from disk
  loadModel: async (req: Request, res: Response) => {
    try {
      const { modelId = 'default' } = req.params;
      const { path } = req.body;
      
      models[modelId] = await RLVRModel.load(path);
      res.json({ status: 'success' });
    } catch (error) {
      console.error('Error loading model:', error);
      res.status(500).json({ error: 'Failed to load model' });
    }
  },

  // Train the model
  trainModel: async (req: Request, res: Response) => {
    try {
      const { modelId = 'default' } = req.params;
      const { episodes = 100, batchSize = 32 } = req.body;
      
      const model = models[modelId];
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      const metrics = await model.train(episodes, batchSize);
      res.json({ status: 'success', metrics });
    } catch (error) {
      console.error('Error training model:', error);
      res.status(500).json({ error: 'Failed to train model' });
    }
  },

  // Evaluate the model
  evaluateModel: async (req: Request, res: Response) => {
    try {
      const { modelId = 'default' } = req.params;
      const episodes = parseInt(req.query.episodes as string) || 10;
      
      const model = models[modelId];
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      const results = await model.evaluate(episodes);
      res.json(results);
    } catch (error) {
      console.error('Error evaluating model:', error);
      res.status(500).json({ error: 'Failed to evaluate model' });
    }
  },

  // Get optimal action for a state
  getOptimalAction: (req: Request, res: Response) => {
    try {
      const { state, modelId = 'default', explore = true } = req.body;
      
      const model = models[modelId];
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      const action = model.getAction(state, explore);
      res.json(action);
    } catch (error) {
      console.error('Error getting optimal action:', error);
      res.status(500).json({ error: 'Failed to get optimal action' });
    }
  },

  // Record experience
  recordExperience: (req: Request, res: Response) => {
    try {
      const { state, action, reward, nextState, done, modelId = 'default' } = req.body;
      
      const model = models[modelId];
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }

      model.recordExperience(state, action, reward, nextState, done);
      res.json({ status: 'success' });
    } catch (error) {
      console.error('Error recording experience:', error);
      res.status(500).json({ error: 'Failed to record experience' });
    }
  },

  // Application-specific endpoints
  optimizePricing: async (req: Request, res: Response) => {
    try {
      const { productData, marketData, constraints } = req.body;
      const model = models['pricing'] || models['default'];
      
      if (!model) {
        return res.status(404).json({ error: 'Pricing model not found' });
      }

      const optimalPrice = await model.optimizePricing(productData, marketData, constraints);
      res.json({ optimalPrice });
    } catch (error) {
      console.error('Error optimizing pricing:', error);
      res.status(500).json({ error: 'Failed to optimize pricing' });
    }
  },

  recommendSuppliers: async (req: Request, res: Response) => {
    try {
      const { productRequirements, constraints } = req.body;
      const model = models['supplier'] || models['default'];
      
      if (!model) {
        return res.status(404).json({ error: 'Supplier recommendation model not found' });
      }

      const recommendations = await model.recommendSuppliers(productRequirements, constraints);
      res.json({ recommendations });
    } catch (error) {
      console.error('Error recommending suppliers:', error);
      res.status(500).json({ error: 'Failed to recommend suppliers' });
    }
  },

  optimizeInventory: async (req: Request, res: Response) => {
    try {
      const { inventoryData, demandForecast, constraints } = req.body;
      const model = models['inventory'] || models['default'];
      
      if (!model) {
        return res.status(404).json({ error: 'Inventory optimization model not found' });
      }

      const optimizationResult = await model.optimizeInventory(inventoryData, demandForecast, constraints);
      res.json(optimizationResult);
    } catch (error) {
      console.error('Error optimizing inventory:', error);
      res.status(500).json({ error: 'Failed to optimize inventory' });
    }
  },
};
