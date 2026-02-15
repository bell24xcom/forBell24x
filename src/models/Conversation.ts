import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  channel: 'WHATSAPP' | 'CHATBOT' | 'VOICEBOT';
  messages: Array<{
    type: 'USER' | 'BOT';
    content: string;
    timestamp: Date;
    metadata?: {
      intent?: string;
      confidence?: number;
      entities?: Record<string, any>;
      sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
    };
  }>;
  status: 'ACTIVE' | 'CLOSED' | 'TRANSFERRED';
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  summary?: string;
  feedback?: {
    rating: number;
    comment?: string;
    timestamp: Date;
  };
}

const ConversationSchema = new Schema<IConversation>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  channel: {
    type: String,
    enum: ['WHATSAPP', 'CHATBOT', 'VOICEBOT'],
    required: true
  },
  messages: [{
    type: {
      type: String,
      enum: ['USER', 'BOT'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      intent: String,
      confidence: Number,
      entities: Schema.Types.Mixed,
      sentiment: {
        type: String,
        enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE']
      }
    }
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'CLOSED', 'TRANSFERRED'],
    default: 'ACTIVE'
  },
  assignedTo: {
    type: String,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  },
  summary: {
    type: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    timestamp: Date
  }
});

// Indexes
ConversationSchema.index({ userId: 1, channel: 1 });
ConversationSchema.index({ status: 1 });
ConversationSchema.index({ createdAt: 1 });
ConversationSchema.index({ tags: 1 });

// Middleware
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
ConversationSchema.methods.addMessage = async function(message: {
  type: 'USER' | 'BOT';
  content: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    entities?: Record<string, any>;
    sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  };
}) {
  this.messages.push({
    ...message,
    timestamp: new Date()
  });
  return this.save();
};

ConversationSchema.methods.close = async function(summary?: string) {
  this.status = 'CLOSED';
  this.closedAt = new Date();
  if (summary) {
    this.summary = summary;
  }
  return this.save();
};

ConversationSchema.methods.transfer = async function(assignedTo: string) {
  this.status = 'TRANSFERRED';
  this.assignedTo = assignedTo;
  return this.save();
};

ConversationSchema.methods.addFeedback = async function(rating: number, comment?: string) {
  this.feedback = {
    rating,
    comment,
    timestamp: new Date()
  };
  return this.save();
};

// Static methods
ConversationSchema.statics.findActive = function(userId: string, channel: 'WHATSAPP' | 'CHATBOT' | 'VOICEBOT') {
  return this.findOne({
    userId,
    channel,
    status: 'ACTIVE'
  });
};

ConversationSchema.statics.findByTags = function(tags: string[]) {
  return this.find({
    tags: { $in: tags }
  });
};

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema); 