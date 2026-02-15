import Joi from 'joi';

export const createVideoSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(1000).optional(),
  url: Joi.string().uri().required(),
  category: Joi.string().valid('marketing', 'training', 'product', 'documentation', 'other').default('other'),
  duration: Joi.number().positive().optional(),
  resolution: Joi.string().valid('480p', '720p', '1080p', '4k').optional(),
  format: Joi.string().valid('mp4', 'avi', 'mov', 'mkv', 'webm').optional(),
  size: Joi.number().positive().optional(),
  metadata: Joi.object({
    fps: Joi.number().positive().optional(),
    bitrate: Joi.number().positive().optional(),
    codec: Joi.string().optional(),
    aspectRatio: Joi.string().optional()
  }).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  isPublic: Joi.boolean().default(false)
});

export const videoAnalysisSchema = Joi.object({
  analysisType: Joi.string().valid('content', 'objects', 'faces', 'text', 'sentiment', 'audio', 'full').required(),
  options: Joi.object({
    detectObjects: Joi.boolean().default(true),
    extractText: Joi.boolean().default(true),
    analyzeSentiment: Joi.boolean().default(true),
    detectFaces: Joi.boolean().default(true),
    transcribeAudio: Joi.boolean().default(true),
    language: Joi.string().valid('en', 'hi', 'es', 'fr', 'auto').default('auto'),
    confidence: Joi.number().min(0.1).max(1.0).default(0.8),
    maxResults: Joi.number().integer().min(1).max(100).default(10)
  }).optional(),
  callbackUrl: Joi.string().uri().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal')
});

export const transcodeVideoSchema = Joi.object({
  format: Joi.string().valid('mp4', 'avi', 'mov', 'mkv', 'webm').required(),
  resolution: Joi.string().valid('480p', '720p', '1080p', '4k').optional(),
  quality: Joi.string().valid('low', 'medium', 'high', 'ultra').default('medium'),
  bitrate: Joi.number().positive().optional(),
  fps: Joi.number().positive().optional(),
  codec: Joi.string().valid('h264', 'h265', 'vp9', 'av1').default('h264'),
  audioCodec: Joi.string().valid('aac', 'mp3', 'opus').default('aac'),
  audioBitrate: Joi.number().positive().optional(),
  callbackUrl: Joi.string().uri().optional()
});

export const videoAnnotationSchema = Joi.object({
  annotations: Joi.array().items(Joi.object({
    type: Joi.string().valid('text', 'box', 'polygon', 'line', 'point').required(),
    content: Joi.string().max(500).when('type', {
      is: 'text',
      then: Joi.required()
    }),
    timestamp: Joi.number().min(0).when('type', {
      is: Joi.string().valid('text', 'box', 'polygon', 'line', 'point'),
      then: Joi.required()
    }),
    duration: Joi.number().positive().when('type', {
      is: Joi.string().valid('text', 'box', 'polygon', 'line'),
      then: Joi.required()
    }),
    position: Joi.object({
      x: Joi.number().min(0).max(100).when('type', {
        is: Joi.string().valid('text', 'box', 'polygon', 'line', 'point'),
        then: Joi.required()
      }),
      y: Joi.number().min(0).max(100).when('type', {
        is: Joi.string().valid('text', 'box', 'polygon', 'line', 'point'),
        then: Joi.required()
      }),
      width: Joi.number().positive().when('type', {
        is: Joi.string().valid('box', 'polygon'),
        then: Joi.required()
      }),
      height: Joi.number().positive().when('type', {
        is: Joi.string().valid('box', 'polygon'),
        then: Joi.required()
      }),
      points: Joi.array().items(Joi.object({
        x: Joi.number().min(0).max(100).required(),
        y: Joi.number().min(0).max(100).required()
      })).when('type', {
        is: 'polygon',
        then: Joi.required().min(3)
      })
    }).required(),
    style: Joi.object({
      color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#FF0000'),
      fontSize: Joi.number().positive().default(16),
      opacity: Joi.number().min(0).max(1).default(1),
      thickness: Joi.number().positive().default(2)
    }).optional()
  })).min(1).required()
});

export const captionGenerationSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'es', 'fr', 'auto').default('en'),
  format: Joi.string().valid('srt', 'vtt', 'txt').default('srt'),
  includeTimestamps: Joi.boolean().default(true),
  maxLineLength: Joi.number().integer().min(10).max(100).default(42),
  confidence: Joi.number().min(0.1).max(1.0).default(0.8),
  speakerDiarization: Joi.boolean().default(false),
  customVocabulary: Joi.array().items(Joi.string()).optional()
});

export const videoCompressionSchema = Joi.object({
  quality: Joi.string().valid('low', 'medium', 'high').required(),
  format: Joi.string().valid('mp4', 'webm').default('mp4'),
  targetSize: Joi.number().positive().optional(),
  targetBitrate: Joi.number().positive().optional(),
  resolution: Joi.string().valid('480p', '720p', '1080p').optional(),
  maintainAspectRatio: Joi.boolean().default(true),
  removeAudio: Joi.boolean().default(false)
});

export const watermarkSchema = Joi.object({
  text: Joi.string().max(100).when('type', {
    is: 'text',
    then: Joi.required()
  }),
  image: Joi.string().uri().when('type', {
    is: 'image',
    then: Joi.required()
  }),
  type: Joi.string().valid('text', 'image').required(),
  position: Joi.string().valid('top-left', 'top-right', 'bottom-left', 'bottom-right', 'center').default('bottom-right'),
  opacity: Joi.number().min(0).max(1).default(0.7),
  size: Joi.number().min(0.1).max(1.0).default(0.1),
  startTime: Joi.number().min(0).optional(),
  endTime: Joi.number().positive().optional(),
  style: Joi.object({
    fontFamily: Joi.string().default('Arial'),
    fontSize: Joi.number().positive().default(24),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
    backgroundColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
  }).optional()
});

export const videoTrimSchema = Joi.object({
  startTime: Joi.number().min(0).required(),
  endTime: Joi.number().positive().required(),
  fadeIn: Joi.number().min(0).max(5).default(0),
  fadeOut: Joi.number().min(0).max(5).default(0),
  maintainQuality: Joi.boolean().default(true)
});

export const batchProcessSchema = Joi.object({
  operation: Joi.string().valid('transcode', 'compress', 'analyze', 'add_watermark', 'generate_captions').required(),
  videos: Joi.array().items(Joi.string()).min(1).required(),
  options: Joi.object().required(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
  callbackUrl: Joi.string().uri().optional()
});

export function validateCreateVideo(req: any, res: any, next: any) {
  const { error } = createVideoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateVideoAnalysis(req: any, res: any, next: any) {
  const { error } = videoAnalysisSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateTranscodeVideo(req: any, res: any, next: any) {
  const { error } = transcodeVideoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateVideoAnnotation(req: any, res: any, next: any) {
  const { error } = videoAnnotationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateCaptionGeneration(req: any, res: any, next: any) {
  const { error } = captionGenerationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateVideoCompression(req: any, res: any, next: any) {
  const { error } = videoCompressionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateWatermark(req: any, res: any, next: any) {
  const { error } = watermarkSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateVideoTrim(req: any, res: any, next: any) {
  const { error } = videoTrimSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
}

export function validateBatchProcess(req: any, res: any, next: any) {
  const { error } = batchProcessSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: error.details[0].message 
    });
  }
  next();
} 