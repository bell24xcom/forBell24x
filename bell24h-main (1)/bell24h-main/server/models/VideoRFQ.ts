import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoRFQ extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  requirements: string[];
  budget: number;
  videoPublicId: string;
  videoUrl: string;
  videoDuration: number;
  status: 'draft' | 'processing' | 'active' | 'matched' | 'completed' | 'cancelled';
  matches: mongoose.Types.ObjectId[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoRFQSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  videoPublicId: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoDuration: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'active', 'matched', 'completed', 'cancelled'],
    default: 'draft'
  },
  matches: [{
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
VideoRFQSchema.index({ userId: 1, status: 1 });
VideoRFQSchema.index({ category: 1 });
VideoRFQSchema.index({ createdAt: -1 });

// Virtual populate
VideoRFQSchema.virtual('buyer', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Methods
VideoRFQSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

VideoRFQSchema.methods.addMatch = async function(supplierId: mongoose.Types.ObjectId) {
  if (!this.matches.includes(supplierId)) {
    this.matches.push(supplierId);
    this.status = 'matched';
    return this.save();
  }
  return this;
};

VideoRFQSchema.methods.removeMatch = async function(supplierId: mongoose.Types.ObjectId) {
  this.matches = this.matches.filter(id => !id.equals(supplierId));
  if (this.matches.length === 0) {
    this.status = 'active';
  }
  return this.save();
};

// Pre-save hooks
VideoRFQSchema.pre('save', function(next) {
  if (this.isNew) {
    this.status = 'processing';
  }
  next();
});

export const VideoRFQModel = mongoose.model<IVideoRFQ>('VideoRFQ', VideoRFQSchema); 