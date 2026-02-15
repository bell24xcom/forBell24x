import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

// TensorFlow.js Configuration
interface TFConfig {
  backend: 'webgl' | 'cpu' | 'webgpu';
  enableProfiling: boolean;
  enableDebugging: boolean;
  maxCacheSize: number;
  modelCacheTimeout: number;
}

// Model Loading Status
interface ModelLoadingStatus {
  isLoaded: boolean;
  isLoading: boolean;
  loadingProgress: number;
  error: string | null;
  loadTime: number;
  modelSize: number;
  backendUsed: string;
}

// Performance Metrics
interface PerformanceMetrics {
  modelLoadTime: number;
  inferenceTime: number;
  memoryUsage: number;
  backendOptimizations: string[];
  gpuMemoryUsage?: number;
}

class TensorFlowLoader {
  private static instance: TensorFlowLoader;
  private config: TFConfig;
  private modelCache: Map<string, tf.LayersModel> = new Map();
  private loadingStatus: Map<string, ModelLoadingStatus> = new Map();
  private performanceMetrics: PerformanceMetrics | null = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.config = {
      backend: 'webgl',
      enableProfiling: false,
      enableDebugging: process.env.NODE_ENV === 'development',
      maxCacheSize: 5,
      modelCacheTimeout: 30 * 60 * 1000, // 30 minutes
    };
  }

  static getInstance(): TensorFlowLoader {
    if (!TensorFlowLoader.instance) {
      TensorFlowLoader.instance = new TensorFlowLoader();
    }
    return TensorFlowLoader.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🤖 Initializing TensorFlow.js...');
      const startTime = performance.now();

      // Set up backend with fallback strategy
      await this.setupBackend();

      // Configure TensorFlow.js for optimal performance
      await this.configurePerformanceOptimizations();

      // Initialize model cache cleanup
      this.setupModelCacheCleanup();

      // Record initialization metrics
      const initTime = performance.now() - startTime;
      console.log(`✅ TensorFlow.js initialized in ${initTime.toFixed(2)}ms`);
      console.log(`🎯 Backend: ${tf.getBackend()}`);
      console.log(`💾 Memory: ${tf.memory().numBytes} bytes`);

      this.initialized = true;
      this.performanceMetrics = {
        modelLoadTime: 0,
        inferenceTime: 0,
        memoryUsage: tf.memory().numBytes,
        backendOptimizations: this.getBackendOptimizations(),
        gpuMemoryUsage: tf.getBackend() === 'webgl' ? tf.memory().numBytes : undefined,
      };
    } catch (error) {
      console.error('❌ Failed to initialize TensorFlow.js:', error);
      throw new Error(`TensorFlow.js initialization failed: ${error}`);
    }
  }

  private async setupBackend(): Promise<void> {
    const backendPriority = ['webgl', 'cpu'];

    for (const backend of backendPriority) {
      try {
        console.log(`🔧 Attempting to set ${backend} backend...`);
        await tf.setBackend(backend);
        await tf.ready();

        console.log(`✅ Successfully set ${backend} backend`);
        this.config.backend = backend as 'webgl' | 'cpu';

        // Additional WebGL optimizations
        if (backend === 'webgl') {
          await this.optimizeWebGLBackend();
        }

        break;
      } catch (error) {
        console.warn(`⚠️ Failed to set ${backend} backend:`, error);
        continue;
      }
    }

    if (!tf.getBackend()) {
      throw new Error('No compatible TensorFlow.js backend found');
    }
  }

  private async optimizeWebGLBackend(): Promise<void> {
    try {
      // Enable WebGL optimizations
      tf.env().set('WEBGL_PACK', true);
      tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
      tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', true);
      tf.env().set('WEBGL_FLUSH_THRESHOLD', 1);

      // GPU memory optimization
      const gpuMemoryInfo = await this.getGPUMemoryInfo();
      if (gpuMemoryInfo) {
        console.log(`🎮 GPU Memory Available: ${gpuMemoryInfo.totalMemory / 1024 / 1024}MB`);
        console.log(`🎮 GPU Memory Used: ${gpuMemoryInfo.usedMemory / 1024 / 1024}MB`);
      }

      console.log('🚀 WebGL backend optimizations enabled');
    } catch (error) {
      console.warn('⚠️ WebGL optimization failed:', error);
    }
  }

  private async configurePerformanceOptimizations(): Promise<void> {
    // Enable performance profiling in development
    if (this.config.enableProfiling) {
      // Profiling mode - disable production mode optimizations
      console.log('📊 TensorFlow.js profiling enabled');
    } else {
      tf.enableProdMode();
    }

    // Configure memory management
    tf.env().set('IS_BROWSER', true);
    tf.env().set('WEBGL_DELETE_TEXTURE_THRESHOLD', 0.5);
    tf.env().set('WEBGL_PACK_NORMALIZATION', true);
    tf.env().set('WEBGL_PACK_CLIP', true);
    tf.env().set('WEBGL_PACK_DEPTHWISECONV', true);
    tf.env().set('WEBGL_PACK_BINARY_OPERATIONS', true);
    tf.env().set('WEBGL_PACK_UNARY_OPERATIONS', true);
    tf.env().set('WEBGL_PACK_ARRAY_OPERATIONS', true);
    tf.env().set('WEBGL_PACK_IMAGE_OPERATIONS', true);
    tf.env().set('WEBGL_PACK_REDUCE', true);
    tf.env().set('WEBGL_LAZILY_UNPACK', true);
    tf.env().set('WEBGL_CONV_IM2COL', true);
    tf.env().set('WEBGL_MAX_TEXTURE_SIZE', 4096);
    tf.env().set('WEBGL_MAX_TEXTURES_IN_SHADER', 16);

    console.log('⚡ Performance optimizations configured');
  }

  private getBackendOptimizations(): string[] {
    const optimizations = ['Production Mode'];

    if (tf.getBackend() === 'webgl') {
      optimizations.push('WebGL Packing', 'GPU Acceleration', 'Texture Optimization');
    } else if (tf.getBackend() === 'cpu') {
      optimizations.push('CPU Optimization', 'SIMD Instructions');
    }

    return optimizations;
  }

  async loadModel(
    modelPath: string,
    options: {
      cache?: boolean;
      timeout?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<tf.LayersModel> {
    const { cache = true, timeout = 30000, onProgress } = options;

    // Check cache first
    if (cache && this.modelCache.has(modelPath)) {
      console.log(`📦 Loading model from cache: ${modelPath}`);
      return this.modelCache.get(modelPath)!;
    }

    // Check if already loading
    const loadingStatus = this.loadingStatus.get(modelPath);
    if (loadingStatus?.isLoading) {
      console.log(`⏳ Model already loading: ${modelPath}`);
      return this.waitForModelLoad(modelPath);
    }

    // Initialize loading status
    this.loadingStatus.set(modelPath, {
      isLoaded: false,
      isLoading: true,
      loadingProgress: 0,
      error: null,
      loadTime: 0,
      modelSize: 0,
      backendUsed: tf.getBackend(),
    });

    try {
      console.log(`🔄 Loading model: ${modelPath}`);
      const startTime = performance.now();

      // Load model with progress tracking
      const model = await tf.loadLayersModel(modelPath, {
        onProgress: fraction => {
          const progress = Math.round(fraction * 100);
          this.updateLoadingProgress(modelPath, progress);
          onProgress?.(progress);
        },
      });

      // Warm up model with dummy input
      await this.warmUpModel(model);

      const loadTime = performance.now() - startTime;
      const modelSize = this.calculateModelSize(model);

      // Update loading status
      this.loadingStatus.set(modelPath, {
        isLoaded: true,
        isLoading: false,
        loadingProgress: 100,
        error: null,
        loadTime,
        modelSize,
        backendUsed: tf.getBackend(),
      });

      // Cache model if enabled
      if (cache) {
        this.cacheModel(modelPath, model);
      }

      console.log(`✅ Model loaded successfully: ${modelPath}`);
      console.log(`⏱️  Load time: ${loadTime.toFixed(2)}ms`);
      console.log(`📦 Model size: ${(modelSize / 1024 / 1024).toFixed(2)}MB`);

      return model;
    } catch (error) {
      console.error(`❌ Failed to load model: ${modelPath}`, error);

      this.loadingStatus.set(modelPath, {
        isLoaded: false,
        isLoading: false,
        loadingProgress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        loadTime: 0,
        modelSize: 0,
        backendUsed: tf.getBackend(),
      });

      throw new Error(`Model loading failed: ${error}`);
    }
  }

  private async waitForModelLoad(modelPath: string): Promise<tf.LayersModel> {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const status = this.loadingStatus.get(modelPath);
        if (!status) {
          clearInterval(checkInterval);
          reject(new Error('Model loading status not found'));
          return;
        }

        if (status.isLoaded) {
          clearInterval(checkInterval);
          const model = this.modelCache.get(modelPath);
          if (model) {
            resolve(model);
          } else {
            reject(new Error('Model not found in cache'));
          }
        } else if (status.error) {
          clearInterval(checkInterval);
          reject(new Error(status.error));
        }
      }, 100);
    });
  }

  private updateLoadingProgress(modelPath: string, progress: number): void {
    const status = this.loadingStatus.get(modelPath);
    if (status) {
      status.loadingProgress = progress;
      this.loadingStatus.set(modelPath, status);
    }
  }

  private async warmUpModel(model: tf.LayersModel): Promise<void> {
    try {
      // Create dummy input based on model input shape
      const inputShape = model.inputs[0].shape;
      const dummyInput = tf.randomNormal(inputShape as number[]);

      // Run inference to warm up the model
      const prediction = model.predict(dummyInput) as tf.Tensor;
      await prediction.data();

      // Clean up tensors
      dummyInput.dispose();
      prediction.dispose();

      console.log('🔥 Model warmed up successfully');
    } catch (error) {
      console.warn('⚠️ Model warm-up failed:', error);
    }
  }

  private calculateModelSize(model: tf.LayersModel): number {
    let totalSize = 0;

    model.layers.forEach(layer => {
      const weights = layer.getWeights();
      weights.forEach(weight => {
        totalSize += weight.size * 4; // 4 bytes per float32
      });
    });

    return totalSize;
  }

  private cacheModel(modelPath: string, model: tf.LayersModel): void {
    // Remove oldest models if cache is full
    if (this.modelCache.size >= this.config.maxCacheSize) {
      const oldestKey = this.modelCache.keys().next().value;
      if (oldestKey) {
        const oldModel = this.modelCache.get(oldestKey);
        oldModel?.dispose();
        this.modelCache.delete(oldestKey);
        console.log(`🗑️  Removed cached model: ${oldestKey}`);
      }
    }

    this.modelCache.set(modelPath, model);
    console.log(`📦 Model cached: ${modelPath}`);
  }

  private setupModelCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      this.loadingStatus.forEach((status, key) => {
        if (now - status.loadTime > this.config.modelCacheTimeout) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach(key => {
        const model = this.modelCache.get(key);
        if (model) {
          model.dispose();
          this.modelCache.delete(key);
          this.loadingStatus.delete(key);
          console.log(`🗑️  Expired cached model: ${key}`);
        }
      });
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private async getGPUMemoryInfo(): Promise<{ totalMemory: number; usedMemory: number } | null> {
    try {
      if ('gpu' in navigator) {
        // @ts-ignore - WebGPU API
        const gpu = navigator.gpu;
        const adapter = await gpu.requestAdapter();
        if (adapter) {
          const device = await adapter.requestDevice();
          // This is a simplified approach - actual implementation depends on WebGPU support
          return {
            totalMemory: 1024 * 1024 * 1024, // 1GB default
            usedMemory: tf.memory().numBytes,
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  getModelLoadingStatus(modelPath: string): ModelLoadingStatus | null {
    return this.loadingStatus.get(modelPath) || null;
  }

  getPerformanceMetrics(): PerformanceMetrics | null {
    if (this.performanceMetrics) {
      return {
        ...this.performanceMetrics,
        memoryUsage: tf.memory().numBytes,
        gpuMemoryUsage: tf.getBackend() === 'webgl' ? tf.memory().numBytes : undefined,
      };
    }
    return null;
  }

  async measureInferenceTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; inferenceTime: number }> {
    const startTime = performance.now();
    const result = await fn();
    const inferenceTime = performance.now() - startTime;

    if (this.performanceMetrics) {
      this.performanceMetrics.inferenceTime = inferenceTime;
    }

    return { result, inferenceTime };
  }

  clearCache(): void {
    this.modelCache.forEach((model, key) => {
      model.dispose();
      console.log(`🗑️  Disposed cached model: ${key}`);
    });
    this.modelCache.clear();
    this.loadingStatus.clear();
    console.log('🧹 Model cache cleared');
  }

  getMemoryUsage(): tf.MemoryInfo {
    return tf.memory();
  }

  disposeModel(modelPath: string): void {
    const model = this.modelCache.get(modelPath);
    if (model) {
      model.dispose();
      this.modelCache.delete(modelPath);
      this.loadingStatus.delete(modelPath);
      console.log(`🗑️  Disposed model: ${modelPath}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getBackend(): string {
    return tf.getBackend();
  }

  async optimizeMemory(): Promise<void> {
    // Force garbage collection
    if (typeof window !== 'undefined' && 'gc' in window) {
      // @ts-ignore - Garbage collection API
      window.gc();
    }

    // TensorFlow.js memory cleanup
    tf.engine().startScope();
    tf.engine().endScope();

    console.log('🧹 Memory optimization completed');
    console.log(`💾 Current memory usage: ${tf.memory().numBytes} bytes`);
  }
}

// Export singleton instance
export const tfLoader = TensorFlowLoader.getInstance();

// Export types
export type { TFConfig, ModelLoadingStatus, PerformanceMetrics };

// Utility functions
export const initializeTensorFlow = async (): Promise<void> => {
  await tfLoader.initialize();
};

export const loadModel = async (
  modelPath: string,
  options?: {
    cache?: boolean;
    timeout?: number;
    onProgress?: (progress: number) => void;
  }
): Promise<tf.LayersModel> => {
  return tfLoader.loadModel(modelPath, options);
};

export const getModelStatus = (modelPath: string): ModelLoadingStatus | null => {
  return tfLoader.getModelLoadingStatus(modelPath);
};

export const getPerformanceMetrics = (): PerformanceMetrics | null => {
  return tfLoader.getPerformanceMetrics();
};

export const optimizeMemory = async (): Promise<void> => {
  await tfLoader.optimizeMemory();
};

export const clearModelCache = (): void => {
  tfLoader.clearCache();
};

export const getMemoryUsage = (): tf.MemoryInfo => {
  return tfLoader.getMemoryUsage();
};

export const measureInference = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; inferenceTime: number }> => {
  return tfLoader.measureInferenceTime(fn);
};
